/*
  Warnings:

  - You are about to drop the column `quoteId` on the `Job` table. All the data in the column will be lost.
  - The values [QUOTE_RECEIVED,QUOTE_ACCEPTED,QUOTE_DECLINED,NEW_QUOTE_REQUEST] on the enum `Notification_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Quote` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[acceptedBidId]` on the table `Job` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `propertyId` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Job` DROP FOREIGN KEY `Job_quoteId_fkey`;

-- DropForeignKey
ALTER TABLE `Quote` DROP FOREIGN KEY `Quote_propertyId_fkey`;

-- DropForeignKey
ALTER TABLE `Quote` DROP FOREIGN KEY `Quote_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `Quote` DROP FOREIGN KEY `Quote_serviceId_fkey`;

-- DropIndex
DROP INDEX `Job_quoteId_key` ON `Job`;

-- AlterTable
ALTER TABLE `CustomerProfile` ADD COLUMN `stripeCustomerId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Job` DROP COLUMN `quoteId`,
    ADD COLUMN `acceptedBidId` VARCHAR(191) NULL,
    ADD COLUMN `customerNotes` TEXT NULL,
    ADD COLUMN `propertyId` VARCHAR(191) NOT NULL,
    ADD COLUMN `serviceId` VARCHAR(191) NOT NULL,
    ADD COLUMN `subscriptionId` VARCHAR(191) NULL,
    ADD COLUMN `type` ENUM('ONE_TIME', 'SUBSCRIPTION') NOT NULL DEFAULT 'ONE_TIME',
    MODIFY `status` ENUM('OPEN', 'PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE `Notification` MODIFY `type` ENUM('NEW_JOB_AVAILABLE', 'BID_RECEIVED', 'BID_ACCEPTED', 'BID_DECLINED', 'JOB_SCHEDULED', 'JOB_IN_PROGRESS', 'JOB_COMPLETED', 'JOB_CANCELLED', 'JOB_REMINDER', 'SCHEDULE_CHANGE', 'SUBSCRIPTION_CREATED', 'SUBSCRIPTION_RENEWED', 'SUBSCRIPTION_CANCELLED', 'NEW_PROVIDER_SIGNUP', 'GENERAL') NOT NULL;

-- AlterTable
ALTER TABLE `ProviderProfile` ADD COLUMN `serviceAreaZips` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `RecurringSchedule` MODIFY `frequency` ENUM('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'BIANNUALLY') NOT NULL;

-- DropTable
DROP TABLE `Quote`;

-- CreateTable
CREATE TABLE `SubscriptionPlan` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `monthlyPrice` DECIMAL(10, 2) NOT NULL,
    `quarterlyPrice` DECIMAL(10, 2) NULL,
    `annualPrice` DECIMAL(10, 2) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `stripeProductId` VARCHAR(191) NULL,
    `stripePriceIdMonthly` VARCHAR(191) NULL,
    `stripePriceIdQuarterly` VARCHAR(191) NULL,
    `stripePriceIdAnnually` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SubscriptionPlan_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanService` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `frequency` ENUM('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'BIANNUALLY') NOT NULL,

    UNIQUE INDEX `PlanService_planId_serviceId_key`(`planId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerSubscription` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'PAUSED', 'CANCELLED', 'PAST_DUE') NOT NULL DEFAULT 'ACTIVE',
    `billingFrequency` ENUM('MONTHLY', 'QUARTERLY', 'ANNUALLY') NOT NULL DEFAULT 'MONTHLY',
    `currentPeriodStart` DATETIME(3) NOT NULL,
    `currentPeriodEnd` DATETIME(3) NOT NULL,
    `stripeSubscriptionId` VARCHAR(191) NULL,
    `assignedProviderId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobBid` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `notes` TEXT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'WITHDRAWN') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `JobBid_jobId_providerId_key`(`jobId`, `providerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Job_acceptedBidId_key` ON `Job`(`acceptedBidId`);

-- AddForeignKey
ALTER TABLE `PlanService` ADD CONSTRAINT `PlanService_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `SubscriptionPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanService` ADD CONSTRAINT `PlanService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerSubscription` ADD CONSTRAINT `CustomerSubscription_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `CustomerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerSubscription` ADD CONSTRAINT `CustomerSubscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `SubscriptionPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerSubscription` ADD CONSTRAINT `CustomerSubscription_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerSubscription` ADD CONSTRAINT `CustomerSubscription_assignedProviderId_fkey` FOREIGN KEY (`assignedProviderId`) REFERENCES `ProviderProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `CustomerSubscription`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_acceptedBidId_fkey` FOREIGN KEY (`acceptedBidId`) REFERENCES `JobBid`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobBid` ADD CONSTRAINT `JobBid_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobBid` ADD CONSTRAINT `JobBid_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `ProviderProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
