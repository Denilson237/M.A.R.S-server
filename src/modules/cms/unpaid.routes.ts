import { Router } from "express";

import { errorHandler } from "../../core/error-handler";
import authMiddleware, { authorizeMiddleware } from "../../middlewares/auth";
import {
    getUnpaidBills,
    getUnpaidBillsByContractNumber,
    getUnpaidBillsByInvoiceNumber,
    getUnpaidBillsByCustomerRegroupNumber,
    getUnpaidBillsByCustomerName,
    getUnpaidBillsOnList,
    getUnpaidBillsOnListWithAccount
} from "./unpaid.controller";
import { serviceType } from "../../constants/enum";

const serviceName = serviceType.CMS_UNPAID;
const unpaidRoutes:Router = Router();

unpaidRoutes.get('/', [authMiddleware,authorizeMiddleware(`${serviceName}-SEARCH`)] , errorHandler(getUnpaidBills));
unpaidRoutes.get('/by-contractNumber', [authMiddleware,authorizeMiddleware(`${serviceName}-SEARCH`)] ,errorHandler(getUnpaidBillsByContractNumber));
unpaidRoutes.get('/by-invoiceNumber', [authMiddleware,authorizeMiddleware(`${serviceName}-SEARCH`)] , errorHandler(getUnpaidBillsByInvoiceNumber));
unpaidRoutes.get('/by-customerRegroupNumber', [authMiddleware,authorizeMiddleware(`${serviceName}-SEARCH`)], errorHandler(getUnpaidBillsByCustomerRegroupNumber));
unpaidRoutes.get('/by-customerName', [authMiddleware,authorizeMiddleware(`${serviceName}-SEARCH`)] , errorHandler(getUnpaidBillsByCustomerName));
unpaidRoutes.get('/onList', [authMiddleware,authorizeMiddleware(`${serviceName}-SEARCH`)] , errorHandler(getUnpaidBillsOnList));
unpaidRoutes.get('/onListWithAccount', [authMiddleware,authorizeMiddleware(`${serviceName}-SEARCH`)] , errorHandler(getUnpaidBillsOnListWithAccount));

export default unpaidRoutes;