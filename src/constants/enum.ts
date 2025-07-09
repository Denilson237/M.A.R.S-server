import { Prisma } from "@prisma/client"

export const trackingService = {
    AUTH: {
        LOGIN: "LOGIN",
        LOGOUT: "LOGOUT",
    },
    TICKET: {
        CREATE: "TICKET_CREATE",
        UPDATE: "TICKET_UPDATE",
        DELETE: "TICKET_DELETE",
    },
    JOB: {
        MMS: {
            PRODUCER: "JOB_MMS_PRODUCE",
            CONSUMER: "JOB_MMS_CONSUMER",
            RUN: "JOB_MMS_RUN",
        }
    }
} as const;

export const serviceType = {
    SUMMARY: "SUMMARY",
    PEOPLE: Prisma.ModelName.People.toUpperCase(),

    AGENCY: Prisma.ModelName.Agency.toUpperCase(),
    DELCOM: Prisma.ModelName.Delcom.toUpperCase(),
    REGION: Prisma.ModelName.Region.toUpperCase(),

    CUSTOMER_REFERENCE: Prisma.ModelName.CustomerReference.toUpperCase(),
    CUSTOMER_MMS_NOTREADABLE: Prisma.ModelName.CustomerMMSNotReadable.toUpperCase(),
    CUSTOMER_MMS_METERREADING: Prisma.ModelName.CustomerMMSMeterReading.toUpperCase(),

    USER: Prisma.ModelName.User.toUpperCase(),
    USER_SCOPE: Prisma.ModelName.UserScope.toUpperCase(),
    USER_PASSWORDHISTORY: Prisma.ModelName.UserPasswordHistory.toUpperCase(),
    USER_MFA: Prisma.ModelName.UserMFA.toUpperCase(),
    ROLE: Prisma.ModelName.Role.toUpperCase(),
    ROLE_SCOPE: Prisma.ModelName.RoleScope.toUpperCase(),
    USER_ROLE: Prisma.ModelName.UserRole.toUpperCase(),
    PERMISSION: Prisma.ModelName.Permission.toUpperCase(),
    ROLE_PERMISSION: Prisma.ModelName.RolePermission.toUpperCase(),

    WORKFLOW: Prisma.ModelName.Workflow.toUpperCase(),
    WORKFLOW_STEP: Prisma.ModelName.WorkflowStep.toUpperCase(),
    WORKFLOW_TRANSITION: Prisma.ModelName.WorkflowTransition.toUpperCase(),
    WORKFLOW_VALIDATION: Prisma.ModelName.WorkflowValidation.toUpperCase(),
    WORKFLOW_VALIDATION_ROLE: Prisma.ModelName.WorkflowValidationRole.toUpperCase(),
    WORKFLOW_VALIDATION_USER: Prisma.ModelName.WorkflowValidationUser.toUpperCase(),

    TICKET: Prisma.ModelName.Ticket.toUpperCase(),
    TICKET_TYPE: Prisma.ModelName.TicketType.toUpperCase(),
    TICKET_TYPE_REASON: Prisma.ModelName.TicketTypeReason.toUpperCase(),
    TICKET_WORKFLOW: Prisma.ModelName.TicketWorkflow.toUpperCase(),
    TICKET_WORKFLOW_VALIDATION: Prisma.ModelName.TicketWorkflowValidationAction.toUpperCase(),

    JOB: Prisma.ModelName.Job.toUpperCase(),
    JOB_MMS: "MMS",
    JOB_CMS: "CMS",
    JOB_SAP: "SAP",

    CMS_UNPAID: "UNPAID",

    AUDIT: Prisma.ModelName.Audit.toUpperCase(),
    AUDIT_TICKET: Prisma.ModelName.TicketHistory.toUpperCase(),

    NOTIFICATION: Prisma.ModelName.Notification.toUpperCase(),

    BANK: Prisma.ModelName.Bank.toUpperCase(),
    BANK_AGENCY: Prisma.ModelName.BankAgency.toUpperCase(),
    PAYMODE: Prisma.ModelName.PaymentMode.toUpperCase(),
    STATUS: Prisma.ModelName.Status.toUpperCase()

} as const;

