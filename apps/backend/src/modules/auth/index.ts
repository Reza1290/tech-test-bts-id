import { Router } from "express";
import { MysqlAuthRepository } from "./infrastructure/mysql-auth.repository";
import { BcryptPasswordHasher } from "./infrastructure/bcrypt-password-hasher";
import { JwtTokenService } from "./infrastructure/jwt-token-service";
import { RegisterUseCase } from "./application/register.use-case";
import { LoginUseCase } from "./application/login.use-case";
import { AuthController } from "./infrastructure/auth.controller";
import { createAuthRouter as buildRouter } from "./infrastructure/auth.routes";

export const createAuthRouter = (): Router => {
  const authRepository = new MysqlAuthRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService();

  const registerUseCase = new RegisterUseCase(authRepository, passwordHasher);
  const loginUseCase = new LoginUseCase(authRepository, passwordHasher, tokenService);

  const authController = new AuthController(registerUseCase, loginUseCase);

  return buildRouter(authController);
};

export * from "./domain/user.entity";
export * from "./domain/auth.repository";
export * from "./domain/token-service.interface";
export * from "./domain/password-hasher.interface";
export * from "./infrastructure/jwt-token-service";
export * from "./infrastructure/bcrypt-password-hasher";
