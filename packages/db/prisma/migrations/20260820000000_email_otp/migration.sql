-- Login identity moves from phone OTP to email OTP.
-- AlterTable
ALTER TABLE `User` ADD COLUMN `email` VARCHAR(191) NULL;

UPDATE `User` u
LEFT JOIN `CustomerProfile` c ON c.userId = u.id
LEFT JOIN `ProviderProfile` p ON p.userId = u.id
SET u.email = LOWER(COALESCE(
  NULLIF(c.email, ''),
  NULLIF(p.email, ''),
  CONCAT(REPLACE(u.phone, '+', ''), '@users.exteriorpro.local')
));

UPDATE `User` u
INNER JOIN (
  SELECT `email`, MIN(`id`) AS `keep_id`
  FROM `User`
  WHERE `email` IS NOT NULL AND `email` <> ''
  GROUP BY `email`
  HAVING COUNT(*) > 1
) d ON u.email = d.email AND u.id <> d.keep_id
SET u.email = CONCAT(
  SUBSTRING_INDEX(u.email, '@', 1),
  '+',
  REPLACE(u.id, '-', ''),
  '@',
  SUBSTRING_INDEX(u.email, '@', -1)
);

UPDATE `User`
SET `email` = CONCAT(`id`, '@users.exteriorpro.local')
WHERE `email` IS NULL OR `email` = '';

ALTER TABLE `User` MODIFY `email` VARCHAR(191) NOT NULL;
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);

ALTER TABLE `User` MODIFY `phone` VARCHAR(191) NULL;

-- AlterTable
DROP INDEX `VerificationCode_phone_code_idx` ON `VerificationCode`;
DROP INDEX `VerificationCode_phone_createdAt_idx` ON `VerificationCode`;
ALTER TABLE `VerificationCode` CHANGE `phone` `email` VARCHAR(191) NOT NULL;
CREATE INDEX `VerificationCode_email_code_idx` ON `VerificationCode`(`email`, `code`);
CREATE INDEX `VerificationCode_email_createdAt_idx` ON `VerificationCode`(`email`, `createdAt`);

-- AlterTable
ALTER TABLE `CrewMember` ADD COLUMN `email` VARCHAR(191) NULL;

UPDATE `CrewMember` cm
INNER JOIN `User` u ON u.phone = cm.phone
SET cm.email = u.email
WHERE cm.phone IS NOT NULL;
