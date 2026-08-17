import chalk from 'chalk';
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
import { sendSMS, generateVerificationCode } from '../lib/sms';

export const authRouter = router({
  /** Send a 6-digit verification code via SMS */
  sendCode: publicProcedure
    .input(sendCodeInput)
    .mutation(async ({ ctx, input }) => {
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Invalidate previous unused codes for this phone
      await ctx.db.verificationCode.updateMany({
        where: { phone: input.phone, used: false },
        data: { used: true },
      });

      await ctx.db.verificationCode.create({
        data: {
          phone: input.phone,
          code,
          expiresAt,
        },
      });

      await sendSMS(
        input.phone,
        chalk.cyanBright.bold(
          `Your Exterior Pro verification code is: ${chalk.yellowBright.bold(code)} - User Type: ${chalk.yellowBright.bold(
            (
              await ctx.db.user.findUnique({
                where: { phone: input.phone },
                select: { role: true },
              })
            )?.role ?? 'unknown',
          )}`,
        ),
      );

      return { success: true };
    }),

  /** Verify code and return JWT + user */
  verifyCode: publicProcedure
    .input(verifyCodeInput)
    .mutation(async ({ ctx, input }) => {
      const verification = await ctx.db.verificationCode.findFirst({
        where: {
          phone: input.phone,
          code: input.code,
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

      // Mark code as used
      await ctx.db.verificationCode.update({
        where: { id: verification.id },
        data: { used: true },
      });

      // Find or create user
      let user = await ctx.db.user.findUnique({
        where: { phone: input.phone },
        include: { customerProfile: true, providerProfile: true },
      });

      let isNewUser = false;

      if (!user) {
        user = await ctx.db.user.create({
          data: {
            phone: input.phone,
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
        where: { phone: input.phone },
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
      const profile = await ctx.db.customerProfile.upsert({
        where: { userId: ctx.user.userId },
        update: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email || undefined,
        },
        create: {
          userId: ctx.user.userId,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email || undefined,
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
      const profile = await ctx.db.providerProfile.upsert({
        where: { userId: ctx.user.userId },
        update: {
          businessName: input.businessName,
          description: input.description,
          serviceArea: input.serviceArea,
          email: input.email || undefined,
        },
        create: {
          userId: ctx.user.userId,
          businessName: input.businessName,
          description: input.description,
          serviceArea: input.serviceArea,
          email: input.email || undefined,
        },
      });

      return profile;
    }),
});
