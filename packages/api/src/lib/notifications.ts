import { db, NotificationType } from '@repo/db';
import { sendSMS } from './sms';
import { sendPushNotification } from './push';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  sendSms?: boolean;
  sendPush?: boolean;
  data?: Record<string, any>;
}

/**
 * Create an in-app notification and optionally send SMS/push notifications.
 */
export async function createNotification({
  userId,
  type,
  title,
  body,
  sendSms: shouldSendSms = false,
  sendPush: shouldSendPush = true,
  data = {},
}: CreateNotificationParams) {
  // Create in-app notification
  const notification = await db.notification.create({
    data: { userId, type, title, body },
  });

  // Send push notification (default enabled)
  if (shouldSendPush) {
    try {
      await sendPushNotification({
        userId,
        title,
        body,
        data: { notificationId: notification.id, type, ...data },
      });
    } catch (err) {
      console.error('Failed to send push notification:', err);
    }
  }

  // Optionally send SMS
  if (shouldSendSms) {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { phone: true },
      });

      if (user?.phone) {
        await sendSMS(user.phone, `${title}: ${body}`);
      }
    } catch (err) {
      console.error('Failed to send SMS notification:', err);
    }
  }

  return notification;
}

// ─── Convenience helpers for common notification events ─────────────────────

/** Notify providers that a new job is available in their area */
export async function notifyNewJobAvailable(
  providerId: string,
  serviceName: string,
  address: string,
) {
  return createNotification({
    userId: providerId,
    type: 'NEW_JOB_AVAILABLE',
    title: 'New Job Available',
    body: `New ${serviceName} job at ${address}. Submit your bid!`,
    sendSms: true,
  });
}

/** Notify customer that a provider submitted a bid */
export async function notifyBidReceived(
  customerId: string,
  providerName: string,
  serviceName: string,
) {
  return createNotification({
    userId: customerId,
    type: 'BID_RECEIVED',
    title: 'New Bid Received',
    body: `${providerName} submitted a bid for your ${serviceName} job.`,
    sendSms: true,
  });
}

/** Notify provider that their bid was accepted */
export async function notifyBidAccepted(
  providerId: string,
  serviceName: string,
) {
  return createNotification({
    userId: providerId,
    type: 'BID_ACCEPTED',
    title: 'Bid Accepted',
    body: `Your bid for ${serviceName} has been accepted! You can now schedule the job.`,
    sendSms: true,
  });
}

/** Notify customer of job scheduled */
export async function notifyJobScheduled(
  customerId: string,
  serviceName: string,
  date: string,
  time?: string,
) {
  return createNotification({
    userId: customerId,
    type: 'JOB_SCHEDULED',
    title: 'Job Scheduled',
    body: `Your ${serviceName} job is scheduled for ${date}${time ? ` at ${time}` : ''}.`,
    sendSms: true,
  });
}

/** Notify customer that job is in progress */
export async function notifyJobInProgress(
  customerId: string,
  serviceName: string,
) {
  return createNotification({
    userId: customerId,
    type: 'JOB_IN_PROGRESS',
    title: 'Job In Progress',
    body: `Your ${serviceName} job has started!`,
    sendSms: true,
  });
}

/** Notify customer that job is completed */
export async function notifyJobCompleted(
  customerId: string,
  serviceName: string,
) {
  return createNotification({
    userId: customerId,
    type: 'JOB_COMPLETED',
    title: 'Job Completed',
    body: `Your ${serviceName} job is complete! Rate the crew in the app.`,
    sendSms: true,
  });
}

/** Notify a provider that a customer left a review */
export async function notifyReviewReceived(
  providerId: string,
  serviceName: string,
  rating: number,
) {
  return createNotification({
    userId: providerId,
    type: 'REVIEW_RECEIVED',
    title: 'New review',
    body: `A customer rated your ${serviceName} job ${rating} out of 5.`,
  });
}

/** Notify a provider that a job they bid on was cancelled */
export async function notifyJobCancelled(
  providerId: string,
  serviceName: string,
) {
  return createNotification({
    userId: providerId,
    type: 'JOB_CANCELLED',
    title: 'Job Cancelled',
    body: `The ${serviceName} job you bid on was cancelled by the customer.`,
  });
}

/** Notify provider of a job reminder */
export async function notifyJobReminder(
  providerId: string,
  serviceName: string,
  address: string,
  date: string,
) {
  return createNotification({
    userId: providerId,
    type: 'JOB_REMINDER',
    title: 'Job Reminder',
    body: `Reminder: ${serviceName} at ${address} on ${date}.`,
    sendSms: true,
  });
}

/** Notify admin of new provider signup */
export async function notifyNewProviderSignup(
  adminId: string,
  businessName: string,
) {
  return createNotification({
    userId: adminId,
    type: 'NEW_PROVIDER_SIGNUP',
    title: 'New Provider Signup',
    body: `${businessName} has signed up and is pending verification.`,
  });
}

/** Notify customer of subscription created */
export async function notifySubscriptionCreated(
  customerId: string,
  planName: string,
) {
  return createNotification({
    userId: customerId,
    type: 'SUBSCRIPTION_CREATED',
    title: 'Subscription Created',
    body: `You've been subscribed to the ${planName} plan! Recurring services will be scheduled automatically.`,
    sendSms: true,
  });
}

/** Notify provider that their bid was declined */
export async function notifyBidDeclined(
  providerId: string,
  serviceName: string,
) {
  return createNotification({
    userId: providerId,
    type: 'BID_DECLINED',
    title: 'Bid Declined',
    body: `Your bid for ${serviceName} was declined by the customer.`,
  });
}

/** Notify customer when schedule changes */
export async function notifyScheduleChange(
  customerId: string,
  serviceName: string,
  newDate: string,
  newTime?: string,
) {
  return createNotification({
    userId: customerId,
    type: 'SCHEDULE_CHANGE',
    title: 'Schedule Updated',
    body: `Your ${serviceName} job has been rescheduled to ${newDate}${newTime ? ` at ${newTime}` : ''}.`,
    sendSms: true,
  });
}

/** Notify customer that subscription was renewed */
export async function notifySubscriptionRenewed(
  customerId: string,
  planName: string,
) {
  return createNotification({
    userId: customerId,
    type: 'SUBSCRIPTION_RENEWED',
    title: 'Subscription Renewed',
    body: `Your ${planName} subscription has been renewed successfully.`,
  });
}

/** Notify customer that subscription was cancelled */
export async function notifySubscriptionCancelled(
  customerId: string,
  planName: string,
) {
  return createNotification({
    userId: customerId,
    type: 'SUBSCRIPTION_CANCELLED',
    title: 'Subscription Cancelled',
    body: `Your ${planName} subscription has been cancelled.`,
    sendSms: true,
  });
}

/** Notify a job participant of a new in-app message. Push only — not SMS. */
export async function notifyJobMessage(
  userId: string,
  senderName: string,
  serviceName: string,
  preview: string,
  jobId: string,
) {
  const clipped =
    preview.length > 80 ? `${preview.slice(0, 77).trimEnd()}…` : preview;

  return createNotification({
    userId,
    type: 'JOB_MESSAGE',
    title: `${senderName} · ${serviceName}`,
    body: clipped,
    sendSms: false,
    data: { jobId, type: 'JOB_MESSAGE' },
  });
}

/** Notify provider that payout was sent */
export async function notifyPayoutSent(providerId: string, amount: number) {
  return createNotification({
    userId: providerId,
    type: 'PAYOUT_SENT',
    title: 'Payout Sent',
    body: `A payout of $${(amount / 100).toFixed(2)} has been sent to your account.`,
    sendSms: true,
  });
}
