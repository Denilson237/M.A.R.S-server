import { E_SourceType as SourceType } from "@prisma/client";

import prismaClient from "./prismadb";

/**
 * Crée un audit dans la base de données.
 */
export const createAuditLog = async (userId: string, ipAddress: string, action: string, details: string, endpoint: string, source: SourceType) => {
    await prismaClient.audit.create({
        data: {
            userId,
            ipAddress,
            action,
            details,
            endpoint,
            source,
        },
    });
};
