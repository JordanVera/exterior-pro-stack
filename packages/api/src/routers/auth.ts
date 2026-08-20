import { TRPCError } from '@trpc/server';
import {
  router,
  publicProcedure,
  protectedProcedure,
  customerProcedure,
} from '../trpc';
import {
  sendCodeInput,
  verifyCodeInput,
  selectRoleInput,
  customerOnboardingInput,
  providerOnboardingInput,
  updateCustomerProfileInput,
} from '@repo/validators';
import { signToken } from '../lib/jwt';
import { generateVerificationCode } from '../lib/otp';
import { sendVerificationEmail } from '../lib/email';

const CODE_TTL_MINUTES = 10;
/** Minimum gap between two codes for the same email. */
const RESEND_COOLDOWN_SECONDS = 30;
const SENDS_PER_EMAIL_PER_HOUR = 5;
const SENDS_PER_IP_PER_HOUR = 15;
/** Wrong guesses allowed against a single code before it is burned. */
const MAX_VERIFY_ATTEMPTS = 5;

export const authRouter = router({
  /** Send a 6-digit verification code via email */
  sendCode: publicProcedure
    .input(sendCodeInput)
    .mutation(async ({ ctx, input }) => {
      const now = Date.now();
      const oneHourAgo = new Date(now - 60 * 60 * 1000);

      // Throttle by email. An unthrottled endpoint is both a spam vector
      // and a way to burn through the Resend quota.
      const [recent, sendsThisHour] = await Promise.all([
        ctx.db.verificationCode.findFirst({
          where: { email: input.email },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        }),
        ctx.db.verificationCode.count({
          where: { email: input.email, createdAt: { gt: oneHourAgo } },
        }),
      ]);

      if (recent) {
        const elapsedSeconds = (now - recent.createdAt.getTime()) / 1000;
        if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: `Please wait ${Math.ceil(
              RESEND_COOLDOWN_SECONDS - elapsedSeconds,
            )} seconds before requesting another code.`,
          });
        }
      }

      if (sendsThisHour >= SENDS_PER_EMAIL_PER_HOUR) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message:
            'Too many verification codes requested for this email. Try again in an hour.',
        });
      }

      if (ctx.ip) {
        const sendsFromIp = await ctx.db.verificationCode.count({
          where: { ip: ctx.ip, createdAt: { gt: oneHourAgo } },
        });
        if (sendsFromIp >= SENDS_PER_IP_PER_HOUR) {
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many verification codes requested. Try again later.',
          });
        }
      }

      const code = generateVerificationCode();
      const expiresAt = new Date(now + CODE_TTL_MINUTES * 60 * 1000);

      await ctx.db.verificationCode.updateMany({
        where: { email: input.email, used: false },
        data: { used: true },
      });

      await ctx.db.verificationCode.create({
        data: {
          email: input.email,
          code,
          expiresAt,
          ip: ctx.ip,
        },
      });

      await sendVerificationEmail({
        to: input.email,
        code,
        ttlMinutes: CODE_TTL_MINUTES,
      });

      return { success: true };
    }),

  /** Verify code and return JWT + user */
  verifyCode: publicProcedure
    .input(verifyCodeInput)
    .mutation(async ({ ctx, input }) => {
      // Look the code up by email rather than by email + code, so a wrong guess
      // still resolves to a row we can count attempts against. sendCode
      // invalidates prior codes, so at most one unused code exists per address.
      const verification = await ctx.db.verificationCode.findFirst({
        where: {
          email: input.email,
          used: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!verification) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired verification code',
        });
      }

      if (verification.attempts >= MAX_VERIFY_ATTEMPTS) {
        await ctx.db.verificationCode.update({
          where: { id: verification.id },
          data: { used: true },
        });
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many incorrect attempts. Request a new code.',
        });
      }

      if (verification.code !== input.code) {
        await ctx.db.verificationCode.update({
          where: { id: verification.id },
          data: { attempts: { increment: 1 } },
        });
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired verification code',
        });
      }

      await ctx.db.verificationCode.update({
        where: { id: verification.id },
        data: { used: true },
      });

      let user = await ctx.db.user.findUnique({
        where: { email: input.email },
        include: { customerProfile: true, providerProfile: true },
      });

      let isNewUser = false;

      if (!user) {
        user = await ctx.db.user.create({
          data: {
            email: input.email,
            verified: true,
          },
          include: { customerProfile: true, providerProfile: true },
        });
        isNewUser = true;
      } else if (!user.verified) {
        user = await ctx.db.user.update({
          where: { id: user.id },
          data: { verified: true },
          include: { customerProfile: true, providerProfile: true },
        });
      }

      const crewMember = await ctx.db.crewMember.findFirst({
        where: { email: input.email },
      });

      if (crewMember && (user.role == null || user.role === 'CREW')) {
        user = await ctx.db.user.update({
          where: { id: user.id },
          data: { role: 'CREW' },
          include: { customerProfile: true, providerProfile: true },
        });
        if (crewMember.userId !== user.id) {
          await ctx.db.crewMember.update({
            where: { id: crewMember.id },
            data: { userId: user.id },
          });
        }
      }

      const token = await signToken({
        userId: user.id,
        role: user.role ?? 'CUSTOMER',
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          verified: user.verified,
          isNewUser,
          hasProfile: !!(user.customerProfile || user.providerProfile),
        },
      };
    }),

  /** Get the current authenticated user */
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.userId },
      include: {
        customerProfile: true,
        providerProfile: true,
        crewMemberships: {
          include: {
            crew: {
              include: {
                provider: { select: { businessName: true } },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    const crewMember = user.crewMemberships[0] ?? null;

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verified: user.verified,
      createdAt: user.createdAt,
      hasProfile: !!(user.customerProfile || user.providerProfile),
      customerProfile: user.customerProfile,
      providerProfile: user.providerProfile,
      crewMember: crewMember
        ? {
            id: crewMember.id,
            name: crewMember.name,
            role: crewMember.role,
            crew: {
              id: crewMember.crew.id,
              name: crewMember.crew.name,
              businessName: crewMember.crew.provider.businessName,
            },
          }
        : null,
    };
  }),

  /** Select a role (for new users) */
  selectRole: protectedProcedure
    .input(selectRoleInput)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.userId },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      if (user.role) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Role already selected',
        });
      }

      const updated = await ctx.db.user.update({
        where: { id: ctx.user.userId },
        data: { role: input.role },
      });

      // Re-sign token with new role
      const token = await signToken({
        userId: updated.id,
        role: updated.role!,
      });

      return { token, role: updated.role };
    }),

  /** Complete customer onboarding */
  completeCustomerOnboarding: protectedProcedure
    .input(customerOnboardingInput)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.userId },
        select: { email: true },
      });
      const email = input.email || user?.email || undefined;

      const profile = await ctx.db.customerProfile.upsert({
        where: { userId: ctx.user.userId },
        update: {
          firstName: input.firstName,
          lastName: input.lastName,
          email,
        },
        create: {
          userId: ctx.user.userId,
          firstName: input.firstName,
          lastName: input.lastName,
          email,
        },
      });

      return profile;
    }),

  /** Customer: update name and email after onboarding */
  updateCustomerProfile: customerProcedure
    .input(updateCustomerProfileInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.customerProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      return ctx.db.customerProfile.update({
        where: { userId: ctx.user.userId },
        data: {
          ...(input.firstName !== undefined
            ? { firstName: input.firstName }
            : {}),
          ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
          ...(input.email !== undefined ? { email: input.email || null } : {}),
        },
      });
    }),

  /** Complete provider onboarding */
  completeProviderOnboarding: protectedProcedure
    .input(providerOnboardingInput)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.userId },
        select: { email: true },
      });
      const email = input.email || user?.email || undefined;

      const profile = await ctx.db.providerProfile.upsert({
        where: { userId: ctx.user.userId },
        update: {
          businessName: input.businessName,
          description: input.description,
          serviceArea: input.serviceArea,
          email,
        },
        create: {
          userId: ctx.user.userId,
          businessName: input.businessName,
          description: input.description,
          serviceArea: input.serviceArea,
          email,
        },
      });

      return profile;
    }),
});
