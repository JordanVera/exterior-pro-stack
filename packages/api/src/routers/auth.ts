import chalk from 'chalk';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import {
  sendCodeInput,
  verifyCodeInput,
  selectRoleInput,
  customerOnboardingInput,
  providerOnboardingInput,
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
        chalk.cyanBright(`Your Exterior Pro verification code is: ${code}`),
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
      include: { customerProfile: true, providerProfile: true },
    });

    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    return {
      id: user.id,
      phone: user.phone,
      role: user.role,
      verified: user.verified,
      hasProfile: !!(user.customerProfile || user.providerProfile),
      customerProfile: user.customerProfile,
      providerProfile: user.providerProfile,
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
        },
        create: {
          userId: ctx.user.userId,
          businessName: input.businessName,
          description: input.description,
          serviceArea: input.serviceArea,
        },
      });

      return profile;
    }),
});
