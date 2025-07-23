/*
  Warnings:

  - A unique constraint covering the columns `[TicketTypeId,name]` on the table `ticket_type_reasons` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `ticket_type_reasons_name_key` ON `ticket_type_reasons`;

-- CreateIndex
CREATE UNIQUE INDEX `ticket_type_reasons_TicketTypeId_name_key` ON `ticket_type_reasons`(`TicketTypeId`, `name`);
