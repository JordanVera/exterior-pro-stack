import { db, NotificationType } from '@repo/db';
import { sendPushNotification } from './push';
import { sendAlertEmail } from './email';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  sendPush?: boolean;
  sendEmail?: boolean;
  data?: Record<string, any>;
}

/**
 * Create an in-app notification and optionally send a push notification.
 */
export async function createNotification({
  userId,
  type,
  title,
  body,
  sendPush: shouldSendPush = true,
  sendEmail: shouldSendEmail = false,
  data = {},
}: CreateNotificationParams) {
  const notification = await db.notification.create({
    data: { userId, type, title, body },
  });

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

  if (shouldSendEmail) {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      await sendAlertEmail({
        to: user?.email,
        subject: title,
        body,
      });
    } catch (err) {
      console.error('Failed to send notification email:', err);
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
    sendEmail: true,
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

/** Notify a provider that a customer booked them again at the last price */
export async function notifyDirectBook(
  providerId: string,
  serviceName: string,
) {
  return createNotification({
    userId: providerId,
    type: 'BID_ACCEPTED',
    title: 'Customer booked you again',
    body: `A customer booked you again for ${serviceName}. Schedule the visit when you are ready.`,
  });
}

/** Notify a provider that a customer sent a tip */
export async function notifyTipReceived(
  providerId: string,
  serviceName: string,
  amountCents: number,
) {
  return createNotification({
    userId: providerId,
    type: 'TIP_RECEIVED',
    title: 'You received a tip',
    body: `A customer tipped $${(amountCents / 100).toFixed(2)} on your ${serviceName} job.`,
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
    sendEmail: true,
  });
}

/** Notify a job participant of a new in-app message. */
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
    sendEmail: true,
  });
}
