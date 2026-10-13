import { Request, Response, NextFunction } from "express";
import { ITokenService } from "../../modules/auth/domain/token-service.interface";
import { JwtTokenService } from "../../modules/auth/infrastructure/jwt-token-service";
import { UnauthorizedError } from "../errors/app-error";

export const createAuthMiddleware = (tokenService: ITokenService = new JwtTokenService()) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : undefined;
    const cookieToken = req.cookies?.bts_token as string | undefined;

    const token = bearerToken || cookieToken;

    if (!token) {
      next(new UnauthorizedError("Authentication token is required"));
      return;
    }

    try {
      const payload = tokenService.verifyToken(token);
      req.user = payload;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const authenticate = createAuthMiddleware();
