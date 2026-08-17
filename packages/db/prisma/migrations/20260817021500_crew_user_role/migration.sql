-- AlterEnum
ALTER TABLE `User` MODIFY `role` ENUM('CUSTOMER', 'PROVIDER', 'ADMIN', 'CREW') NULL;

-- AlterTable
ALTER TABLE `CrewMember` ADD COLUMN `userId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CrewMember_userId_key` ON `CrewMember`(`userId`);

-- AddForeignKey
ALTER TABLE `CrewMember` ADD CONSTRAINT `CrewMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
