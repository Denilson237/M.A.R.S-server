import fs from 'fs';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

import { AuthService } from '../../../src/modules/auth/auth.service';


const prisma = new PrismaClient();

export async function importCsvToDatabase(filePath: string) {
  const results: any[] = [];

  const existing = await (new AuthService()).getUserSYSTEM();

  if (!existing) {
    return
  }

  return new Promise<void>((resolve, reject) => {
    console.log(`Tentative de lecture du fichier : ${filePath}`);

    // Vérifiez si le fichier existe avant de le lire
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`Le fichier n'existe pas : ${filePath}`);
        reject(err);
        return;
      }

      fs.createReadStream(filePath)
        .pipe(csv({ separator: ';' }))
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', async () => {
          try {
            for (const row of results) {
              await prisma.customerReference.create({
                data: {
                  region: row.REGION,
                  agency: row.AGENCE,
                  service_no: row.NO_SERVICE,
                  client_code: row.COD_CLI,
                  status: row.STATUT_DU_CONTRAT,
                  client: row.CLIENT,
                  category: row.CATEGORIE,
                  supply_ref: row.SUPPLY_REF,
                  meter_no: row.METER_NO,
                  contact: row.CONTACT ?? null,
                  createdBy: existing.id,
                  updatedBy: existing.id
                },
              });
            }
            console.log('Importation terminée avec succès !');
            resolve();
          } catch (error) {
            console.error('Erreur lors de l\'importation :', error);
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        })
        .on('error', (error) => {
          console.error('Erreur lors de la lecture du fichier CSV :', error);
          reject(error);
        });
    });
  });
}


