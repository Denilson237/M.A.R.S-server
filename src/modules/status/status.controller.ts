import { NextFunction, Request, Response } from 'express';

import { redis } from '../../core/utils/redis';
import prismaClient from '../../core/utils/prismadb';
import { HTTPSTATUS } from '../../config/http.config';
import NotFoundException from '../../core/exceptions/not-found';
import BadRequestException from '../../core/exceptions/bad-requests';
import { serviceType } from '../../constants/enum';
import { ErrorCode } from '../../core/enums/error-code.enum';


const key = serviceType.STATUS;

//-----------------------------------------------------------------------------
//             GET ALL 
//-----------------------------------------------------------------------------
export const get =
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, id } = req.query ;
        let data;
        if (id) {
            data = await getByIdService(parseInt(id.toString()))
            return res.status(HTTPSTATUS.OK).json({
                success: true,
                data
            });
        }
        if (name) {
            data = await getByNameService(name.toString())

            return res.status(HTTPSTATUS.OK).json({
                success: true,
                data
            });
        }

        const redis_data = await redis.get(key);
        if (redis_data) {
            data = JSON.parse(redis_data);
        } else {
            data = await revalidateService(key);
        }

        res.status(HTTPSTATUS.OK).json({
            success: true,
            data
        });
    }


//-----------------------------------------------------------------------------
//             GET BY ID 
//-----------------------------------------------------------------------------
export const getById =
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id) throw new BadRequestException('Invalid params', ErrorCode.VALIDATION_INVALID_DATA);

        const data = getByIdService(parseInt(id))


        res.status(HTTPSTATUS.OK).json({
            success: true,
            data
        });

    };


//-----------------------------------------------------------------------------
//             GET BY name 
//-----------------------------------------------------------------------------
export const getByName =
    async (req: Request, res: Response, next: NextFunction) => {

        const { name } = req.body;
        if (!name) throw new BadRequestException('Invalid params ', ErrorCode.VALIDATION_INVALID_DATA);

        const data = getByNameService(name)

        res.status(HTTPSTATUS.OK).json({
            success: true,
            data
        });

    };


//-----------------------------------------------------------------------------
//             UPDATE
//-----------------------------------------------------------------------------
export const update =
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id) throw new BadRequestException('Invalid params', ErrorCode.VALIDATION_INVALID_DATA);

        const { name } = req.body;
        const data = await prismaClient.status.update({
            where: { id: parseInt(id) },
            data: { name },
        });
        revalidateService(key);

        res.status(HTTPSTATUS.OK).json({
            success: true,
            data
        });

    };



const revalidateService = async (key: string) => {
    const data = await prismaClient.status.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });
    await redis.set(key, JSON.stringify(data));
    return data
}

const getByIdService = async (id: number) => {
    const data = await prismaClient.status.findUnique({
        where: { id: id },
    });
    if (!data) throw new NotFoundException("status not found", ErrorCode.RESOURCE_NOT_FOUND);
    return data
}

const getByNameService = async (name: string) => {
    const data = await prismaClient.status.findFirst({
        where: { name: name },
    });
    if (!data) throw new NotFoundException("status not found", ErrorCode.RESOURCE_NOT_FOUND);
    return data
}