import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../../core/middleware/validate.middleware";
import { registerSchema, loginSchema } from "./auth.schema";
import { authRateLimiter } from "../../../core/middleware/rate-limit.middleware";
import { authenticate } from "../../../core/middleware/auth.middleware";

export const createAuthRouter = (controller: AuthController): Router => {
  const router = Router();

  // POST /api/auth/register (PDF 3.F: Rate limited to 3x per 60s)
  router.post("/register", authRateLimiter, validate(registerSchema), controller.register);

  // POST /api/auth/login (PDF 3.G: Rate limited to 3x per 60s)
  router.post("/login", authRateLimiter, validate(loginSchema), controller.login);

  // GET /api/auth/me (Protected current user endpoint)
  router.get("/me", authenticate, controller.getProfile);

  return router;
};
