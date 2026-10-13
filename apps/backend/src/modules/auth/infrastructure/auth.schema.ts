import { z } from "zod";

export const registerSchema = z.object({
  body: z
    .object({
      username: z
        .string({ required_error: "Username is required" })
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username must not exceed 50 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores"),
      password: z
        .string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters"),
      password_confirmation: z
        .string({ required_error: "Password confirmation is required" })
        .min(6, "Password confirmation must be at least 6 characters"),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: "password_confirmation must match password",
      path: ["password_confirmation"],
    }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: "Username is required" })
      .min(1, "Username is required"),
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password is required"),
  }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
