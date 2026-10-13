import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "./auth.schema";

describe("Auth Validation Schemas", () => {
  describe("registerSchema", () => {
    it("should accept valid registration payload", () => {
      const validPayload = {
        body: {
          username: "jhon_doe",
          password: "supersecret",
          password_confirmation: "supersecret",
        },
      };

      const result = registerSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("should reject payload when password_confirmation does not match", () => {
      const invalidPayload = {
        body: {
          username: "jhon_doe",
          password: "supersecret",
          password_confirmation: "differentsupersecret",
        },
      };

      const result = registerSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("password_confirmation must match password");
      }
    });

    it("should reject short username or short password", () => {
      const invalidPayload = {
        body: {
          username: "ab",
          password: "123",
          password_confirmation: "123",
        },
      };

      const result = registerSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("should accept valid login payload", () => {
      const validPayload = {
        body: {
          username: "jhon_doe",
          password: "supersecret",
        },
      };

      const result = loginSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("should reject empty username or password", () => {
      const invalidPayload = {
        body: {
          username: "",
          password: "",
        },
      };

      const result = loginSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });
});
