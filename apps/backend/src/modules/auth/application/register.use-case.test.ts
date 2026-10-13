import { describe, it, expect, vi } from "vitest";
import { RegisterUseCase } from "./register.use-case";
import { IAuthRepository } from "../domain/auth.repository";
import { IPasswordHasher } from "../domain/password-hasher.interface";
import { ConflictError, ValidationError } from "../../../core/errors/app-error";

describe("RegisterUseCase", () => {
  const mockRepo: IAuthRepository = {
    findByUsername: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  };

  const mockHasher: IPasswordHasher = {
    hash: vi.fn().mockResolvedValue("hashed_pwd_123"),
    compare: vi.fn(),
  };

  const useCase = new RegisterUseCase(mockRepo, mockHasher);

  it("should successfully register a new user", async () => {
    vi.mocked(mockRepo.findByUsername).mockResolvedValueOnce(null);
    vi.mocked(mockRepo.create).mockResolvedValueOnce({
      id: 2,
      username: "jhon_doe",
      passwordHash: "hashed_pwd_123",
    });

    const result = await useCase.execute({
      username: "jhon_doe",
      password: "supersecret",
      password_confirmation: "supersecret",
    });

    expect(result).toEqual({ id: 2, username: "jhon_doe" });
    expect(mockHasher.hash).toHaveBeenCalledWith("supersecret");
    expect(mockRepo.create).toHaveBeenCalledWith({
      username: "jhon_doe",
      passwordHash: "hashed_pwd_123",
    });
  });

  it("should throw ValidationError if passwords do not match", async () => {
    await expect(
      useCase.execute({
        username: "test_user",
        password: "password1",
        password_confirmation: "password2",
      })
    ).rejects.toThrow(ValidationError);
  });

  it("should throw ConflictError if username is already taken", async () => {
    vi.mocked(mockRepo.findByUsername).mockResolvedValueOnce({
      id: 1,
      username: "existing_user",
      passwordHash: "hash",
    });

    await expect(
      useCase.execute({
        username: "existing_user",
        password: "secretpassword",
        password_confirmation: "secretpassword",
      })
    ).rejects.toThrow(ConflictError);
  });
});
