import "./load-env";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  return new PrismaClient({ adapter: new PrismaMariaDb(url) });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export { PrismaClient, Prisma } from "../generated/prisma/client";
export type { Property } from "../generated/prisma/client";
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
} from "../generated/prisma/client";
