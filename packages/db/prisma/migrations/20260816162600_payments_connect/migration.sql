-- AlterTable
ALTER TABLE `ProviderProfile` ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `stripeAccountId` VARCHAR(191) NULL,
    ADD COLUMN `stripeTransfersEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `contractorAgreedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ProviderProfile_stripeAccountId_key` ON `ProviderProfile`(`stripeAccountId`);

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `kind` ENUM('SUBSCRIPTION', 'JOB') NOT NULL,
    `status` ENUM('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `amountCents` INTEGER NOT NULL,
    `platformFeeCents` INTEGER NOT NULL DEFAULT 0,
    `stripeFeeCents` INTEGER NOT NULL DEFAULT 0,
    `transferAmountCents` INTEGER NOT NULL DEFAULT 0,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'usd',
    `stripeCheckoutSessionId` VARCHAR(191) NULL,
    `stripePaymentIntentId` VARCHAR(191) NULL,
    `stripeInvoiceId` VARCHAR(191) NULL,
    `receiptUrl` VARCHAR(191) NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NULL,
    `subscriptionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_stripeCheckoutSessionId_key`(`stripeCheckoutSessionId`),
    INDEX `Payment_customerId_createdAt_idx`(`customerId`, `createdAt`),
    INDEX `Payment_jobId_idx`(`jobId`),
    INDEX `Payment_subscriptionId_idx`(`subscriptionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transfer` (
    `id` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `amountCents` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'REVERSED') NOT NULL DEFAULT 'PENDING',
    `stripeTransferId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Transfer_stripeTransferId_key`(`stripeTransferId`),
    INDEX `Transfer_providerId_createdAt_idx`(`providerId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `CustomerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `CustomerSubscription`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transfer` ADD CONSTRAINT `Transfer_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transfer` ADD CONSTRAINT `Transfer_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `ProviderProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
