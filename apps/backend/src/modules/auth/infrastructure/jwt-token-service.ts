import jwt from "jsonwebtoken";
import { ITokenService, TokenPayload, AuthTokens } from "../domain/token-service.interface";
import { env } from "../../../core/config/env";
import { UnauthorizedError } from "../../../core/errors/app-error";

export class JwtTokenService implements ITokenService {
  constructor(
    private readonly secret: string = env.JWT_SECRET,
    private readonly expiresIn: string = env.JWT_EXPIRES_IN,
    private readonly refreshSecret: string = env.JWT_REFRESH_SECRET,
    private readonly refreshExpiresIn: string = env.JWT_REFRESH_EXPIRES_IN
  ) {}

  public signToken(payload: TokenPayload, expiresIn: string = this.expiresIn): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
    });
  }

  public signRefreshToken(payload: TokenPayload, expiresIn: string = this.refreshExpiresIn): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
    });
  }

  public generateAuthTokens(payload: TokenPayload): AuthTokens {
    return {
      authenticationToken: this.signToken(payload),
      refreshToken: this.signRefreshToken(payload),
    };
  }

  public verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      return decoded;
    } catch {
      throw new UnauthorizedError("Invalid or expired authentication token");
    }
  }

  public verifyRefreshToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.refreshSecret) as TokenPayload;
      return decoded;
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
  }
}
