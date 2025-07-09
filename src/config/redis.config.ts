import { REDIS_HOSTNAME, REDIS_PASSWORD, REDIS_PORT } from "../secrets";

export function redisConfig(): any {
    return {
        host: REDIS_HOSTNAME, 
        port: parseInt(REDIS_PORT ?? "6379"), 
        password: REDIS_PASSWORD
    };
} 