import { describe, it, expect, vi } from "vitest";
import { LoginUseCase } from "./login.use-case";
import { IAuthRepository } from "../domain/auth.repository";
import { IPasswordHasher } from "../domain/password-hasher.interface";
import { ITokenService } from "../domain/token-service.interface";
import { UnauthorizedError } from "../../../core/errors/app-error";

describe("LoginUseCase", () => {
  const mockRepo: IAuthRepository = {
    findByUsername: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  };

  const mockHasher: IPasswordHasher = {
    hash: vi.fn(),
    compare: vi.fn(),
  };

  const mockTokenService: ITokenService = {
    signToken: vi.fn(),
    signRefreshToken: vi.fn(),
    generateAuthTokens: vi.fn().mockReturnValue({
      authenticationToken: "auth_token_xyz",
      refreshToken: "refresh_token_xyz",
    }),
    verifyToken: vi.fn(),
    verifyRefreshToken: vi.fn(),
  };

  const useCase = new LoginUseCase(mockRepo, mockHasher, mockTokenService);

  it("should successfully authenticate valid credentials and return tokens", async () => {
    vi.mocked(mockRepo.findByUsername).mockResolvedValueOnce({
      id: 1,
      username: "jhon_doe",
      passwordHash: "valid_hash",
    });
    vi.mocked(mockHasher.compare).mockResolvedValueOnce(true);

    const result = await useCase.execute({
      username: "jhon_doe",
      password: "supersecret",
    });

    expect(result.user).toEqual({ id: 1, username: "jhon_doe" });
    expect(result.authentication_token).toBe("auth_token_xyz");
    expect(result.refresh_token).toBe("refresh_token_xyz");
    expect(result.token_type).toBe("Bearer");
    expect(mockTokenService.generateAuthTokens).toHaveBeenCalledWith({
      userId: 1,
      username: "jhon_doe",
    });
  });

  it("should throw UnauthorizedError when user is not found", async () => {
    vi.mocked(mockRepo.findByUsername).mockResolvedValueOnce(null);

    await expect(
      useCase.execute({
        username: "unknown_user",
        password: "password123",
      })
    ).rejects.toThrow(UnauthorizedError);
  });

  it("should throw UnauthorizedError when password does not match", async () => {
    vi.mocked(mockRepo.findByUsername).mockResolvedValueOnce({
      id: 1,
      username: "jhon_doe",
      passwordHash: "valid_hash",
    });
    vi.mocked(mockHasher.compare).mockResolvedValueOnce(false);

    await expect(
      useCase.execute({
        username: "jhon_doe",
        password: "wrongpassword",
      })
    ).rejects.toThrow(UnauthorizedError);
  });
});
