import { createApp } from "./app";
import { env } from "./core/config/env";
import { logger } from "./core/logger/logger";
import { dbPool } from "./core/database/connection";

const SHUTDOWN_TIMEOUT_MS = 10000;

const startServer = async (): Promise<void> => {
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`BTS API server running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
    logger.info(`API Documentation available at: http://localhost:${env.PORT}/api/docs`);
    logger.info(`Healthcheck: http://localhost:${env.PORT}/health`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      logger.info("HTTP server closed.");
      try {
        await dbPool.end();
        logger.info("Database pool closed.");
        process.exit(0);
      } catch (err) {
        logger.error({ err }, "Error during database pool closure.");
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error("Forcing shutdown after timeout.");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer().catch((error) => {
  logger.fatal({ error }, "Failed to start server");
  process.exit(1);
});
