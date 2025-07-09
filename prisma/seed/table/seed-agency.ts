import { Agency, Prisma, PrismaClient } from '@prisma/client';

import { AuthService } from '../../../src/modules/auth/auth.service';

const prisma = new PrismaClient();

export const agencies = [
  { region: "DRC", delcom: 'DPC OBALA', agency: 'Agence OBALA' },
  { region: "DRC", delcom: 'DPC MFOU', agency: 'Agence MFOU' },
  { region: "DRC", delcom: 'DPC BAFIA', agency: 'Agence BAFIA' },
  { region: "DRC", delcom: 'DRC SIEGE', agency: 'Agence DRC SIEGE' },

  { region: "DRD", delcom: 'DVC DOUALA CENTRE', agency: 'Agence DOUALA CENTRE' },
  { region: "DRD", delcom: 'DVC DOUALA OUEST', agency: 'Agence DOUALA OUEST' },
  { region: "DRD", delcom: 'DVC DOUALA SUD', agency: 'Agence DOUALA SUD' },
  { region: "DRD", delcom: 'DVC DOUALA NORD', agency: 'Agence DOUALA NORD' },
  { region: "DRD", delcom: 'DVC DOUALA EST', agency: 'Agence DOUALA EST' },
  { region: "DRD", delcom: 'DRD SIEGE', agency: 'Agence DRD SIEGE' },

  { region: "DRE", delcom: 'DPC BERTOUA', agency: 'Agence BERTOUA' },
  { region: "DRE", delcom: 'DPC EST EXT', agency: 'Agence EST EXT' },
  { region: "DRE", delcom: 'DRE SIEGE', agency: 'Agence DRE SIEGE' },

  { region: "DRNEA", delcom: 'DLP EXTREME-NORD', agency: 'Agence EXTREME-NORD' },
  { region: "DRNEA", delcom: 'DLP ADAMAOUA', agency: 'Agence ADAMAOUA' },
  { region: "DRNEA", delcom: 'DPC NORD', agency: 'Agence NORD' },
  { region: "DRNEA", delcom: 'DRNEA SIEGE', agency: 'Agence DRNEA SIEGE' },

  { region: "DRONO", delcom: 'DPC BAMENDA', agency: 'Agence BAMENDA' },
  { region: "DRONO", delcom: 'DPC BAMENDA EXT', agency: 'Agence BAMENDA EXT' },
  { region: "DRONO", delcom: 'DVC OUEST 1 - BAF', agency: 'Agence OUEST 1 - BAF' },
  { region: "DRONO", delcom: 'DVC OUEST 1 NOUN', agency: 'Agence OUEST 1 NOUN' },
  { region: "DRONO", delcom: 'DVC OUEST 2NHT_NKAM', agency: 'Agence OUEST 2NHT_NKAM' },
  { region: "DRONO", delcom: 'DVC OUEST 2-MEN_BAMB', agency: 'Agence OUEST 2-MEN_BAMB' },
  { region: "DRONO", delcom: 'DRONO SIEGE', agency: 'Agence DRONO SIEGE' },

  { region: "DRSANO", delcom: 'DPC KRIBI', agency: 'Agence KRIBI' },
  { region: "DRSANO", delcom: 'DPC EDEA', agency: 'Agence EDEA' },
  { region: "DRSANO", delcom: 'DPC ESEKA', agency: 'Agence ESEKA' },
  { region: "DRSANO", delcom: 'DRSANO SIEGE', agency: 'Agence DRSANO SIEGE' },

  { region: "DRSM", delcom: 'DPC MBALMAYO', agency: 'Agence MBALMAYO' },
  { region: "DRSM", delcom: 'DPC SANGMELIMA', agency: 'Agence SANGMELIMA' },
  { region: "DRSM", delcom: 'DPC EBOLOWA', agency: 'Agence EBOLOWA' },
  { region: "DRSM", delcom: 'DRSM SIEGE', agency: 'Agence DRSM SIEGE' },

  { region: "DRSOM", delcom: 'DPC KUMBA', agency: 'Agence KUMBA' },
  { region: "DRSOM", delcom: 'DPC MOUNGO', agency: 'Agence MOUNGO' },
  { region: "DRSOM", delcom: 'DVC LIMBE', agency: 'Agence LIMBE' },
  { region: "DRSOM", delcom: 'DRSOM SIEGE', agency: 'Agence DRSOM SIEGE' },

  { region: "DRY", delcom: 'DVC YAOUNDE CENTRE', agency: 'Agence YAOUNDE CENTRE' },
  { region: "DRY", delcom: 'DVC YAOUNDE EST', agency: 'Agence YAOUNDE EST' },
  { region: "DRY", delcom: 'DVC YAOUNDE NORD', agency: 'Agenc YAOUNDE NORD' },
  { region: "DRY", delcom: 'DVC YAOUNDE OUEST', agency: 'Agence YAOUNDE OUEST' },
  { region: "DRY", delcom: 'DVC YAOUNDE SUD', agency: 'Agence YAOUNDE SUD' },
  { region: "DRY", delcom: 'DRY SIEGE', agency: 'Agence DRY SIEGE' },

  // { region: "SIEGE", delcom: 'SIEGE', agency: '' },
];

export async function seed_agency() {
  const existing = await (new AuthService()).getUserSYSTEM();

  if (!existing) {
    return
  }

  const createdAgencies: Agency[] = []; 

  const agencyPromises = agencies.map(async (item) => {
    const agencyName = item.agency.trim();
    const delcomName = item.delcom.trim();
    const regionName = item.region.trim();

    // Check if the agency already exists
    let existingAgency = await prisma.agency.findUnique({
      where: { name: agencyName }
    });

    // If the agency doesn't exist, create it
    if (!existingAgency) {
      // Check if the region already exists
      let region = await prisma.region.findUnique({
        where: { name: regionName }
      });

      if (!region) {
        console.error(`❌ Region [${regionName}] does not exist, skipping agency creation for [${agencyName}].`);
        return; // Skip this agency creation
      }
      // Check if the region already exists
      let delcom = await prisma.delcom.findUnique({
        where: {
          name: delcomName,
          regionId: region.id
        }
      });

      if (!delcom) {
        console.error(`❌ Delcom [${delcomName}] does not exist, skipping agency creation for [${agencyName}].`);
        return; // Skip this agency creation
      }

      try {
        const createdAgency = await prisma.agency.create({
          data: {
            name: agencyName,
            delcomId: delcom.id,
            createdBy: existing.id,
            updatedBy: existing.id
          }
        });
        createdAgencies.push(createdAgency); // Collect created agencys
      } catch (error) {
        console.error(`❌ Error creating agency [${agencyName}]:`);
        // Affichez des informations supplémentaires sur l'erreur
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          console.error(`Error Meta: ${JSON.stringify(error.meta)}`);
        }
      }
    } else {
      console.log(`❌ Agency [${agencyName}] already exists, skipping creation.`);
    }
  });

  // Wait for all promises to resolve
  await Promise.all(agencyPromises);

  // Log the created agencys
  console.log(`✅ Created agencies`);
  console.log(`${agencies.map(item => item.agency).join(', ')}`);
  createdAgencies.forEach(item => {
    console.log(`- ${item.name.padEnd(40)} with id : ${item.id}`);
  });

}
