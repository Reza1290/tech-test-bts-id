export interface TokenPayload {
  userId: number;
  username: string;
}

export interface AuthTokens {
  authenticationToken: string;
  refreshToken: string;
}

export interface ITokenService {
  signToken(payload: TokenPayload, expiresIn?: string): string;
  signRefreshToken(payload: TokenPayload, expiresIn?: string): string;
  generateAuthTokens(payload: TokenPayload): AuthTokens;
  verifyToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
}
