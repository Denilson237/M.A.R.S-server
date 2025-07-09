import axios from 'axios';
import { parseStringPromise } from 'xml2js'; // Pour parser la réponse XML
import { NextFunction, Request, Response } from "express";

import { MMS_WSDL_URL } from "../../../secrets";
import { HTTPSTATUS } from '../../../config/http.config';

//-----------------------------------------------------------------------------
//              Read Meter MMS Services  /mms/getvalues 
//-----------------------------------------------------------------------------


// Fonction pour appeler le service SOAP GetResultValues
const callGetResultValuesSoapService = async (id: number, meterNumber: string, dateFrom: string, dateTo: string) => {
    // Construction de la requête SOAP
    const soapRequest = `
        <soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:simgr">
            <soapenv:Header/>
            <soapenv:Body>
                <urn:GetResultValues soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
                    <id xsi:type="xsd:integer">${id}</id>
                    <param xsi:type="xsd:string">
                        <?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
                        <param>
                            <version date="2008-05-01">1.0</version>
                            <identification>
                                <device nr="${meterNumber}" state="active" />
                                <datachannel obis-id-code="1-1:0.0" valuate="full" />
                            </identification>
                            <option>
                                <time-frame date-from="${dateFrom}" date-to="${dateTo}" />
                                <data-type>rv</data-type>
                                <state-type>metering-code</state-type>
                                <record>first</record>
                                <readoutcause>billing</readoutcause>
                            </option>
                        </param>
                    </param>
                </urn:GetResultValues>
            </soapenv:Body>
        </soapenv:Envelope>
    `;

    const config = {
        method: 'post',
        url: MMS_WSDL_URL!,
        headers: { 'Content-Type': 'application/xml' },
        data: soapRequest,
    };

    try {
        const response = await axios.request(config);

        // Parser la réponse XML
        const parsedResponse = await parseSoapResponse(response.data);

        return parsedResponse;
    } catch (error) {
        console.error("SOAP Service Error:", error);
        throw new Error("SOAP Service Error");
    }
};

// Fonction pour parser la réponse SOAP
const parseSoapResponse = async (xmlData: string) => {
    try {
        const result = await parseStringPromise(xmlData, { explicitArray: false });
        // Accéder à la valeur utile dans la réponse SOAP
        const resultValue = result['SOAP-ENV:Envelope']['SOAP-ENV:Body']['simgr:GetResultValuesResponse']['result'];

        const embeddedXml = resultValue._;
        const embeddedParsed = await parseStringPromise(embeddedXml, { explicitArray: false });

        return embeddedParsed;
    } catch (error) {
        console.error("XML Parsing Error:", error);
        throw new Error("Failed to parse SOAP response");
    }
};




// Endpoint pour déconnecter un compteur
export const fetchResultValues = async (req: Request, res: Response, next: NextFunction) => {
    const id = 931995959; // ID de la session
    const meterNumber = "83795400"  //"1030700365704"; // Numéro de compteur
    const dateFrom = "2024-07-30"; // Date de début
    const dateTo = "2025-01-30"; // Date de fin

    try {
        const json = await callGetResultValuesSoapService(id, meterNumber, dateFrom, dateTo);

        const state = json.result?.state;
        console.log("first state", state);
        if (state !== "succeeded") {
            res.status(400).json({
                success: false,
                message: ``,
                result: { status: state || "failed", result: {} }, // Renvoie la réponse SOAP parsée
            });
        }

        const values = json.result?.payload?.data?.["value-list"]?.val || [];
        console.log("first values", values);
        const result: any = {};
        const list = Array.isArray(values) ? values : [values];

        list.forEach((val: any) => {
            const lb = val["@_lb"];
            const value = val["#text"];
            if (lb === "1.8.0") result.actif_im_i = value;
            if (lb === "1.6.0") result.p_max_i = value;
            if (lb === "2.6.0") result.p_max_o = value;
            if (lb === "2.8.0") result.actif_im_o = value;
            if (lb === "3.8.0") result.reactif_i = value;
            if (lb === "4.8.0") result.reactif_o = value;
        });

        res.status(HTTPSTATUS.OK).json({
            success: true,
            message: `Job Meter reading successfully`,
            result: { status: "succeeded", result }, // Renvoie la réponse SOAP parsée
        });

    } catch (error) {
        console.error("Error:", error);
    }
};