import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import axios from "axios";
import { parseStringPromise } from 'xml2js'; // Pour parser la réponse XML

import { internalConnect } from "./connect";
import { MMS_WSDL_URL } from "../../../secrets";
import { logger } from "../../../core/utils/logger";
import { HTTPSTATUS } from "../../../config/http.config";
import { trackingService } from "../../../constants/enum";
import { createAuditLog } from "../../../core/utils/audit";
import { E_SourceType as SourceType } from "@prisma/client";
import { ErrorCode } from "../../../core/enums/error-code.enum";
import BadRequestException from "../../../core/exceptions/bad-requests";
import UnauthorizedException from "../../../core/exceptions/unauthorized";
import InternalException from "../../../core/exceptions/internal-exception";
import { getUserConnected } from "../../../core/utils/authentificationService";


//-----------------------------------------------------------------------------
//               Execute Job MMS Services  /mms/disconnect et /mms/reconnect
//-----------------------------------------------------------------------------

// Schéma de validation avec Zod
const executeJobSchema = z.object({
    devices: z.array(
        z.string().min(1, { message: "Meter is required" }) // Validation pour chaque élément du tableau
    ).nonempty({ message: "At least one meter is required" }) // Validation pour le tableau lui-même
});

// Fonction générique pour appeler le service SOAP
const callSoapService = async (soapRequest: string) => {
    const config = {
        method: 'post',
        url: MMS_WSDL_URL!,
        headers: { 'Content-Type': 'application/xml' },
        data: soapRequest,
    };

    try {
        const response = await axios.request(config);
        logger.info("SOAP Service Response:", response.data);
        return response.data;
    } catch (error) {
        logger.error("SOAP Service Error:", error);
        throw new InternalException("SOAP Service Error", error);
    }
};

// Fonction pour construire la requête SOAP
const buildSoapRequest = (id: string, meter: string, action: "disconnect" | "reconnect") => `
    <soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:simgr">
        <soapenv:Header />
        <soapenv:Body>
            <urn:ExecuteJob soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
                <id xsi:type="xsd:integer">${id}</id>
                <param>
                    <param>
                        <version date="2024-07-13">1.1</version>
                        <identification>
                            <device nr="${meter}" />
                        </identification>
                        <option>
                            <communication mode="standard" />
                        </option>
                        <action-list>
                            <action task-name="${action}"></action>
                        </action-list>
                    </param>
                </param>
            </urn:ExecuteJob>
        </soapenv:Body>
    </soapenv:Envelope>
`;

const parseSoapResponse = async (xmlData: string) => {
    try {
        const result = await parseStringPromise(xmlData, { explicitArray: false });
        const resultValue = result['SOAP-ENV:Envelope']['SOAP-ENV:Body']['simgr:ExecuteJobResponse']['result'];

        // Extraire le jobId directement ici
        const embeddedXml = resultValue._;
        const embeddedParsed = await parseStringPromise(embeddedXml, { explicitArray: false });
        const jobId = embeddedParsed?.result?.identification?.job?.["$"]?.id;

        return { resultValue, jobId };
    } catch (error) {
        logger.error("XML Parsing Error:", error);
        throw new InternalException("Failed to parse SOAP response", error);
    }
};


// Fonction pour exécuter une action (déconnexion ou reconnexion)
export const executeMeterAction = async (req: Request, res: Response, next: NextFunction, action: "disconnect" | "reconnect") => {
    try {
        // Obtenir l'ID de la session via internalConnect
        const sessionId = await internalConnect();

        if (sessionId === "0") throw new UnauthorizedException("Unauthorized resource", sessionId, ErrorCode.AUTH_UNAUTHORIZED_ACCESS);
        logger.info(`MMS Session ID retrieved: ${sessionId}`);

        //   Valider les entrées utilisateur avec Zod
        const validatedData = executeJobSchema.parse(req.body);
        logger.info('Input data validated successfully:', validatedData);

        // Récupération de l'utilisateur connecté
        const user = await getUserConnected(req);
        if (!user) throw new UnauthorizedException("Unauthorized resource",req, ErrorCode.AUTH_UNAUTHORIZED_ACCESS);

        interface ExecuteJobResult {
            device: string;
            jobId?: string;
            error?: string;
            status: "success" | "error";
        }

        // Traiter chaque appareil en parallèle (si possible)
        const results: ExecuteJobResult[] = await Promise.all(
            validatedData.devices.map(async (device) => {
                try {
                    logger.info(`Processing device: ${device}`);

                    // Construction de la requête SOAP
                    const soapRequest = buildSoapRequest(sessionId, device, action);

                    // Appel au service SOAP
                    const soapResponse = await callSoapService(soapRequest);

                    // Extraction de la valeur utile de la réponse SOAP
                    // const resultValue = await parseSoapResponse(soapResponse);
                    const { resultValue, jobId } = await parseSoapResponse(soapResponse);

                    // Extraction du job id à partir du XML `resultValue._` qui contient la chaine XML
                    // const jobId = await extractJobId(resultValue._);
                    // console.log("jobId", jobId)

                    // Création de l'audit
                    await createAuditLog(
                        user.id,
                        req.ip ?? "unknown",
                        trackingService.JOB.MMS.RUN,
                        `[MMS EXECUTEJOB ${action.toUpperCase()}] User : ${user.username} ${action}ed device: ${device}`,
                        `/mms/${action}`,
                        SourceType.SYSTEM
                    );
                    return { device, jobId, status: "success" };

                } catch (error) {
                    logger.error(`Error processing device ${device}:`, error);
                    return { device, error: String(error), status: "error" };
                }
            })
        );

        // TODO
        // Enregistrement des résultats dans la base de données ou mettre à jour l'état des jobs
        // await prismaClient.job.createMany({
        //     data: results.map((result) => ({
        //         app: "mms",
        //         userId: user.id,
        //         device: result.device,
        //         action,
        //         jobId: result.jobId || null,
        //         error: result.error || null,
        //         status: result.status,
        //         createdAt: new Date()
        //     })),
        // });

        // Réponse en cas de succès
        res.status(HTTPSTATUS.OK).json({
            success: true,
            message: `Job Meter ${action}ed start successfully`,
            result: results, // Renvoie la réponse SOAP parsée
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            // Gestion des erreurs de validation Zod
            const errorMessage = error.errors.map((err) => err.message).join(", ");
            console.log("errorMessage", errorMessage)
            next(new BadRequestException(errorMessage, ErrorCode.VALIDATION_INVALID_DATA));
        } else {
            next(error);
        }
    }
};

// Endpoint pour déconnecter un compteur
export const disconnectMeter = async (req: Request, res: Response, next: NextFunction) => {
    await executeMeterAction(req, res, next, "disconnect");
};

// Endpoint pour reconnecter un compteur
export const reconnectMeter = async (req: Request, res: Response, next: NextFunction) => {
    await executeMeterAction(req, res, next, "reconnect");
};