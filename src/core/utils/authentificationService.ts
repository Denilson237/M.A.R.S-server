import { Client } from 'ldapts';
import { Request } from "express";

import { logger } from "./logger";
import prismaClient from "./prismadb";
import { LDAP_URL } from "../../secrets";
import BadRequestException from "../exceptions/bad-requests";
import UnauthorizedException from "../exceptions/unauthorized";


export const getUserConnected = async (req: Request) => {
    const userId = req?.user?.id;

    if (!userId) {
        throw new UnauthorizedException("Unauthorized resource");
    }

    const user = await prismaClient.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new UnauthorizedException("Unauthorized resource");
    }

    return { ...user, role: req.user?.role };
};


// handling LDAP connection
export const ldapLogin = async (userId: string, password: string) => {
    const client = new Client({
        url: LDAP_URL // 'ldap://10.250.90.8:389',
    });

    try {
        await client.bind(`${userId}@camlight.cm`, password);
        return true;
    } catch (error) {
        logger.info(`LDAP AUTHENTICATION Failed to bind LDAP client for ${userId}@camlight.cm`);
        throw new BadRequestException("Invalid Email or Password");
    } finally {
        // Assurez-vous de vous défaire de la liaison
        try {
            await client.unbind();
        } catch (unbindError) {
            logger.error(`LDAP AUTHENTICATION : Failed to unbind LDAP client for ${userId}@camlight.cm: ${unbindError}`);
        }
    }
};
