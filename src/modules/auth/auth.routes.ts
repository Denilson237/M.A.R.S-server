import { Router } from "express";

import authMiddleware from "../../middlewares/auth";
import { errorHandler } from "../../core/error-handler";
import { authController } from "./auth.module";

const authRoutes: Router = Router();

authRoutes.post('/register', errorHandler(authController.signup));
authRoutes.post('/activate', errorHandler(authController.activate));
authRoutes.post('/login', errorHandler(authController.signin));
authRoutes.get('/me', [authMiddleware], errorHandler(authController.me));
authRoutes.get('/refresh', errorHandler(authController.updateAccessToken));
authRoutes.post('/logout', [authMiddleware], errorHandler(authController.signout));

export default authRoutes;