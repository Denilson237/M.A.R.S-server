import { z } from 'zod'

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

interface IUser extends Document {
    name: string;
    email: string;
    username: string;
    password: string;
    role: string;
    isVerified: boolean;
    comparePassword: (password: string) => Promise<boolean>;
    signAccessToken: () => string;
    signRefreshToken: () => string;
}


interface IRegisterRequest {
    name: string;
    email: string;
    username: string;
    password: string;
    avatar?: string;
}

interface IActivationToken {
    token: string;
    activationCode: string;
}

interface IActivationRequest {
    activation_token: string;
    activation_code: string;
}

interface ILoginRequest {
    username: string;
    password: string;
    roleId?: string;
}

export { signUpSchema }
export { IRegisterRequest , IActivationRequest , IActivationToken ,IUser, ILoginRequest}