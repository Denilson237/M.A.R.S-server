import { Router } from "express";

import { serviceType } from "../../constants/enum";
import { errorHandler } from "../../core/error-handler";
import authMiddleware, { authorizeMiddleware } from "../../middlewares/auth";
import { create, get, getById, update , remove, bulkCreate, bulkRemove, disactiveReactiveWorkflow  } from "./controllers/workflow";


const serviceName = serviceType.WORKFLOW;
const workflowRoute:Router = Router();

workflowRoute.post('/', [authMiddleware,authorizeMiddleware(`${serviceName}-CREATE`)] , errorHandler(create));
workflowRoute.get('/', [authMiddleware] ,errorHandler(get));
workflowRoute.get('/:id', [authMiddleware,authorizeMiddleware(`${serviceName}-READ`)] , errorHandler(getById));
workflowRoute.put('/:id', [authMiddleware,authorizeMiddleware(`${serviceName}-UPDATE`)], errorHandler(update));
workflowRoute.delete('/:id', [authMiddleware,authorizeMiddleware(`${serviceName}-DELETE`)] , errorHandler(remove));

workflowRoute.put('/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/disactive-reactive', [authMiddleware,authorizeMiddleware(`${serviceName}-UPDATE`)],errorHandler(disactiveReactiveWorkflow));
workflowRoute.post('/bulk',[authMiddleware,authorizeMiddleware(`${serviceName}-BULKCREATE`)] , errorHandler(bulkCreate));
workflowRoute.delete('/bulk', [authMiddleware,authorizeMiddleware(`${serviceName}-BULKDELETE`)], errorHandler(bulkRemove));

export default workflowRoute;