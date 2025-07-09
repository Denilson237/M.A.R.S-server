import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";

import { RoleName } from "./seed-role";
import { hashAsync } from '../../../src/core/utils/hash';
import { authService } from "../../../src/modules/auth/auth.module";
import { ADMIN_EMAIL, ADMIN_USERNAME, ADMIN_PASSWORD } from "../../../src/secrets";


const prisma = new PrismaClient();

export const USERS_DATA: UserData[] = [
    {
        people: {
            name: "admin",
            email: 'admin@eneo.cm',
        },
        user: {
            username: 'user.admin',
            password: 'admin',
            role: 'ADMIN'
        }
    },
    {
        people: {
            name: "admintech",
            email: 'admintech@eneo.cm',
        },
        user: {
            username: 'user.admintech',
            password: 'password',
            role: 'ADMIN/TECHNIQUE'
        }

    },
    {
        people: {
            name: "adminfunct",
            email: 'adminfunct@eneo.cm',
        },
        user: {
            username: 'user.adminfunct',
            password: 'password',
            role: 'ADMIN/FUNCTIONAL'
        }
    },
    {
        people: {
            name: "mms",
            email: 'mms@eneo.cm',
        },
        user: {
            username: 'user.mms',
            password: 'password',
            role: 'MMS-OPERATOR'
        }
    },
    {
        people: {
            name: "dr",
            email: 'dr@eneo.cm',
        },
        user: {
            username: 'user.dr',
            password: 'password',
            role: 'DR'
        }
    },
    {
        people: {
            name: "delcom",
            email: 'delcom@eneo.cm',
            delcom: "DVC DOUALA NORD",
            region: "DRD"
        },
        user: {
            username: 'user.delcom',
            password: 'password',
            role: 'DELCOM'
        }
    },
    {
        people: {
            name: "ca",
            email: 'ca@eneo.cm',
            agency: "Agence01",
            delcom: "DVC DOUALA NORD",
            region: "DRD"
        },
        user: {
            username: 'user.ca',
            password: 'password',
            role: 'CA'
        }
    },
    {
        people: {
            name: "kam",
            email: 'kam@eneo.cm',
            agency: "Agence01",
            delcom: "DVC DOUALA NORD",
            region: "DRD"
        },
        user: {
            username: 'user.kam',
            password: 'password',
            role: 'KAM'
        }
    },
    {
        people: {
            name: "kamsiege",
            email: 'kamsiege@eneo.cm',
            agency: "Agence01",
            delcom: "SIEGE",
            region: "SIEGE"
        },
        user: {
            username: 'user.kamsiege',
            password: 'password',
            role: 'KAM'
        }
    },
    {
        people: {
            name: "gc",
            email: 'gc@eneo.cm',
            agency: undefined,
            delcom: "SIEGE",
            region: "SIEGE"
        },
        user: {
            username: 'user.gc',
            password: 'password',
            role: 'GC'
        }
    },
    {
        people: {
            name: "manager",
            email: 'manager@eneo.cm',
            agency: undefined,
            delcom: "SIEGE",
            region: "SIEGE"
        },
        user: {
            username: 'user.manager',
            password: 'password',
            role: 'MANAGER'
        }
    },
];

export async function createSystemUser() {
    const SYSTEM_USER_DATA = {
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        name: ADMIN_USERNAME,
        password: ADMIN_PASSWORD
    };

    // Vérifier si l'utilisateur système existe déjà
    const existingSystemUser = await prisma.user.findUnique({
        where: { username: SYSTEM_USER_DATA.username },
        include: { People: true }
    });

    if (existingSystemUser) {
        console.log('System super admin ulready existe :', existingSystemUser.id);
        return existingSystemUser;
    }

    return await prisma.$transaction(async (tx: any) => {
        // 1. Créer l'entrée People
        const systemPeople = await tx.people.create({
            data: {
                name: SYSTEM_USER_DATA.name,
                email: SYSTEM_USER_DATA.email,
                createdBy: randomUUID(),
                updatedBy: randomUUID(),
            }
        });

        // 2. Créer l'User
        const systemUser = await tx.user.create({
            data: {
                username: SYSTEM_USER_DATA.username,
                ldap: false,
                password: await hashAsync(SYSTEM_USER_DATA.password),
                peopleId: systemPeople.id,
                isActive: true,
                createdBy: randomUUID(),
                updatedBy: randomUUID(),
            }
        });

        // 3. Mettre à jour les références circulaires
        await tx.people.update({
            where: { id: systemPeople.id },
            data: {
                createdBy: systemUser.id,
                updatedBy: systemUser.id
            }
        });

        const result = await tx.user.update({
            where: { id: systemUser.id },
            data: {
                createdBy: systemUser.id,
                updatedBy: systemUser.id
            }
        });
        console.log(`✅ Created system super admin User`);
        console.log(`${systemUser.username} -> id : ${systemUser.id}`);
        return result
    });
}

export async function seed_users() {
    try {
        const existing = await authService.getUserSYSTEM();

        if (!existing) {
            return
        }

        return await prisma.$transaction(async (tx) => {
            const createdUsers = [];
            const createdPeople = [];

            for (const userData of USERS_DATA) {
                // Check if user already exists
                const existingUser = await tx.user.findUnique({
                    where: { username: userData.user.username }
                });

                if (existingUser) {
                    console.log(`❌ User ${userData.user.username} already exists`);
                    continue;
                }

                // Create People record
                const people = await tx.people.create({
                    data: {
                        name: userData.people.name,
                        email: userData.people.email,
                        //delcomId: userData.people.delcom,
                        createdBy: existing.id,
                        updatedBy: existing.id
                    }
                });

                // Create User record
                const user = await tx.user.create({
                    data: {
                        username: userData.user.username,
                        password: await hashAsync(userData.user.password),
                        ldap: false,
                        isActive: true,
                        peopleId: people.id,
                        createdBy: existing.id,
                        updatedBy: existing.id
                    }
                });


                // Handle agency relationship if specified
                if (userData.people.agency) {
                    const agency = await tx.agency.findFirst({
                        where: { name: userData.people.agency }
                    });

                    if (agency) {
                        await tx.people.update({
                            where: { id: people.id },
                            data: {
                                Agency: { connect: { id: agency.id } }
                            }
                        });
                    }
                }

                createdPeople.push({ people, user });
                createdUsers.push({ ...user, role: userData.user.role });
            }

            console.log(`✅ Created people`);
            console.log(`${createdPeople.map(item => item.people.name).join(', ')}`);
            createdPeople.forEach(item => {
                console.log(`- ${item.people.name.padEnd(40)} with id : ${item.people.id}`);
            });

            console.log(` `);
            console.log(`✅ Created users`);
            console.log(`${createdUsers.map(item => item.username).join(', ')}`);
            createdUsers.forEach(item => {
                console.log(`- ${item.username.padEnd(40)} with id : ${item.id}`);
            });

            return createdUsers;
        });
    } catch (error: any) {
        console.error('\n❌ USER SEEDING ERROR');
        console.error('─────────────────────────────────────────────');
        console.error('Error:', error.message);
        console.error('─────────────────────────────────────────────');
    }
}

export interface UserData {
    people: {
        name: string;
        email: string;
        delcom?: string;
        region?: string;
        agency?: string;
    };
    user: {
        username: string;
        password: string;
        role?: RoleName
    };
}