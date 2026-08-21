-- AlterTable
ALTER TABLE `Notification` MODIFY COLUMN `type` ENUM(
    'NEW_JOB_AVAILABLE',
    'BID_RECEIVED',
    'BID_ACCEPTED',
    'BID_DECLINED',
    'JOB_SCHEDULED',
    'JOB_IN_PROGRESS',
    'JOB_COMPLETED',
    'JOB_CANCELLED',
    'JOB_REMINDER',
    'JOB_MESSAGE',
    'REVIEW_RECEIVED',
    'SCHEDULE_CHANGE',
    'SUBSCRIPTION_CREATED',
    'SUBSCRIPTION_RENEWED',
    'SUBSCRIPTION_CANCELLED',
    'NEW_PROVIDER_SIGNUP',
    'PAYOUT_SENT',
    'GENERAL'
) NOT NULL;

-- CreateTable
CREATE TABLE `JobReview` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `JobReview_jobId_key`(`jobId`),
    INDEX `JobReview_providerId_createdAt_idx`(`providerId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `JobReview` ADD CONSTRAINT `JobReview_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobReview` ADD CONSTRAINT `JobReview_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `ProviderProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobReview` ADD CONSTRAINT `JobReview_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `CustomerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
