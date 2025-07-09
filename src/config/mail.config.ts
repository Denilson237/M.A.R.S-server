import { SMTP_CIPHERS, SMTP_HOST, SMTP_MAIL, SMTP_PASSWORD, SMTP_PORT, SMTP_SERVICE } from "../secrets";

export const mailConfig : any = {
    service: SMTP_SERVICE ?? 'smtp-mail.outlook.com',
    host: SMTP_HOST ?? '',
    port: SMTP_PORT ?? "587",
    tls: {
        ciphers: SMTP_CIPHERS ?? "SSLv3",
        rejectUnauthorized: false,
    },
    auth: {
        user: SMTP_MAIL ?? '',
        pass: SMTP_PASSWORD ?? '',
    }
} 