import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function reset() {
  // Clear database tables
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;
  await prisma.audit.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.userRole.deleteMany({})
  await prisma.roleScope.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.ticketWorkflowValidationAction.deleteMany({});
  await prisma.ticketWorkflow.deleteMany({});
  await prisma.ticketTypeReason.deleteMany({});
  await prisma.ticketType.deleteMany({});
  await prisma.ticketHistory.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.workflow.deleteMany({});
  await prisma.workflowStep.deleteMany({});
  await prisma.workflowTransition.deleteMany({});
  await prisma.workflowValidation.deleteMany({});
  await prisma.workflowValidationRole.deleteMany({});
  await prisma.workflowValidationUser.deleteMany({});
  await prisma.jobLock.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.paymentMode.deleteMany({});
  await prisma.status.deleteMany({});
  await prisma.bankAgency.deleteMany({});
  await prisma.bank.deleteMany({});
  await prisma.customerReference.deleteMany({});
  await prisma.userPasswordHistory.deleteMany({});
  await prisma.userScope.deleteMany({});
  await prisma.userMFA.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.people.deleteMany({});
  await prisma.agency.deleteMany({});
  await prisma.delcom.deleteMany({});
  await prisma.region.deleteMany({});
  await prisma.$executeRaw`TRUNCATE TABLE status`;
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;
}