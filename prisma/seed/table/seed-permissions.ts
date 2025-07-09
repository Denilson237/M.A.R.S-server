import { PrismaClient } from '@prisma/client';

import { serviceType } from '../../../src/constants/enum';
import { AuthService } from '../../../src/modules/auth/auth.service';



// Instantiate the Prisma Client
const prisma = new PrismaClient();

// Begin declarate List of permissions
const services = Object.values(serviceType);

// Définition du type pour les permissions
interface PermissionDefinition {
  name: string;
  description: string;
}

// Permissions de base avec descriptions
const basePermissions: PermissionDefinition[] = [
  { name: 'CREATE', description: 'Permission de créer une ressource' },
  { name: 'READ', description: 'Permission de lire une ressource' },
  { name: 'WRITE', description: 'Permission d\'écrire dans une ressource' },
  { name: 'UPDATE', description: 'Permission de mettre à jour une ressource' },
  { name: 'DELETE', description: 'Permission de supprimer une ressource' },
  { name: 'BULKCREATE', description: 'Permission de créer plusieurs ressources en masse' },
  { name: 'BULKDELETE', description: 'Permission de supprimer plusieurs ressources en masse' },
];


export async function seed_permissions() {
  const existing = await (new AuthService()).getUserSYSTEM();

  if (existing) {
    const servicePermissions = services.flatMap(service => {
      const ressource = service.toUpperCase();
      return basePermissions.map(permission => ({
        name: `${ressource}-${permission.name}`,
        description: `${permission.description} ${ressource}`
      }));
    });

    // Combinaison de toutes les permissions
    const allPermissions = [...servicePermissions];

    // Vérification des permissions existantes
    const existingPermissions = await prisma.permission.findMany();
    const existingNames = new Set(existingPermissions.map(p => p.name));

    // Filtrage des nouvelles permissions à créer
    const permissionsToCreate = allPermissions.filter(
      p => !existingNames.has(p.name)
    );

    if (permissionsToCreate.length > 0) {
      const createdPermissions = await prisma.$transaction(
        permissionsToCreate.map(permission =>
          prisma.permission.create({
            data: {
              name: permission.name,
              description: permission.description,
              createdBy: existing.id, 
              updatedBy: existing.id
            }
          })
        )
      );

      console.log(`✅ Created Permissions`);
      console.log(`${createdPermissions.map(item => item.name).join(', ')}`);
      createdPermissions.forEach(item => {
        console.log(`- ${item.name.padEnd(40)}: ${item.description}`);
      });
      return createdPermissions;
    } else {
      console.log('ℹ️ Toutes les permissions existent déjà');
      return [];
    }
  }
}
