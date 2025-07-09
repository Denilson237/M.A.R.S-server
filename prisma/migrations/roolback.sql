-- DropForeignKey
ALTER TABLE `people` DROP FOREIGN KEY `people_createdBy_fkey`;

-- DropForeignKey
ALTER TABLE `people` DROP FOREIGN KEY `people_updatedBy_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_createdBy_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_updatedBy_fkey`;


ALTER TABLE `people` MODIFY `createdBy` CHAR(36) NULL,
    MODIFY `updatedBy` CHAR(36) NULL;

ALTER TABLE `users` MODIFY `createdBy` CHAR(36) NULL,
    MODIFY `updatedBy` CHAR(36) NULL;
