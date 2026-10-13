import { Router } from "express";
import { MysqlProductRepository } from "./infrastructure/mysql-product.repository";
import { GetProductsUseCase } from "./application/get-products.use-case";
import { GetProductByIdUseCase } from "./application/get-product-by-id.use-case";
import { CreateProductUseCase } from "./application/create-product.use-case";
import { UpdateProductUseCase } from "./application/update-product.use-case";
import { DeleteProductUseCase } from "./application/delete-product.use-case";
import { ProductController } from "./infrastructure/product.controller";
import { createProductRouter as buildRouter } from "./infrastructure/product.routes";

export const createProductsRouter = (): Router => {
  const productRepository = new MysqlProductRepository();

  const getProductsUseCase = new GetProductsUseCase(productRepository);
  const getProductByIdUseCase = new GetProductByIdUseCase(productRepository);
  const createProductUseCase = new CreateProductUseCase(productRepository);
  const updateProductUseCase = new UpdateProductUseCase(productRepository);
  const deleteProductUseCase = new DeleteProductUseCase(productRepository);

  const productController = new ProductController(
    getProductsUseCase,
    getProductByIdUseCase,
    createProductUseCase,
    updateProductUseCase,
    deleteProductUseCase
  );

  return buildRouter(productController);
};

export * from "./domain/product.entity";
export * from "./domain/product.repository";
