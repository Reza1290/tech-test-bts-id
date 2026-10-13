import { Request, Response, NextFunction } from "express";
import { GetProductsUseCase } from "../application/get-products.use-case";
import { GetProductByIdUseCase } from "../application/get-product-by-id.use-case";
import { CreateProductUseCase } from "../application/create-product.use-case";
import { UpdateProductUseCase } from "../application/update-product.use-case";
import { DeleteProductUseCase } from "../application/delete-product.use-case";
import { UnauthorizedError } from "../../../core/errors/app-error";

export class ProductController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase
  ) {}

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, category, page, limit } = req.query as {
        search?: string;
        category?: string;
        page?: string;
        limit?: string;
      };

      const { result, fromCache } = await this.getProductsUseCase.execute({
        search,
        category,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      res.setHeader("X-Cache", fromCache ? "HIT" : "MISS");
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const { product, fromCache } = await this.getProductByIdUseCase.execute(id);

      res.setHeader("X-Cache", fromCache ? "HIT" : "MISS");
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication token is required to create a product");
      }

      const { title, price, description, category, images } = req.body;
      const product = await this.createProductUseCase.execute(
        { title, price, description, category, images },
        { userId: req.user.userId, username: req.user.username }
      );

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication token is required to update a product");
      }

      const id = Number(req.params.id);
      const { title, price, description, category, images } = req.body;

      const product = await this.updateProductUseCase.execute(
        id,
        { title, price, description, category, images },
        { userId: req.user.userId, username: req.user.username }
      );

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication token is required to delete a product");
      }

      const id = Number(req.params.id);
      const result = await this.deleteProductUseCase.execute(id);

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
