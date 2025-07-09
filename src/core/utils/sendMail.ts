import ejs from "ejs";
import path from "path";
import nodemailer, { Transporter } from "nodemailer"

import { mailConfig } from "../../config/mail.config";
import { SMTP_MAIL } from "../../secrets";

interface IEmailOptions {
    email: string,
    subject: string,
    template: string,
    data: { [key: string]: any },
}

const sendMail = async (options: IEmailOptions): Promise<void> => {
 
    const transporter: Transporter = nodemailer.createTransport(mailConfig);

    const { email, subject, template, data } = options;

    // Get the path to the email templae file
    const templatePath = path.join(__dirname, "../../mails", template)

    // Render the email tamplate with EJS
    const html = await ejs.renderFile(templatePath, data);

    const mailOptions = {
        from: SMTP_MAIL,
        to: email,
        subject,
        html
    }

    await transporter.sendMail(mailOptions);
}

export default sendMail;