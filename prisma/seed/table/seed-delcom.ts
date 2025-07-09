import { Prisma, PrismaClient } from '@prisma/client';

import { AuthService } from '../../../src/modules/auth/auth.service';


const prisma = new PrismaClient();

export const delcoms = [
  { region: 'DRC', delcom: 'DPC OBALA' },
  { region: 'DRC', delcom: 'DPC MFOU' },
  { region: 'DRC', delcom: 'DPC BAFIA' },
  { region: 'DRC', delcom: 'DRC SIEGE' },

  { region: 'DRD', delcom: 'DVC DOUALA CENTRE' },
  { region: 'DRD', delcom: 'DVC DOUALA OUEST' },
  { region: 'DRD', delcom: 'DVC DOUALA SUD' },
  { region: 'DRD', delcom: 'DVC DOUALA NORD' },
  { region: 'DRD', delcom: 'DVC DOUALA EST' },
  { region: 'DRD', delcom: 'DRD SIEGE' },

  { region: 'DRE', delcom: 'DPC BERTOUA' },
  { region: 'DRE', delcom: 'DPC EST EXT' },
  { region: 'DRE', delcom: 'DRE SIEGE' },

  { region: 'DRNEA', delcom: 'DLP EXTREME-NORD' },
  { region: 'DRNEA', delcom: 'DLP ADAMAOUA' },
  { region: 'DRNEA', delcom: 'DPC NORD' },
  { region: 'DRNEA', delcom: 'DRNEA SIEGE' },

  { region: 'DRONO', delcom: 'DPC BAMENDA' },
  { region: 'DRONO', delcom: 'DPC BAMENDA EXT' },
  { region: 'DRONO', delcom: 'DVC OUEST 1 - BAF' },
  { region: 'DRONO', delcom: 'DVC OUEST 1 NOUN' },
  { region: 'DRONO', delcom: 'DVC OUEST 2NHT_NKAM' },
  { region: 'DRONO', delcom: 'DVC OUEST 2-MEN_BAMB' },
  { region: 'DRONO', delcom: 'DRONO SIEGE' },

  { region: 'DRSANO', delcom: 'DPC KRIBI' },
  { region: 'DRSANO', delcom: 'DPC EDEA' },
  { region: 'DRSANO', delcom: 'DPC ESEKA' },
  { region: 'DRSANO', delcom: 'DRSANO SIEGE' },

  { region: 'DRSM', delcom: 'DPC MBALMAYO' },
  { region: 'DRSM', delcom: 'DPC SANGMELIMA' },
  { region: 'DRSM', delcom: 'DPC EBOLOWA' },
  { region: 'DRSM', delcom: 'DRSM SIEGE' },

  { region: 'DRSOM', delcom: 'DPC KUMBA' },
  { region: 'DRSOM', delcom: 'DPC MOUNGO' },
  { region: 'DRSOM', delcom: 'DVC LIMBE' },
  { region: 'DRSOM', delcom: 'DRSOM SIEGE' },

  { region: 'DRY', delcom: 'DVC YAOUNDE CENTRE' },
  { region: 'DRY', delcom: 'DVC YAOUNDE EST' },
  { region: 'DRY', delcom: 'DVC YAOUNDE NORD' },
  { region: 'DRY', delcom: 'DVC YAOUNDE OUEST' },
  { region: 'DRY', delcom: 'DVC YAOUNDE SUD' },
  { region: 'DRY', delcom: 'DRY SIEGE' },

  { region: 'SIEGE', delcom: 'SIEGE' }
];

export async function seed_delcoms() {
  const existing = await (new AuthService()).getUserSYSTEM();

  if (!existing) {
    return
  }

  const createdDelcoms: { id: string; name: string; createdAt: Date; updatedAt: Date; regionId: string; }[] = []; // Array to hold created delcoms

  const delcomPromises = delcoms.map(async (item) => {
    const delcomName = item.delcom.trim();
    const regionName = item.region.trim();

    // Check if the delcom already exists
    let existingDelcom = await prisma.delcom.findUnique({
      where: { name: delcomName }
    });

    // If the delcom doesn't exist, create it
    if (!existingDelcom) {
      // Check if the region already exists
      let region = await prisma.region.findUnique({
        where: { name: regionName }
      });

      if (!region) {
        console.error(`Region [${regionName}] does not exist, skipping delcom creation for [${delcomName}].`);
        return; // Skip this delcom creation
      }

      try {
        const createdDelcom = await prisma.delcom.create({
          data: {
            name: delcomName,
            regionId: region.id,
            createdBy: existing.id,
            updatedBy: existing.id
          }
        });
        createdDelcoms.push(createdDelcom); // Collect created delcoms
      } catch (error) {
        console.error(`Error creating delcom [${delcomName}]:`);
        // Affichez des informations supplémentaires sur l'erreur
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          console.error(`Error Meta: ${JSON.stringify(error.meta)}`);
        }
      }
    } else {
      console.log(`Delcom [${delcomName}] already exists, skipping creation.`);
    }
  });

  // Wait for all promises to resolve
  await Promise.all(delcomPromises);

  // Log the created delcoms
  console.log(`✅ Created delcoms`);
  console.log(`${delcoms.map(item => item.delcom).join(', ')}`);
  createdDelcoms.forEach(item => {
    console.log(`- ${item.name.padEnd(40)} with id : ${item.id}`);
  });

}
