import { Router } from "express";
import { ProductController } from "./product.controller";
import { validate } from "../../../core/middleware/validate.middleware";
import {
  createProductSchema,
  updateProductSchema,
  getProductByIdSchema,
  getProductsQuerySchema,
} from "./product.schema";
import { authenticate } from "../../../core/middleware/auth.middleware";
import {
  apiRateLimiter,
  productMutationRateLimiter,
} from "../../../core/middleware/rate-limit.middleware";

export const createProductRouter = (controller: ProductController): Router => {
  const router = Router();

  // GET /api/products (List products with query filters and pagination)
  router.get("/", apiRateLimiter, validate(getProductsQuerySchema), controller.getAll);

  // GET /api/products/:id (Get product detail by ID)
  router.get("/:id", apiRateLimiter, validate(getProductByIdSchema), controller.getById);

  // POST /api/products (PDF 3.C: Auth protected, rate limited to 1x per 5s)
  router.post(
    "/",
    authenticate,
    productMutationRateLimiter,
    validate(createProductSchema),
    controller.create
  );

  // PUT /api/products/:id (PDF 3.D: Auth protected, rate limited to 1x per 5s)
  router.put(
    "/:id",
    authenticate,
    productMutationRateLimiter,
    validate(updateProductSchema),
    controller.update
  );

  // DELETE /api/products/:id (PDF 3.E: Auth protected, rate limited to 1x per 5s)
  router.delete(
    "/:id",
    authenticate,
    productMutationRateLimiter,
    validate(getProductByIdSchema),
    controller.delete
  );

  return router;
};
