-- Re-modify the columns to be NOT NULL (if they were originally)
ALTER TABLE `people` 
  MODIFY `createdBy` CHAR(36) NOT NULL,
  MODIFY `updatedBy` CHAR(36) NOT NULL;

ALTER TABLE `users` 
  MODIFY `createdBy` CHAR(36) NOT NULL,
  MODIFY `updatedBy` CHAR(36) NOT NULL;

-- Recreate foreign key constraints
ALTER TABLE `people` 
  ADD CONSTRAINT `people_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`),
  ADD CONSTRAINT `people_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`);

ALTER TABLE `users` 
  ADD CONSTRAINT `users_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`),
  ADD CONSTRAINT `users_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`);