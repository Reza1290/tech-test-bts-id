import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../errors/app-error";

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if ((parsed as Record<string, unknown>).body !== undefined) {
        req.body = (parsed as Record<string, unknown>).body;
      }
      if ((parsed as Record<string, unknown>).query !== undefined) {
        req.query = (parsed as Record<string, unknown>).query as typeof req.query;
      }
      if ((parsed as Record<string, unknown>).params !== undefined) {
        req.params = (parsed as Record<string, unknown>).params as typeof req.params;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.filter((p) => p !== "body" && p !== "query" && p !== "params").join("."),
          message: e.message,
        }));
        const primaryMessage = details.length > 0 ? details[0].message : "Validation failed";
        next(new ValidationError(primaryMessage, details));
        return;
      }
      next(error);
    }
  };
};
