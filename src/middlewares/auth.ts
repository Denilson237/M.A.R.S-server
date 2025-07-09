import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { User } from "@prisma/client";
import { redis } from "../core/utils/redis";
import { ACCESS_TOKEN_SECRET } from "../secrets";
import prismaClient from "../core/utils/prismadb";
import { HTTPSTATUS } from "../config/http.config";
import { ErrorCode } from "../core/enums/error-code.enum";
import HttpException from "../core/exceptions/http-exception";
import UnauthorizedException from "../core/exceptions/unauthorized";


// Extend the Request interface
declare module 'express' {
    interface Request {
        user?: User & { role?: any, roles?: any[], ipAddress?: string, accessToken?: string, refreshToken?: string };
    }
}


// Authenticated User
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // 1. extract the token from the headers
    // const access_token = req.cookies.access_token;
    const access_token = req.headers.authorization;

    if (!access_token) {
        return next(new UnauthorizedException("Unauthorized: Please login to access this ressource"))
    }
    // 2. if token is not present , throw an error of unauthorized access
    try {
        // 3. if token is present, verify that token is valid and extract the payload
        const payload = jwt.verify(access_token, ACCESS_TOKEN_SECRET) as JwtPayload;
        if (!payload) {
            return next(new UnauthorizedException("Unauthorized: Access token is not valid, please login to access this resource"))
        }
        // 4. Get the redis user from the payload
        const access_token_authentificate = await redis.get(access_token);
        if (!access_token_authentificate) {
            return next(new UnauthorizedException("Unauthorized: Access token is not valid, please login to access this resource"))
        }
        // 5. Attach the user to the current request object
        req.user = JSON.parse(access_token_authentificate); // Parse the user from Redis
        next();

    } catch (error) {
        next(new UnauthorizedException("Unauthorized: Please login to access this ressource", error))
    }
};


// Administrator User
export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    if (user?.role == 'ADMIN') {
        next()
    }
    else {
        next(new UnauthorizedException('Unauthorized: Please login with ADMIN account'))
    }
}

// Validate User Role/Permissions
export const authorizeMiddleware = (...allowedPermissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const userRoles = req.user?.roles ?? []; // Assuming roles is an array
         
        if (userRoles.length < 1) {
            return next(new HttpException(`Forbidden: No roles assigned to the user`, HTTPSTATUS.FORBIDDEN, ErrorCode.ACCESS_FORBIDDEN));
        }
        if (!req.user?.role) {
            return next(new HttpException(`Forbidden: No role available`, HTTPSTATUS.FORBIDDEN, ErrorCode.ACCESS_FORBIDDEN));
        }

        const permissions = await prismaClient.rolePermission.findMany({
            where: { 
                roleId: req.user?.role.id , 
                deleted: false
            }, 
            include: {
                Permission: true 
            },
            orderBy: {
                Permission: {
                    name: 'asc', 
                },
            },
        })

        // Aplatir les permissions et vérifier contre les permissions autorisées
        const userPermissions = permissions.flatMap(rolePermission => rolePermission.Permission.name);
        const hasPermission = userPermissions.some(permission => allowedPermissions.includes(permission));

        if (!hasPermission) {
            return next(new HttpException(`Forbidden: You do not have permission to access this resource`, HTTPSTATUS.FORBIDDEN, ErrorCode.ACCESS_FORBIDDEN, null));
        }

        next();
    }
}

export default authMiddleware;
