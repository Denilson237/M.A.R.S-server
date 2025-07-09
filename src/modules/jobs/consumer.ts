// Lit les jobs en attente (status = "pending") et les exécute
import { JobStatus } from '@prisma/client';
import prismaClient from '../../core/utils/prismadb';
import { processJob } from './job.service';

export const runJobConsumer = async () => {
    const maxJobs = 10;

    const jobs = await prismaClient.job.findMany({
        where: {
            status: JobStatus.PENDING,
            attempts: { lt: 5 }
        },
        take: maxJobs,
        orderBy: { createdAt: 'asc' }
    });

    for (const job of jobs) {
        await processJob(job);
    }
};
