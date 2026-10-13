import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error";
import { logger } from "../logger/logger";
import { env } from "../config/env";

const handleZodError = (err: ZodError, res: Response): void => {
  const formattedErrors = err.errors.map((e) => ({
    field: e.path.filter((p) => p !== "body" && p !== "query" && p !== "params").join("."),
    message: e.message,
  }));

  const primaryMessage = formattedErrors.length > 0 ? formattedErrors[0].message : "Validation failed";

  res.status(400).json({
    success: false,
    message: primaryMessage,
    error: {
      code: "VALIDATION_ERROR",
      message: primaryMessage,
      details: formattedErrors,
    },
  });
};

const handleAppError = (err: AppError, res: Response): void => {
  logger.warn({ err }, `Operational Error: ${err.message}`);
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: {
      code: err.constructor.name,
      message: err.message,
      details: err.details,
    },
  });
};

const handleGenericError = (err: Error, res: Response): void => {
  logger.error({ err }, `Unexpected Error: ${err.message}`);
  res.status(500).json({
    success: false,
    message: env.NODE_ENV === "production" ? "Internal server error" : err.message,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: env.NODE_ENV === "production" ? "Internal server error" : err.message,
      ...(env.NODE_ENV !== "production" && { stack: err.stack }),
    },
  });
};

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ZodError) {
    handleZodError(err, res);
    return;
  }

  if (err instanceof AppError) {
    handleAppError(err, res);
    return;
  }

  // Handle malformed JSON body from body-parser
  if (err instanceof SyntaxError && "status" in err && (err as { status?: number }).status === 400) {
    res.status(400).json({
      success: false,
      message: "Malformed JSON body in request",
      error: {
        code: "BAD_REQUEST",
        message: err.message,
      },
    });
    return;
  }

  handleGenericError(err, res);
};
