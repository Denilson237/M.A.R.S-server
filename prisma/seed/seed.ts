import { PrismaClient } from '@prisma/client';

import { redis } from '../../src/core/utils/redis';

import { reset } from './seed-reset';
import { seed_banks } from './table/seed-bank';
import { seed_roles } from './table/seed-role';
import { seed_status } from './table/seed-status';
import { seed_agency } from './table/seed-agency';
import { seed_delcoms } from './table/seed-delcom';
import { seed_regions } from './table/seed-region';
import { seed_workflow } from './table/seed-workflow';
import { seed_paymentModes } from './table/seed-paymode';
import { seed_bankAgencies } from './table/seed-bankAgency';
import { seed_permissions } from './table/seed-permissions';
import { createSystemUser, seed_users } from './table/seed-user';
import { importCsvToDatabase } from './table/seed-customerReference';
import { seed_ticketTypes } from './table/seed-ticketType';


const prisma = new PrismaClient();

async function main() {

  console.log(`##########################`);
  console.log(`##      Start seeding   ##`);
  console.log(`##########################`);

  // Clean redis cache
  redis.flushdb();
  console.log(`Cache cleared.`);
  console.log(`  `);

  /////////////////////////////////////

  // Clear database tables
  await reset();
  console.log(`Tables cleared.`);
  console.log(`  `);

  /////////////////////////////////////

  // Exécution du script
  const system = await createSystemUser();
  console.log(`  `);

  /////////////////////////////////////

  // Insert Status 
  await seed_status();
  console.log(`  `);

  /////////////////////////////////////

  // Insert Banks 
  await seed_banks();
  console.log(`  `);

  /////////////////////////////////////

  // Insert Banks Agencies(Branch) 
  await seed_bankAgencies();
  console.log(`  `);

  /////////////////////////////////////

  // Insert Payment Modes
  await seed_paymentModes();
  console.log(`  `);

  /////////////////////////////////////

  // Insert Regions
  await seed_regions()
  console.log(`  `);

  /////////////////////////////////////

  // Insert Delcom
  await seed_delcoms()
  console.log(`  `);

  /////////////////////////////////////

  // Insert Agency
  await seed_agency()
  console.log(`  `);

  /////////////////////////////////////

  // Insert Roles
  const createdRoles = await seed_roles()
  console.log(`  `);

  /////////////////////////////////////

  // Insert Permissions
  const createdPermissions = await seed_permissions();
  console.log(`  `);

  /////////////////////////////////////

  // Insert Types
  await seed_ticketTypes();
  console.log(`  `);

  /////////////////////////////////////

  // Insert users
  const createdUsers = await seed_users();
  console.log(`  `);

  /////////////////////////////////////

  // (Optional) Associate roles with users
  if (
    system &&
    createdUsers &&
    createdUsers.length > 0
  ) {
    try {
      const roleAssignmentResults = await Promise.allSettled(
        createdUsers.map(async (user) => {
          // 1. Find the role
          const role = await prisma.role.findFirst({
            where: { name: user.role },
            select: { id: true, name: true }
          })
          if (!role) {
            console.warn(`⚠️ Role ${user.role} not found for user ${user.username}`);
            return null;
          }
          // 2. Create the user-role relationship
          const userRole = await prisma.userRole.upsert({
            where: {
              userId_roleId: {
                userId: user.id,
                roleId: role.id
              }
            },
            create: {
              userId: user.id,
              roleId: role.id,
              isDefault: true,
              createdBy: system.id,
              updatedBy: system.id
            },
            update: {} // No updates needed if exists
          });

          return { user, userRole };
        })
      )

      // 3. Handle results and errors
      console.log(`✅ Created user_roles`);
      roleAssignmentResults.forEach((result) => {
        if (result.status === 'rejected') {
          console.error('❌ Role assignment failed:', result.reason);
        }
        if (result.status === 'fulfilled') {
          console.log(`- U : ${(result.value?.user.username.padEnd(10) + ' - R : ' + result.value?.user.role?.padEnd(10)).padEnd(40)}`);
        }
      });
    } catch (error) {
      console.error('🔥 Error during role assignments:', error);
    }

  }

  if (
    system
    && createdRoles
    && createdRoles.length > 0
    && createdPermissions
    && createdPermissions.length > 0
  ) {
    for (const role of createdRoles.slice(0, 1)) {
      for (const permission of createdPermissions) {
        const db = await prisma.permission.findUnique({
          where: { name: permission.name }
        })
        if (db) {
          await prisma.rolePermission.create({
            data: {
              roleId: role.id,
              permissionId: db.id,
              createdBy: system.id,
              updatedBy: system.id
            }
          });
        }

      }
    }
  }

  /////////////////////////////////////

  // Insert Banks 
  console.log(`  `);
  await seed_workflow();
  console.log(`  `);

  /////////////////////////////////////

  // Customer_reference import 
  const filePath = '/home/hervengando/clients.csv';
  await importCsvToDatabase(filePath);

  console.log(`##########################`);
  console.log(`##   Seeding finished.  ##`);
  console.log(`##########################`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(1);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
