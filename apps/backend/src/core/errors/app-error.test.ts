import { describe, it, expect } from "vitest";
import {
  AppError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
} from "./app-error";

describe("AppError Hierarchy", () => {
  it("should create AppError with default values", () => {
    const error = new AppError("Internal error");
    expect(error.message).toBe("Internal error");
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
  });

  it("should create NotFoundError with 404 status code", () => {
    const error = new NotFoundError("Resource not found");
    expect(error.message).toBe("Resource not found");
    expect(error.statusCode).toBe(404);
  });

  it("should create BadRequestError with 400 status code", () => {
    const error = new BadRequestError("Invalid parameter");
    expect(error.message).toBe("Invalid parameter");
    expect(error.statusCode).toBe(400);
  });

  it("should create UnauthorizedError with 401 status code", () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
  });

  it("should create ForbiddenError with 403 status code", () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
  });

  it("should create ConflictError with 409 status code", () => {
    const error = new ConflictError("Username already exists");
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe("Username already exists");
  });

  it("should create ValidationError with details and 400 status code", () => {
    const details = [{ field: "title", message: "Title is required" }];
    const error = new ValidationError("Validation failed", details);
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual(details);
  });

  it("should create TooManyRequestsError with 429 status code", () => {
    const error = new TooManyRequestsError();
    expect(error.statusCode).toBe(429);
  });
});
