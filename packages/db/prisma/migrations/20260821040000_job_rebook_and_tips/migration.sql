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
    'TIP_RECEIVED',
    'SCHEDULE_CHANGE',
    'SUBSCRIPTION_CREATED',
    'SUBSCRIPTION_RENEWED',
    'SUBSCRIPTION_CANCELLED',
    'NEW_PROVIDER_SIGNUP',
    'PAYOUT_SENT',
    'GENERAL'
) NOT NULL;

-- AlterTable
ALTER TABLE `Payment` MODIFY COLUMN `kind` ENUM(
    'SUBSCRIPTION',
    'JOB',
    'TIP'
) NOT NULL;

-- AlterTable
ALTER TABLE `Job` ADD COLUMN `invitedProviderId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Job_invitedProviderId_idx` ON `Job`(`invitedProviderId`);

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_invitedProviderId_fkey` FOREIGN KEY (`invitedProviderId`) REFERENCES `ProviderProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
