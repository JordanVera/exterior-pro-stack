-- AlterTable
ALTER TABLE `VerificationCode`
    ADD COLUMN `attempts` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `ip` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `VerificationCode_phone_createdAt_idx` ON `VerificationCode`(`phone`, `createdAt`);

-- CreateIndex
CREATE INDEX `VerificationCode_ip_createdAt_idx` ON `VerificationCode`(`ip`, `createdAt`);
