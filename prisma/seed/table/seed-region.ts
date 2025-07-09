import { PrismaClient } from '@prisma/client';

import { AuthService } from '../../../src/modules/auth/auth.service';


// Instantiate the Prisma Client
const prisma = new PrismaClient();

// List of regions 
const regions: string[] = [
  'DRC',
  'DRD',
  'DRE',
  'DRNEA',
  'DRSANO',
  'DRSM',
  'DRSOM',
  'DRY',
  'DRONO',
  'SIEGE',
];

export async function seed_regions() {
  const existing = await (new AuthService()).getUserSYSTEM();

  if (!existing) {
    return
  }
  const regionPromises = regions.map(item =>
    prisma.region.create({
      data: {
        name: item,
        createdBy: existing.id,
        updatedBy: existing.id
      },
    })
  );
  const createdRegions = await Promise.all(regionPromises);
  console.log(`✅ Created regions`);
   console.log(`${createdRegions.map(s => s.name).join(', ')}`);
  createdRegions.forEach(item => {
    console.log(`- ${item.name.padEnd(40)} with id : ${item.id}`);
  });

}
