import fs from 'fs';
import path from 'path';
import { Client } from 'ssh2';

import {
    FTP_HOST,
    FTP_PASSWORD,
    FTP_USER,
    FTP_PORT,
    FTP_LOCAL_PATH,
    FTP_REMOTE_PATH,
    FTP_BACKUP_PATH
} from '../../secrets';

const logFilePath = './upload_log.txt'; // Chemin du fichier de log

const conn = new Client();

// Fonction pour écrire dans le fichier de log
const logMessage = (message: string) => {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFilePath, `${timestamp} - ${message}\n`, 'utf8');
};

conn.on('ready', () => {
    logMessage('Client :: ready');
    conn.sftp((err, sftp) => {
        if (err) {
            logMessage(`Erreur lors de l'ouverture de SFTP : ${err.message}`);
            throw err;
        }

        // Envoyer le fichier
        sftp.fastPut(FTP_LOCAL_PATH, FTP_REMOTE_PATH, {}, (err) => {
            if (err) {
                logMessage(`Erreur lors de l'envoi du fichier : ${err.message}`);
                throw err;
            }
            logMessage('Fichier envoyé avec succès !');

            // Déplacer le fichier vers le dossier de sauvegarde
            const date = new Date().toISOString().split('T')[0]; // Formater la date
            const fileName = path.basename(FTP_LOCAL_PATH);
            const backupFilePath = path.join(FTP_BACKUP_PATH, `${fileName}_${date}`); // Nouveau chemin avec date

            sftp.rename(FTP_REMOTE_PATH, backupFilePath, (err) => {
                if (err) {
                    logMessage(`Erreur lors du déplacement du fichier : ${err.message}`);
                    throw err;
                }
                logMessage(`Fichier déplacé vers le dossier de sauvegarde : ${backupFilePath}`);
                conn.end();
            });
        });
    });
}).connect({
    host: FTP_HOST,
    port: FTP_PORT,
    username: FTP_USER,
    password: FTP_PASSWORD
});