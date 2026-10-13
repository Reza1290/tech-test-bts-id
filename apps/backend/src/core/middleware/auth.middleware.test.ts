import { describe, it, expect, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { createAuthMiddleware } from "./auth.middleware";
import { ITokenService, TokenPayload } from "../../modules/auth/domain/token-service.interface";
import { UnauthorizedError } from "../errors/app-error";

describe("AuthMiddleware", () => {
  const mockPayload: TokenPayload = {
    userId: 1,
    username: "jhon_doe",
  };

  const createMocks = (
    cookieToken?: string,
    headerToken?: string,
    tokenServiceOverride?: Partial<ITokenService>
  ) => {
    const req = {
      cookies: cookieToken ? { bts_token: cookieToken } : {},
      headers: headerToken ? { authorization: headerToken } : {},
    } as unknown as Request;

    const res = {} as Response;
    const next = vi.fn() as unknown as NextFunction;

    const tokenService: ITokenService = {
      signToken: vi.fn(),
      signRefreshToken: vi.fn(),
      generateAuthTokens: vi.fn(),
      verifyRefreshToken: vi.fn(),
      verifyToken: vi.fn().mockReturnValue(mockPayload),
      ...tokenServiceOverride,
    };

    const middleware = createAuthMiddleware(tokenService);

    return { req, res, next, tokenService, middleware };
  };

  it("should extract token from bearer authorization header, verify, and attach user to req", () => {
    const { req, res, next, middleware } = createMocks(undefined, "Bearer valid_header_token");

    middleware(req, res, next);

    expect(req.user).toEqual(mockPayload);
    expect(next).toHaveBeenCalledWith();
  });

  it("should extract token from cookie when header is absent", () => {
    const { req, res, next, middleware } = createMocks("valid_cookie_token");

    middleware(req, res, next);

    expect(req.user).toEqual(mockPayload);
    expect(next).toHaveBeenCalledWith();
  });

  it("should return UnauthorizedError when no token is present", () => {
    const { req, res, next, middleware } = createMocks();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it("should pass error to next when token verification fails", () => {
    const { req, res, next, middleware } = createMocks(undefined, "Bearer tampered_token", {
      verifyToken: vi.fn().mockImplementation(() => {
        throw new UnauthorizedError("Invalid token");
      }),
    });

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});
