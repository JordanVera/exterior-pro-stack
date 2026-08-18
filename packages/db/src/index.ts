import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export { PrismaClient } from "@prisma/client";
export type { Prisma, Property } from "@prisma/client";
export {
  UserRole,
  PropertyImageSource,
  BidStatus,
  JobStatus,
  JobType,
  JobPhotoKind,
  RecurringFrequency,
  ServiceFrequency,
  SubscriptionStatus,
  BillingFrequency,
  PriceUnit,
  NotificationType,
  PaymentKind,
  PaymentStatus,
  TransferStatus,
} from "@prisma/client";
