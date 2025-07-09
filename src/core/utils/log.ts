import fs from 'fs';
import path from 'path';

// Énumération pour les niveaux de log
export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

// Énumération pour les types d'erreur
export enum LogType {
  VALIDATION = 'VALIDATION',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  GENERAL = 'GENERAL',
}


// Fonction pour écrire dans le fichier de log
export function writeLogEntry  (
  message: string, 
  level: LogLevel = LogLevel.ERROR, 
  type: LogType = LogType.GENERAL, 
  errors?: string | object | Array<string | object> ) {
  const logDir = path.join(__dirname, '../../../logs'); // Répertoire des logs
  const today = new Date().toISOString().split('T')[0]; // Obtenir la date au format YYYY-MM-DD
  const logFilePath = path.join(logDir, `log-${today}.log`); // Chemin du fichier de log quotidien

  // Créer le répertoire s'il n'existe pas
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const now = new Date();
  const timestamp = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

  // Formater le message d'erreur
  let  logMessage = `${timestamp} - ${level} - ${type}: ${message}\n`;

  // Ajouter des informations supplémentaires si elles existent
  if (errors) {
    logMessage += `Additional Info: ${JSON.stringify(errors)}\n`;
  }

  // Vérifier si le fichier du jour existe déjà
  fs.access(logFilePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Le fichier n'existe pas, on peut le créer
      fs.writeFile(logFilePath, logMessage, (writeErr) => {
        if (writeErr) {
          console.error('Failed to create log file:', writeErr);
        }
      });
    } else {
      // Le fichier existe, on l'append
      fs.appendFile(logFilePath, logMessage, (appendErr) => {
        if (appendErr) {
          console.error('Failed to write to log file:', appendErr);
        }
      });
    }
  });
}
