import pinoHttp from "pino-http";
import { logger } from "../logger/logger";

export const requestLogger = pinoHttp({
  logger,
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  autoLogging: {
    ignore: (req) => (req.url ? req.url.startsWith("/health") : false),
  },
});
