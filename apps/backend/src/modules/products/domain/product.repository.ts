import { ProductEntity } from "./product.entity";

export interface ProductFilterQuery {
  search?: string;
  category?: string;
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedProducts {
  data: ProductEntity[];
  pagination: PaginationMeta;
}

export type CreateProductData = Omit<ProductEntity, "id">;

export type UpdateProductData = Partial<
  Omit<ProductEntity, "id" | "created_at" | "created_by" | "created_by_id">
>;

export interface IProductRepository {
  findAll(filter: ProductFilterQuery): Promise<PaginatedProducts>;
  findById(id: number): Promise<ProductEntity | null>;
  create(data: CreateProductData): Promise<ProductEntity>;
  update(id: number, data: UpdateProductData): Promise<ProductEntity | null>;
  delete(id: number): Promise<boolean>;
}
