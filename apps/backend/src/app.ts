import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./core/config/env";
import { requestLogger } from "./core/middleware/request-logger.middleware";
import { errorHandler } from "./core/middleware/error-handler.middleware";
import { NotFoundError } from "./core/errors/app-error";
import { checkDatabaseConnection } from "./core/database/connection";
import { createAuthRouter } from "./modules/auth";
import { createProductsRouter } from "./modules/products";
import { createSwaggerRouter } from "./docs/swagger";

const registerSecurityMiddleware = (app: Application): void => {
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI inline scripts & CDN styles
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  const corsOptions: cors.CorsOptions = {
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",").map((s) => s.trim()),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
  };
  app.use(cors(corsOptions));

  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(requestLogger);
};

const registerHealthRoutes = (app: Application): void => {
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "UP",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
    });
  });

  app.get("/health/ready", async (_req: Request, res: Response) => {
    const isDbConnected = await checkDatabaseConnection();
    if (isDbConnected) {
      res.status(200).json({ status: "READY", database: "CONNECTED" });
      return;
    }
    res.status(503).json({ status: "NOT_READY", database: "DISCONNECTED" });
  });
};

const registerDocRoutes = (app: Application): void => {
  const swaggerRouter = createSwaggerRouter();
  app.use("/api/docs", swaggerRouter);
  app.use("/docs", swaggerRouter);

  // Root welcome redirect
  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
      message: "BTS.id Recruitment Test - Backend REST API",
      documentation: "/api/docs",
      endpoints: {
        products: "/api/products",
        auth: "/api/auth",
        health: "/health",
      },
    });
  });
};

const registerApiRoutes = (app: Application): void => {
  const authRouter = createAuthRouter();
  const productsRouter = createProductsRouter();

  // Primary endpoints per PDF specification
  app.use("/api/auth", authRouter);
  app.use("/api/products", productsRouter);

  // Versioned v1 aliases
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/products", productsRouter);
};

const registerErrorHandlers = (app: Application): void => {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
  });

  app.use(errorHandler);
};

export const createApp = (): Application => {
  const app = express();

  app.set("trust proxy", 1);

  registerSecurityMiddleware(app);
  registerHealthRoutes(app);
  registerDocRoutes(app);
  registerApiRoutes(app);
  registerErrorHandlers(app);

  return app;
};
