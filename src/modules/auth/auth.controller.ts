import { NextFunction, Request, Response } from "express";
import ejs from "ejs";
import path from "path";
import bcrypt from "bcrypt";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { E_SourceType as SourceType } from "@prisma/client";

import { accessTokenOptions, expiredFormat, refreshTokenOptions, sendToken } from "../../core/utils/jwt";
import { redis } from "../../core/utils/redis";
import sendMail from "../../core/utils/sendMail";
import prismaClient from "../../core/utils/prismadb";
import { trackingService } from "../../constants/enum";
import NotFoundException from "../../core/exceptions/not-found";
import { ldapLogin } from "../../core/utils/authentificationService";
import BadRequestException from "../../core/exceptions/bad-requests";
import UnauthorizedException from "../../core/exceptions/unauthorized";
import ConfigurationException from "../../core/exceptions/configuration";
import { isValidPassword, passwordPolicy } from "../../core/utils/validator";
import HttpException from "../../core/exceptions/http-exception";
import { IActivationRequest, IActivationToken, ILoginRequest, IRegisterRequest, IUser, signUpSchema } from "./auth.schemas";
import { ACCESS_TOKEN_EXPIRE, ACCESS_TOKEN_SECRET, ACTIVATION_TOKEN_EXPIRE, ACTIVATION_TOKEN_SECRET, MAIL_NO_REPLY, REDIS_SESSION_EXPIRE, REFRESH_TOKEN_EXPIRE, REFRESH_TOKEN_SECRET, SALT_ROUNDS } from "../../secrets";

import { UserEntity } from "./entities/user";
import { AuthService } from "./auth.service";
import { HTTPSTATUS } from "../../config/http.config";
import { ErrorCode } from "../../core/enums/error-code.enum";


export class AuthController {
    private readonly authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    public signup =
        async (req: Request, res: Response, next: NextFunction) => {
            signUpSchema.parse(req.body);
            const { name, email, username, password } = req.body as IRegisterRequest;

            if (!name || !username || !email || !password) {
                throw new BadRequestException("Please enter your name, email , username and password", ErrorCode.VALIDATION_UNFULLFIELD_REQUIRED_FIELD);
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

            const activationToken = this.authService.createActivationToken(user);
            // activationCode
            const activationCode = activationToken.activationCode;
            // TTL of the activation token
            const activationCodeExpire = Math.floor(
                parseInt(ACTIVATION_TOKEN_EXPIRE) / 60
            );

            const data = {
                user: { name: user.name },
                activationCode,
                activationCodeExpire,
                supportmail: MAIL_NO_REPLY
            };

            const html = await ejs.renderFile(
                path.join(__dirname, "../../mails/activation.mail.ejs"),
                data
            );

            try {
                await sendMail({
                    email: user.email,
                    subject: "Activation of your account",
                    template: "activation.mail.ejs",
                    data,
                });

                res.status(HTTPSTATUS.CREATED).json({
                    success: true,
                    message: `Please check your email : ${user.email} to activate your account`,
                    activationToken: activationToken.token,
                });
            } catch (error: any) {
                throw new HttpException(error.message, 500, ErrorCode.INTERNAL_SERVER_ERROR, null);
            }

        };


    //-----------------------------------------------
    //               Activate User  /activate
    //-----------------------------------------------
    public activate =
        async (req: Request, res: Response, next: NextFunction) => {
            const { activation_token, activation_code } =
                req.body as IActivationRequest;
            if (activation_token === undefined || activation_code === undefined) {
                throw new BadRequestException(
                    "Invalid request, please provide activation_code and activation_token",
                    ErrorCode.VALIDATION_UNFULLFIELD_REQUIRED_FIELD
                );
            }

            const newUser: { user: IUser; activationCode: string } = jwt.verify(
                activation_token,
                ACTIVATION_TOKEN_SECRET
            ) as { user: IUser; activationCode: string };

            if (newUser.activationCode !== activation_code) {
                throw new BadRequestException("Invalid activation code", ErrorCode.VALIDATION_INVALID_DATA);
            }

            const { name, email, username, password } = newUser.user;

            const existUser = await prismaClient.user.findFirst({
                where: { username }
            });
            if (existUser) throw new NotFoundException("Username already exist", ErrorCode.RESSOURCE_ALREADY_EXISTS);

            const existPeople = await prismaClient.people.findFirst({
                where: { email }
            });
            if (existPeople) throw new NotFoundException("Email already exist", ErrorCode.RESSOURCE_ALREADY_EXISTS);

            const system = await this.authService.getUserSYSTEM();
            if (!system) {
                throw new ConfigurationException("No System user", ErrorCode.RESSOURCE_ALREADY_EXISTS);
            }
            const userEntity = new UserEntity({ name, email, username, password });
            const people = await prismaClient.people.create({
                data: {
                    name,
                    email,
                    createdBy: system.id,
                    updatedBy: system.id
                }
            });

            const user = await prismaClient.user.create({
                data: {
                    username,
                    peopleId: people.id,
                    password: await bcrypt.hash(password, parseInt(SALT_ROUNDS ?? '10')),
                    createdBy: system.id,
                    updatedBy: system.id
                }
            });

            // Étape 2: Associer le rôle à l'utilisateur
            const roleName = 'USER';
            const role = await prismaClient.role.findUnique({
                where: { name: roleName },
            });

            if (role) {
                await prismaClient.userRole.create({
                    data: {
                        userId: user.id,
                        roleId: role.id,
                        createdBy: "",
                        updatedBy: ""
                    },
                });
                console.log(`Assigned role '${roleName}' to user '${user.username}'.`);
            } else {
                console.error(`Role '${roleName}' not found.`);
            }

            res.status(201).json({
                success: true,
                message: `Your account is activate`,
            });

        };

    //-----------------------------------------------------------------------------
    //               Login User  /login  /signin
    //-----------------------------------------------------------------------------
    // Handling the user login(signin) process
    public signin =
        async (req: Request, res: Response, next: NextFunction) => {
            const { username, password, roleId }: ILoginRequest = req.body;

            // Validation of user inputs
            if (!username || !password) {
                throw new BadRequestException("Please enter both username and password", ErrorCode.VALIDATION_UNFULLFIELD_REQUIRED_FIELD);
            }

            // Check if user exists in the database
            const user = await prismaClient.user.findFirst({
                where: {
                    username: username,
                    deleted: false
                },
                include: { UserRole: true, People: true }, // Include roles relation
            });

            if (!user) {
                throw new NotFoundException("Invalid username or password", ErrorCode.VALIDATION_INVALID_DATA);
            }

            if (!user.isActive) {
                return next(new ConfigurationException("Account inactive please contact adminstrator", ErrorCode.CONFIGURATION_ERROR));
            }

            if (user.UserRole.length === 0) {
                return next(new ConfigurationException("User has no roles assigned, please contact adminstrator", ErrorCode.CONFIGURATION_ERROR));
            }

            let roleIdToConnect;
            // If user has multiple roles, check if a role is specifie
            if (user.UserRole.length > 1) {
                if (!roleId) throw new BadRequestException("Please specify a role to sign in", ErrorCode.VALIDATION_INVALID_DATA);

                // Check if the specified role exists in the user's roles
                const roleExists = user.UserRole.some(userRole => userRole.roleId === roleId);
                if (!roleExists) {
                    return next(new BadRequestException("Invalid role specified", ErrorCode.CONFIGURATION_ERROR));
                }
                roleIdToConnect = roleId;
            } else {
                roleIdToConnect = user.UserRole[0].roleId
            }
            const role = await prismaClient.role.findUnique({
                where: { id: roleIdToConnect },
                select: {
                    id: true,
                    name: true,
                    RolePermission: {
                        select: {
                            Permission: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });

            const userEntity = new UserEntity({
                id: user.id,
                name: user.People.name,
                email: user.People.name,
                username: user.username,
                password: user.password,
                avatar: "",
                roles: user.UserRole,
                role: role
            });

            // Extract userId from email
            // const userId = user.People?.email.split('@')[0]; // Get the part before '@'
            const userId = user.username

            // LDAP authentication
            if (user.ldap) {
                const isLdapAuthentificated = await ldapLogin(userId, password);
                if (!isLdapAuthentificated) {
                    return next(new BadRequestException("Invalid Email or Password", ErrorCode.VALIDATION_INVALID_DATA));
                }
            } else {
                const isPasswordMatched = await userEntity.comparePassword(password);
                if (!isPasswordMatched) {
                    return next(new BadRequestException("Invalid Email or Password", ErrorCode.VALIDATION_INVALID_DATA));
                }
            }

            // When every thing is ok send Token to user
            const accessToken = userEntity.signAccessToken();
            const refreshToken = userEntity.signRefreshToken();

            //Upload session to redis
            const session = {
                id: user.id,
                username: user.username,
                name: user.People.name,
                roles: user.UserRole,
                role,
                ipAddress: req.ip,
                accessToken,
                refreshToken
            };
            redis.set(accessToken, JSON.stringify(session) as any, "EX", ACCESS_TOKEN_EXPIRE)
            redis.set(refreshToken, JSON.stringify({ ...session }) as any, "EX", REFRESH_TOKEN_EXPIRE)

            // Audit entry for tracking purpose
            await prismaClient.audit.create({
                data: {
                    userId: user.id,
                    ipAddress: req.ip,
                    action: trackingService.AUTH.LOGIN,
                    details: `User : ${user.username} has logged in`,
                    endpoint: '/login',
                    source: SourceType.USER
                },
            });

            res.status(HTTPSTATUS.OK).json({
                success: true,
                // message: 'User successfully logged in',
                //user: userEntity.cleanUser(),
                accessToken,
                refreshToken
            });
        };



    //-----------------------------------------------
    //               Logout User /logout
    //-----------------------------------------------

    public signout =
        async (req: Request, res: Response, next: NextFunction) => {

            if (!req.user?.accessToken) throw new HttpException('Something went wrong', HTTPSTATUS.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_SERVER_ERROR, ['accessToken unavalaible'])
            // Delete in redis the user access token to logout the user
            redis.del(req.user?.accessToken);

            // Audit entry for tracking purpose
            await prismaClient.audit.create({
                data: {
                    userId: req.user.id,
                    ipAddress: req.ip,
                    action: trackingService.AUTH.LOGOUT,
                    details: `User : ${req.user.username} has logged out`,
                    endpoint: '/logout',
                    source: SourceType.USER
                },
            });

            res.status(HTTPSTATUS.OK).json({
                success: true,
                message: "Logged out successfully",
            });
        };


    //-----------------------------------------------
    //              Update User Access Token /user/refresh
    //-----------------------------------------------

    public updateAccessToken =
        async (req: Request, res: Response, next: NextFunction) => {

            // const refresh_token = req.cookies.refresh_token as string;
            const refresh_token = req.headers.authorization as string;

            if (!refresh_token) return next(new UnauthorizedException("Could not refresh token , please provide an authorization token.", ErrorCode.AUTH_UNAUTHORIZED_ACCESS));

            const decoded = jwt.verify(
                refresh_token,
                REFRESH_TOKEN_SECRET as string
            ) as JwtPayload;
            if (!decoded) return next(new UnauthorizedException("Unauthorized: Access token is not valid, please login to access this resource", ErrorCode.AUTH_UNAUTHORIZED_ACCESS))

            const session = await redis.get(refresh_token);
            if (!session) {
                throw new UnauthorizedException("Could not refresh token , please login for access this ressource.");
            }

            const userSession = JSON.parse(session);

            const accessToken = jwt.sign(
                { id: userSession.id },
                ACCESS_TOKEN_SECRET,
                { expiresIn: expiredFormat(ACCESS_TOKEN_EXPIRE) }
            );

            const refreshToken = jwt.sign(
                { id: userSession.id },
                REFRESH_TOKEN_SECRET,
                { expiresIn: expiredFormat(REFRESH_TOKEN_EXPIRE) }
            );

            // // Add User in the request to user it in any request
            req.user = { ...userSession };

            // res.cookie("access_token", accessToken, accessTokenOptions);
            // res.cookie("refresh_token", refreshToken, refreshTokenOptions);

            // //Update redis session
            const newSession = { ...userSession, ipAddress: req.ip, accessToken, refreshToken };
            redis.set(accessToken, JSON.stringify(newSession) as any, "EX", ACCESS_TOKEN_EXPIRE)
            redis.set(refreshToken, JSON.stringify(newSession) as any, "EX", REFRESH_TOKEN_EXPIRE)


            res.status(HTTPSTATUS.OK).json({
                success: true,
                accessToken,
                refreshToken,
            });

        };



    //-----------------------------------------------
    //              Get User /me
    //-----------------------------------------------
    public me =
        async (req: Request, res: Response, next: NextFunction) => {
            res.status(HTTPSTATUS.OK).json({ ...req.user });
        };

}

