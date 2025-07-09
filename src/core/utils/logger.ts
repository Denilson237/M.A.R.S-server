import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Configuration des transports (fichiers, console, etc.)
const transports = [
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(), // Ajoute des couleurs pour la console
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Ajoute un timestamp
            winston.format.printf(({ timestamp, level, message }) => {
                return `${timestamp} [${level}]: ${message}`; // Format personnalisé
            }),
        ),
    }),
    new DailyRotateFile({
        filename: 'logs/log-error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxFiles: '30d', // Conserver les logs pendant 30 jours
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Ajoute un timestamp
            winston.format.printf(({ timestamp, level, message }) => {
                return `${timestamp} [${level}]: ${message}`; // Format personnalisé
            }),
        ),
    }),
    new DailyRotateFile({
        filename: 'logs/log-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '30d', // Conserver les logs pendant 30 jours
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Ajoute un timestamp
            winston.format.printf(({ timestamp, level, message }) => {
                return `${timestamp} [${level}]: ${message}`; // Format personnalisé
            }),
        ),
    }),
];

// Création du logger
export const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug', // Niveau de verbosité
    format: winston.format.json(), // Format par défaut (peut être utilisé pour d'autres transports)
    transports,
});