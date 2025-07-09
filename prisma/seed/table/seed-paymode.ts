import { PrismaClient } from '@prisma/client';

import { AuthService } from '../../../src/modules/auth/auth.service';


// Instantiate the Prisma Client
const prisma = new PrismaClient();

// List of payment methods
const paymentModes: string[] = [
  'CHECQUE',
  'COMPENSATION',
  'VIREMENT',
  'TRAITE',
  'VERSEMENT ESPECE',
  'MEMO'
];

export async function seed_paymentModes() {
  const existing = await (new AuthService()).getUserSYSTEM();

  if (existing) {
    const payModePromises = paymentModes.map(item =>
      prisma.paymentMode.create({
        data: {
          name: item,
          createdBy: existing.id,
          updatedBy: existing.id
        },
      })
    );
    const createdPaymentModes = await Promise.all(payModePromises);
    console.log(`✅ Created paymentModes`);
    console.log(`${paymentModes.join(', ')}`);
    createdPaymentModes.forEach(item => {
      console.log(`- ${item.name.padEnd(40)} with id : ${item.id}`);
    });
  }


}
