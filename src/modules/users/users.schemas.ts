import { z } from 'zod'

const idSchema = z.string().min(1).uuid();

const signUpSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    unitId: z.string().nullable().optional(),
    username: z.string(),
    password: z.string().min(6),
    ldap: z.boolean().optional(),
    roleId: z.union([
        z.string(), // Pour un seul rôle
        z.array(z.string()) // Pour plusieurs rôles
    ]).optional() // Rendre cette propriété optionnelle
})


const updateSchema = z.object({
    name: z.string().min(3).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    unitId: z.string().nullable().optional(),
    password: z.string().min(6).optional(),
    ldap: z.boolean().optional(),
    roleId: z.array(z.string()).optional() // Rendre cette propriété optionnelle
})

const userRoleSchema = z.object({
    userId: z.string().min(1, "userId is required").uuid("userId input format is not available"),
    roleId: z.string().min(1, "roleId is required").uuid("roleId input format is not available"),
})

interface IUser {
    name: string;
    email: string;
    phone?: string;
    unitId?: string;
    username: string;
    password: string;
    ldap?: boolean;
    avatar?: string;
    roleId?: string | string[];
}
export { IUser }
export { signUpSchema , idSchema,updateSchema, userRoleSchema }