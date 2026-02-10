import { db, NotificationType } from "@repo/db";
import { sendSMS } from "./sms";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  sendSms?: boolean;
}

/**
 * Create an in-app notification and optionally send an SMS.
 */
export async function createNotification({
  userId,
  type,
  title,
  body,
  sendSms: shouldSendSms = false,
}: CreateNotificationParams) {
  // Create in-app notification
  const notification = await db.notification.create({
    data: { userId, type, title, body },
  });

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
      console.error("Failed to send SMS notification:", err);
    }
  }

  return notification;
}

// ─── Convenience helpers for common notification events ─────────────────────

/** Notify customer that a provider sent them a quote */
export async function notifyQuoteReceived(
  customerId: string,
  providerName: string,
  serviceName: string
) {
  return createNotification({
    userId: customerId,
    type: "QUOTE_RECEIVED",
    title: "New Quote Received",
    body: `${providerName} sent you a quote for ${serviceName}.`,
    sendSms: true,
  });
}

/** Notify provider of a new quote request */
export async function notifyNewQuoteRequest(
  providerId: string,
  serviceName: string,
  address: string
) {
  return createNotification({
    userId: providerId,
    type: "NEW_QUOTE_REQUEST",
    title: "New Quote Request",
    body: `New request for ${serviceName} at ${address}.`,
    sendSms: true,
  });
}

/** Notify customer that their quote was accepted */
export async function notifyQuoteAccepted(
  customerId: string,
  serviceName: string
) {
  return createNotification({
    userId: customerId,
    type: "QUOTE_ACCEPTED",
    title: "Quote Accepted",
    body: `Your quote for ${serviceName} has been accepted! A job has been created.`,
  });
}

/** Notify customer of job scheduled */
export async function notifyJobScheduled(
  customerId: string,
  serviceName: string,
  date: string,
  time?: string
) {
  return createNotification({
    userId: customerId,
    type: "JOB_SCHEDULED",
    title: "Job Scheduled",
    body: `Your ${serviceName} job is scheduled for ${date}${time ? ` at ${time}` : ""}.`,
    sendSms: true,
  });
}

/** Notify customer that job is in progress */
export async function notifyJobInProgress(
  customerId: string,
  serviceName: string
) {
  return createNotification({
    userId: customerId,
    type: "JOB_IN_PROGRESS",
    title: "Job In Progress",
    body: `Your ${serviceName} job has started!`,
    sendSms: true,
  });
}

/** Notify customer that job is completed */
export async function notifyJobCompleted(
  customerId: string,
  serviceName: string
) {
  return createNotification({
    userId: customerId,
    type: "JOB_COMPLETED",
    title: "Job Completed",
    body: `Your ${serviceName} job is complete!`,
    sendSms: true,
  });
}

/** Notify provider of a job reminder */
export async function notifyJobReminder(
  providerId: string,
  serviceName: string,
  address: string,
  date: string
) {
  return createNotification({
    userId: providerId,
    type: "JOB_REMINDER",
    title: "Job Reminder",
    body: `Reminder: ${serviceName} at ${address} on ${date}.`,
    sendSms: true,
  });
}

/** Notify admin of new provider signup */
export async function notifyNewProviderSignup(
  adminId: string,
  businessName: string
) {
  return createNotification({
    userId: adminId,
    type: "NEW_PROVIDER_SIGNUP",
    title: "New Provider Signup",
    body: `${businessName} has signed up and is pending verification.`,
  });
}
