import { PrismaClient } from '@prisma/client';

import { AuthService } from '../../../src/modules/auth/auth.service';

// Instantiate the Prisma Client
const prisma = new PrismaClient();

type Bank = {
  name: string;
  code: string;
};

// List of banks
export const banks: Bank[] = [
  { name: 'AFRILAND', code: '01' },
  { name: 'BICEC', code: '11' },
  { name: 'SCB', code: '12' },
  { name: 'SGC', code: '13' },
  { name: 'CITIBANK', code: '14' },
  { name: 'CBC', code: '15' },
  { name: 'STANDARD', code: '16' },
  { name: 'ECOBANK', code: '17' },
  { name: 'UBA', code: '18' },
  { name: 'BANQUE ATLANTIQUE', code: '19' },
  { name: 'MEMO/COMPENSATION', code: '20' },
  { name: 'BGFI', code: '21' },
  { name: 'CCA', code: '22' },
  { name: 'UBC', code: '23' },
  { name: 'GBC', code: '24' },
  { name: 'ORANGE MONEY', code: '25' },
];


export async function seed_banks() {
  const existing = await (new AuthService()).getUserSYSTEM();

  if (!existing) {
    return
  }
  const bankPromises = banks.map(item =>
    prisma.bank.create({
      data: {
        name: item.name,
        code: item.code,
        createdBy: existing.id,
        updatedBy: existing.id
      },
    })
  );
  const createdBanks = await Promise.all(bankPromises);
  console.log(`✅ Created banks`);
  console.log(`${banks.map(bank => bank.name).join(', ')}`);
  createdBanks.forEach(item => {
    console.log(`- ${item.name.padEnd(40)} with id : ${item.id}`);
  });

}

