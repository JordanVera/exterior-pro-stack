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
    'SCHEDULE_CHANGE',
    'SUBSCRIPTION_CREATED',
    'SUBSCRIPTION_RENEWED',
    'SUBSCRIPTION_CANCELLED',
    'NEW_PROVIDER_SIGNUP',
    'PAYOUT_SENT',
    'GENERAL'
) NOT NULL;

-- CreateTable
CREATE TABLE `JobMessage` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `JobMessage_jobId_createdAt_idx`(`jobId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobThreadRead` (
    `jobId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `lastReadAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`jobId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `JobMessage` ADD CONSTRAINT `JobMessage_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobMessage` ADD CONSTRAINT `JobMessage_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobThreadRead` ADD CONSTRAINT `JobThreadRead_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobThreadRead` ADD CONSTRAINT `JobThreadRead_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
