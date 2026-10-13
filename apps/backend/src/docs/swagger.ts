import { Router, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import openApiSpec from "./openapi.json";

export const createSwaggerRouter = (): Router => {
  const router = Router();

  // Serve raw openapi specification JSON
  router.get("/openapi.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(openApiSpec);
  });

  // Serve Swagger UI
  router.use(
    "/",
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "BTS.id API Docs",
    })
  );

  return router;
};
