import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export { PrismaClient } from "@prisma/client";
export type { Prisma } from "@prisma/client";
export {
  UserRole,
  BidStatus,
  JobStatus,
  JobType,
  RecurringFrequency,
  ServiceFrequency,
  SubscriptionStatus,
  BillingFrequency,
  PriceUnit,
  NotificationType,
} from "@prisma/client";
