import { Router } from "express";

import { serviceType } from "../../constants/enum";
import { errorHandler } from "../../core/error-handler";
import { createNotification, getAllNotifications, updateNotification } from "./notification.controller";
import authMiddleware, { authorizeMiddleware } from "../../middlewares/auth";

const serviceName = serviceType.NOTIFICATION;
const notificationRoutes: Router = Router();

notificationRoutes.get('/', [authMiddleware, authorizeMiddleware(`${serviceName}-READ`)], errorHandler(getAllNotifications));
notificationRoutes.post('/', [authMiddleware, authorizeMiddleware(`${serviceName}-CREATE`,`${serviceName}-WRITE`)], errorHandler(createNotification));
notificationRoutes.put('/:id', [authMiddleware, authorizeMiddleware(`${serviceName}-UPDATE`,`${serviceName}-WRITE`)], errorHandler(updateNotification));

export default notificationRoutes;