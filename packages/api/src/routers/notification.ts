import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { registerPushTokenInput } from "@repo/validators";

export const notificationRouter = router({
  /** List notifications for the current user */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().cuid().optional(),
        unreadOnly: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const items = await ctx.db.notification.findMany({
        where: {
          userId: ctx.user.userId,
          ...(input?.unreadOnly ? { read: false } : {}),
        },
        take: limit + 1,
        ...(input?.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        orderBy: { createdAt: "desc" },
      });

      let nextCursor: string | undefined;
      if (items.length > limit) {
        const nextItem = items.pop()!;
        nextCursor = nextItem.id;
      }

      return { items, nextCursor };
    }),

  /** Get unread notification count */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.notification.count({
      where: { userId: ctx.user.userId, read: false },
    });
    return { count };
  }),

  /** Mark a notification as read */
  markRead: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.notification.updateMany({
        where: { id: input.id, userId: ctx.user.userId },
        data: { read: true },
      });
      return { success: true };
    }),

  /** Mark all notifications as read */
  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.notification.updateMany({
      where: { userId: ctx.user.userId, read: false },
      data: { read: true },
    });
    return { success: true };
  }),

  /** Register a push token */
  registerPushToken: protectedProcedure
    .input(registerPushTokenInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.pushToken.upsert({
        where: { token: input.token },
        update: { userId: ctx.user.userId, platform: input.platform },
        create: {
          userId: ctx.user.userId,
          token: input.token,
          platform: input.platform,
        },
      });
    }),
});
