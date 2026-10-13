import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { logger } from "../logger/logger";

/**
 * Auth Rate Limiter (PDF Requirement 3.F & 3.G):
 * "Pastikan endpoint tidak dapat di hit lebih dari 3x dalam 60 detik. (Optional)"
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn({ ip: req.ip, path: req.path }, "Rate limit exceeded for authentication endpoint");
    res.status(429).json({
      success: false,
      message: "Too many authentication attempts. Please try again after 60 seconds.",
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many authentication attempts. Max 3 requests per 60 seconds allowed.",
      },
    });
  },
});

/**
 * Product Mutation Rate Limiter (PDF Requirement 3.C, 3.D & 3.E):
 * "Pastikan endpoint tidak dapat di hit lebih dari 1x dalam 5 detik. (Optional)"
 */
export const productMutationRateLimiter = rateLimit({
  windowMs: 5 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn({ ip: req.ip, path: req.path }, "Rate limit exceeded for product mutation endpoint");
    res.status(429).json({
      success: false,
      message: "Too many product mutation requests. Please wait 5 seconds before trying again.",
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Max 1 request per 5 seconds allowed for this endpoint.",
      },
    });
  },
});

/**
 * General API read rate limiter
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn({ ip: req.ip, path: req.path }, "Rate limit exceeded for API query endpoint");
    res.status(429).json({
      success: false,
      message: "Too many requests. Please slow down.",
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please slow down.",
      },
    });
  },
});
