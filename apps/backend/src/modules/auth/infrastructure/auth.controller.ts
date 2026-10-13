import { Request, Response, NextFunction } from "express";
import { RegisterUseCase } from "../application/register.use-case";
import { LoginUseCase } from "../application/login.use-case";

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase
  ) {}

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, password, password_confirmation } = req.body;
      const user = await this.registerUseCase.execute({
        username,
        password,
        password_confirmation,
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, password } = req.body;
      const result = await this.loginUseCase.execute({
        username,
        password,
      });

      // Set auth cookie as convenience
      res.cookie("bts_token", result.authentication_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  };
}
