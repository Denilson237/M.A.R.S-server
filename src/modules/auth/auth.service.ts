import prismaClient from "../../core/utils/prismadb";
import { IActivationToken, IRegisterRequest } from "./auth.schemas";
import BadRequestException from "../../core/exceptions/bad-requests";
import { HTTPSTATUS } from "../../config/http.config";
import { ErrorCode } from "../../core/enums/error-code.enum";
import { isValidPassword, passwordPolicy } from "../../core/utils/validator";
import { ACTIVATION_TOKEN_EXPIRE, ACTIVATION_TOKEN_SECRET, MAIL_NO_REPLY } from "../../secrets";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { E_SourceType as SourceType } from "@prisma/client";

import { accessTokenOptions, expiredFormat, refreshTokenOptions, sendToken } from "../../core/utils/jwt";

export class AuthService {

    public async signup(registerData: IRegisterRequest) {
        const { name, email, username, password } = registerData;

        if (!name || !username || !email || !password) {
            throw new BadRequestException(
                "Please enter your name, email , username and password", 
                ErrorCode.VALIDATION_UNFULLFIELD_REQUIRED_FIELD
            );
        }

        if (!isValidPassword(password)) {
            throw new BadRequestException(`Invalid Password : ${passwordPolicy}`, ErrorCode.VALIDATION_INVALID_DATA);
        }

        // check if the username already exists in the database
        const ifUsernameExist = await prismaClient.user.findFirst({ where: { username: username } });
        if (ifUsernameExist) {
            throw new BadRequestException("Username already exist", ErrorCode.RESSOURCE_ALREADY_EXISTS);
        }

        // check if the email already exists in the database
        const ifEmailExist = await prismaClient.people.findFirst({ where: { email: email } });
        if (ifEmailExist) {
            throw new BadRequestException("Email already exist", ErrorCode.RESSOURCE_ALREADY_EXISTS);
        }

        const user: IRegisterRequest = {
            name,
            email,
            username,
            password,
        };

        const activationToken = this.createActivationToken(user);
        // activationCode
        const activationCode = activationToken.activationCode;
        // TTL of the activation token
        const activationCodeExpire = Math.floor(
            parseInt(ACTIVATION_TOKEN_EXPIRE) / 60
        );

        return  {
            user: { name: user.name },
            activationCode,
            activationCodeExpire,
            supportmail: MAIL_NO_REPLY
        };
    };

    /**
     * Generates an activation token containing a random activation code for a user.
     * @param {any} user - The `user` parameter in the `createActivationToken` function is an object that
     * represents the user for whom the activation token is being created. It likely contains information
     * about the user, such as their username, email, and other relevant details.
     * @returns returns an object with two properties: `token` and `activationCode`. 
     */
    public createActivationToken = (user: any): IActivationToken => {
        const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
        const token = jwt.sign(
            { user, activationCode },
            ACTIVATION_TOKEN_SECRET as Secret,
            { expiresIn: expiredFormat(ACTIVATION_TOKEN_EXPIRE) }
        );

        return { token, activationCode };
    };

    public getUserSYSTEM = async () => {
        const system = await prismaClient.user.findUnique({
            where: { username: "SYSTEM" }
        });
        if (!system) {
            console.error("\n❌ System User Creation Failed: Reference user does not exist");
            console.error("│");
            console.error("├─ Problem: The seed process requires an existing system user to set relational fields");
            console.error("│           (createdBy/updatedBy), but no valid system user was found in the database.");
            console.error("│");
            console.error("├─ Solution: First create a system user manually with minimal privileges, then");
            console.error("│            run this seed script again. Alternatively, modify the seed script to");
            console.error("│            handle the initial bootstrap case.");
            console.error("│");
            console.error(`└─ Technical Details: Foreign key constraint failed on field: createdBy`);
            console.error("   (Prisma error code: P2003 - Foreign key constraint failed)\n");
        }

        return system
    }

}