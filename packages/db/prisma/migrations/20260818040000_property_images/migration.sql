-- AlterTable
ALTER TABLE `Property`
    ADD COLUMN `imageUrl` VARCHAR(2048) NULL,
    ADD COLUMN `imagePathname` VARCHAR(1024) NULL,
    ADD COLUMN `imageSource` ENUM('STREET_VIEW', 'SATELLITE') NULL,
    ADD COLUMN `imageCheckedAt` DATETIME(3) NULL;
