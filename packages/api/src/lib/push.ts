import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { db } from '@repo/db';

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
});

interface SendPushNotificationParams {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Send a push notification to all registered devices for a user
 */
export async function sendPushNotification({
  userId,
  title,
  body,
  data = {},
}: SendPushNotificationParams): Promise<void> {
  try {
    // Get all push tokens for the user
    const pushTokens = await db.pushToken.findMany({
      where: { userId },
      select: { token: true },
    });

    if (pushTokens.length === 0) {
      console.log(`No push tokens found for user ${userId}`);
      return;
    }

    // Filter out invalid tokens
    const validTokens = pushTokens
      .map((t) => t.token)
      .filter((token) => Expo.isExpoPushToken(token));

    if (validTokens.length === 0) {
      console.log(`No valid Expo push tokens found for user ${userId}`);
      return;
    }

    // Create push messages
    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
      channelId: 'default',
    }));

    // Send push notifications in chunks
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
      }
    }

    // Check for errors in tickets
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      if (ticket.status === 'error') {
        console.error(
          `Push notification error for token ${validTokens[i]}:`,
          ticket.message
        );
        
        // If the token is invalid, remove it from the database
        if (
          ticket.details?.error === 'DeviceNotRegistered' ||
          ticket.message?.includes('not registered')
        ) {
          await db.pushToken.delete({
            where: { token: validTokens[i] },
          }).catch(err => {
            console.error('Error deleting invalid push token:', err);
          });
        }
      }
    }

    console.log(`Sent push notifications to ${validTokens.length} device(s) for user ${userId}`);
  } catch (error) {
    console.error('Error sending push notification:', error);
    // Don't throw - we don't want push failures to break the app
  }
}

/**
 * Test if push notifications are configured
 */
export function isPushNotificationConfigured(): boolean {
  return !!process.env.EXPO_ACCESS_TOKEN;
}
