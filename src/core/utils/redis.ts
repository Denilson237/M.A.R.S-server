import Redis from "ioredis"
import { redisConfig } from "../../config/redis.config";


export const redis = new Redis(redisConfig());
