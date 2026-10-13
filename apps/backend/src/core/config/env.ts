import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  CORS_ORIGIN: z.string().default("*"),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().default("root"),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().default("bts_recruitment_db"),
  DB_CONNECTION_LIMIT: z.coerce.number().default(10),
  JWT_SECRET: z.string().min(16).default("bts_recruitment_super_secret_jwt_key_at_least_32_chars"),
  JWT_EXPIRES_IN: z.string().default("1d"),
  JWT_REFRESH_SECRET: z.string().min(16).default("bts_recruitment_super_secret_refresh_jwt_key_at_least_32_chars"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CACHE_TTL_SECONDS: z.coerce.number().default(60),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    process.stderr.write(`Invalid environment variables: ${JSON.stringify(result.error.format(), null, 2)}\n`);
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
