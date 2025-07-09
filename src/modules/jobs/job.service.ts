//	Contient la fonction executeJob(job) pour encapsuler la logique d'exécution

import { E_Application, E_JobStatus as JobStatus, E_JobAction } from "@prisma/client";
import prismaClient from "../../core/utils/prismadb";

interface CreateJobParams {
    app: E_Application;
    ressource: string;
    ticketId?: string;
    userId?: string;
    action: E_JobAction;
}

export const createJob = async ({ app, ressource, ticketId, userId, action }: CreateJobParams) => {
    return prismaClient.job.create({
        data: {
            app,
            ressource,
            ticketId,
            userId,
            action
        }
    });
};

export const processJob = async (job: any) => {
    try {
        // Simule un appel MMS ou autre traitement
        const jobResult = await fakeExternalCall(job.device, job.action);

        await prismaClient.job.update({
            where: { id: job.id },
            data: {
                appJobId: jobResult.jobId,
                status: JobStatus.SUCCESS,
                updatedAt: new Date()
            }
        });
    } catch (error) {
        const newAttempts = job.attempts + 1;
        const isFinalAttempt = newAttempts >= job.maxAttempts;

        await prismaClient.job.update({
            where: { id: job.id },
            data: {
                attempts: newAttempts,
                status: isFinalAttempt ? JobStatus.FAILED : JobStatus.PENDING,
                error: (error as Error)?.message
            }
        });
    }
};

const fakeExternalCall = async (device: string, action: string) => {
    // Simule appel MMS
    return {
        jobId: `JOB-${Date.now()}`,
        result: 'ok'
    };
};
