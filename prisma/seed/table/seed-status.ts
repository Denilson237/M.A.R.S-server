import { PrismaClient } from '@prisma/client';

import { AuthService } from '../../../src/modules/auth/auth.service';

// Instantiate the Prisma Client
const prisma = new PrismaClient();

// List of status 
const status: string[] = [
  'deleted',
  "draft",
  "initiated",
  "validated",
  "rejected",
  "pending_commercial_input",
  "pending_finance_validation",
  "processing",
  "treated"
];


export async function seed_status() {
  const existing = await (new AuthService()).getUserSYSTEM();

  if (!existing) {
    return
  }
  // insert Status
  const createdStatus = [];

  for (const item of status) {
    const created = await prisma.status.create({
      data: { name: item, 
        createdBy: existing.id,
        updatedBy: existing.id
      },
    });
    createdStatus.push(created);
  }
  console.log(`✅ Created status`);
  console.log(`${createdStatus.map(s => s.name).join(', ')}`);
  createdStatus.forEach(item => {
    console.log(`-  ${item.name.padEnd(40)} with id : ${item.id}`);
  });

}
