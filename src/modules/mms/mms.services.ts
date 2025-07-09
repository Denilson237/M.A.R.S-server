import { Request } from "express";
import { ErrorCode } from "../../core/exceptions/http-exception";
import UnauthorizedException from "../../core/exceptions/unauthorized";
import { getUserConnected } from "../../core/utils/authentificationService";

export class MMSService {
    public async generateMFASetup(req: Request) {
      const user = await getUserConnected(req);
      if (!user) {
        throw new UnauthorizedException("User not authorized", ErrorCode.AUTH_UNAUTHORIZED_ACCESS);
      }
  
      // if (user.userPreferences.enable2FA) {
      //   return {
      //     message: "MFA already enabled",
      //   };
      // }
  
      // let secretKey = user.userPreferences.twoFactorSecret;
      // if (!secretKey) {
      //   const secret = speakeasy.generateSecret({ name: "Squeezy" });
      //   secretKey = secret.base32;
      //   user.userPreferences.twoFactorSecret = secretKey;
      //   await user.save();
      // }
  
      // const url = speakeasy.otpauthURL({
      //   secret: secretKey,
      //   label: `${user.name}`,
      //   issuer: "squeezy.com",
      //   encoding: "base32",
      // });
  
      // const qrImageUrl = await qrcode.toDataURL(url);
  
      // return {
      //   message: "Scan the QR code or use the setup key.",
      //   secret: secretKey,
      //   qrImageUrl,
      // };
    }
}