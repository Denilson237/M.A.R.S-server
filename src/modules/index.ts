import { Router } from "express";

import authRoutes from "./auth/auth.routes";
import userRoutes from "./users/user.route";
import auditRoutes from "./audits/audit.routes";
import roleRoutes from "./authorization/role/role.routes";
import bankRoutes from "./banks/bank.routes";
import permissionRoutes from "./authorization/permission/permission.routes";
import paymentModeRoutes from "./paymode/paymentMode.routes";
import unpaidRoutes from "./cms/unpaid.routes";
import summaryRoutes from "./analytics/summary.routes";
import notificationRoutes from "./notifications/notification.routes";
import statusRoutes from "./status/status.routes";
import unpaidOrPaidRoutes from "./cms/unpaidOrPaid.routes";
import customersReferenceRoutes from "./customers/customerReference.routes";
import regionRoutes from "./organisation/region/region.routes";
import bankAgencyRoutes from "./banks/bankAgency.routes";
import ticketRoutes from "./tickets/tickets.routes";
import mmsRoutes from "./mms/mms.routes";
import workflowRoute from "./workflows/workflow.routes";
import jobRouter from "./jobs/job.route";
import agencyRoutes from "./organisation/agency/agency.routes";
import delcomRoutes from "./organisation/delcom/delcom.routes";

// Create an instance of the Router
const rootRouter:Router = Router();

// Define the main routes, associating them with their respective handlers

rootRouter.use('/auth' , authRoutes);                // Routes for authentication
rootRouter.use('/audits' , auditRoutes);             // Routes for audit management
rootRouter.use('/users' , userRoutes);               // Routes for user management
rootRouter.use('/roles' , roleRoutes);               // Routes for role management
rootRouter.use('/permissions' , permissionRoutes);   // Routes for permission management
rootRouter.use('/status' , statusRoutes);            // Routes for status management
rootRouter.use('/workflows' , workflowRoute);            // Routes for workflow management
rootRouter.use('/jobs' , jobRouter);            
 
rootRouter.use('/mms' , mmsRoutes);                  // Routes for Meter monitoring management

rootRouter.use('/summary' , summaryRoutes);           // Routes for summary management
rootRouter.use('/banks' , bankRoutes);                // Routes for bank management
rootRouter.use('/bank-agencies' , bankAgencyRoutes);  // Routes for branch management (bank agency management)
rootRouter.use('/pay-modes' , paymentModeRoutes);     // Routes for payment mode management

rootRouter.use('/agencies' , agencyRoutes);                 // Routes for unit management
rootRouter.use('/delcoms' , delcomRoutes);             // Routes for region management
rootRouter.use('/regions' , regionRoutes);             // Routes for region management
rootRouter.use('/tickets' , ticketRoutes);    // Routes for assignment request management
rootRouter.use('/search-unpaid' , unpaidRoutes);                  // Routes for searching unpaid transactions
rootRouter.use('/search-paid-or-unpaid' , unpaidOrPaidRoutes);    // Routes for searching paid or unpaid transactions
rootRouter.use('/notifications' , notificationRoutes);       // Routes for notification management
rootRouter.use('/customers-reference' , customersReferenceRoutes);   // Routes for customer reference management

// Export the root router for use in other parts of the application
export default rootRouter;