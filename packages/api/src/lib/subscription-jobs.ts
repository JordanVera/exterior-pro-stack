import { db } from "@repo/db";
import type { ServiceFrequency } from "@repo/db";
import { notifyJobReminder, notifyNewJobAvailable } from "./notifications";
import { splitCharge, toCents } from "./stripe";

function addFrequency(date: Date, frequency: ServiceFrequency) {
  const next = new Date(date);
  switch (frequency) {
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "BIWEEKLY":
      next.setDate(next.getDate() + 14);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "QUARTERLY":
      next.setMonth(next.getMonth() + 3);
      break;
    case "BIANNUALLY":
      next.setMonth(next.getMonth() + 6);
      break;
  }
  return next;
}

export async function generateSubscriptionJobs() {
  const lookahead = new Date();
  lookahead.setDate(lookahead.getDate() + 7);

  const subscriptions = await db.customerSubscription.findMany({
    where: { status: "ACTIVE" },
    include: {
      plan: { include: { services: { include: { service: true } } } },
      property: true,
      provider: { include: { services: true } },
    },
  });

  let created = 0;

  for (const sub of subscriptions) {
    for (const planService of sub.plan.services) {
      const lastJob = await db.job.findFirst({
        where: {
          subscriptionId: sub.id,
          serviceId: planService.serviceId,
          status: { not: "CANCELLED" },
        },
        orderBy: { createdAt: "desc" },
      });

      const nextDate = lastJob
        ? addFrequency(
            lastJob.scheduledDate ?? lastJob.createdAt,
            planService.frequency
          )
        : new Date();

      if (nextDate > lookahead) continue;

      const dayStart = new Date(
        nextDate.getFullYear(),
        nextDate.getMonth(),
        nextDate.getDate()
      );
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const existingSameDay = await db.job.findFirst({
        where: {
          subscriptionId: sub.id,
          serviceId: planService.serviceId,
          status: { not: "CANCELLED" },
          OR: [
            { scheduledDate: { gte: dayStart, lt: dayEnd } },
            { createdAt: { gte: dayStart, lt: dayEnd } },
          ],
        },
      });
      if (existingSameDay) continue;

      const assigned = sub.provider;
      const customPrice = assigned?.services.find(
        (s) => s.serviceId === planService.serviceId
      )?.customPrice;
      const visitPrice = Number(customPrice ?? planService.service.basePrice);

      if (assigned) {
        const job = await db.job.create({
          data: {
            propertyId: sub.propertyId,
            serviceId: planService.serviceId,
            type: "SUBSCRIPTION",
            status: "PENDING",
            subscriptionId: sub.id,
            scheduledDate: nextDate,
            customerNotes: `Generated from ${sub.plan.name} (${planService.frequency.toLowerCase()})`,
          },
        });

        const bid = await db.jobBid.create({
          data: {
            jobId: job.id,
            providerId: assigned.id,
            price: visitPrice,
            notes: "Assigned from subscription",
            status: "ACCEPTED",
          },
        });

        await db.job.update({
          where: { id: job.id },
          data: { acceptedBidId: bid.id },
        });

        const split = splitCharge(toCents(visitPrice));
        await db.payment.create({
          data: {
            kind: "SUBSCRIPTION",
            status: "SUCCEEDED",
            amountCents: toCents(visitPrice),
            ...split,
            customerId: sub.customerId,
            jobId: job.id,
            subscriptionId: sub.id,
          },
        });

        notifyNewJobAvailable(
          assigned.userId,
          planService.service.name,
          `${sub.property.address}, ${sub.property.city}`
        ).catch(console.error);
      } else {
        const job = await db.job.create({
          data: {
            propertyId: sub.propertyId,
            serviceId: planService.serviceId,
            type: "SUBSCRIPTION",
            status: "OPEN",
            subscriptionId: sub.id,
            scheduledDate: nextDate,
            customerNotes: `Generated from ${sub.plan.name} (${planService.frequency.toLowerCase()})`,
          },
          include: { service: true },
        });

        const matchingProviders = await db.providerProfile.findMany({
          where: {
            verified: true,
            stripeTransfersEnabled: true,
            services: { some: { serviceId: planService.serviceId } },
            OR: [
              { serviceAreaZips: { contains: sub.property.zip } },
              { serviceAreaZips: null },
            ],
          },
        });

        for (const provider of matchingProviders) {
          notifyNewJobAvailable(
            provider.userId,
            job.service.name,
            `${sub.property.address}, ${sub.property.city}`
          ).catch(console.error);
        }
      }

      created += 1;
    }
  }

  return { created, scanned: subscriptions.length };
}

export async function expireStaleBids() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);

  const result = await db.jobBid.updateMany({
    where: {
      status: "PENDING",
      createdAt: { lt: cutoff },
      job: { status: "OPEN" },
    },
    data: { status: "EXPIRED" },
  });

  return { expired: result.count };
}

export async function sendUpcomingJobReminders() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const jobs = await db.job.findMany({
    where: {
      status: "SCHEDULED",
      scheduledDate: { gte: start, lt: end },
    },
    include: {
      property: true,
      service: true,
      acceptedBid: { include: { provider: true } },
    },
  });

  for (const job of jobs) {
    if (!job.acceptedBid) continue;
    const dateLabel = job.scheduledDate
      ? job.scheduledDate.toLocaleDateString()
      : "tomorrow";
    await notifyJobReminder(
      job.acceptedBid.provider.userId,
      job.service.name,
      `${job.property.address}, ${job.property.city}`,
      dateLabel
    );
  }

  return { reminded: jobs.length };
}
