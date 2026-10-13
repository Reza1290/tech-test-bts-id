import { IProductRepository } from "../domain/product.repository";
import { ProductEntity } from "../domain/product.entity";
import { CreateProductDTO, UserAuditContext } from "./product.dto";
import { CacheService, cacheService as defaultCache } from "../../../core/cache/cache.service";
import { ValidationError } from "../../../core/errors/app-error";

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly cache: CacheService = defaultCache
  ) {}

  public async execute(dto: CreateProductDTO, user: UserAuditContext): Promise<ProductEntity> {
    if (!dto.title || dto.title.trim().length === 0) {
      throw new ValidationError("Product title is required");
    }
    if (dto.price === undefined || dto.price === null || isNaN(dto.price) || dto.price < 0) {
      throw new ValidationError("Product price must be a valid non-negative number");
    }
    if (!dto.category || dto.category.trim().length === 0) {
      throw new ValidationError("Product category is required");
    }
    if (!dto.images || !Array.isArray(dto.images) || dto.images.length === 0) {
      throw new ValidationError("Product must have at least 1 image");
    }

    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    const newProduct = await this.productRepository.create({
      title: dto.title.trim(),
      price: Number(dto.price),
      description: dto.description ? dto.description.trim() : null,
      category: dto.category.trim(),
      images: dto.images,
      created_at: now,
      created_by: user.username,
      created_by_id: String(user.userId),
      updated_at: now,
      updated_by: user.username,
      updated_by_id: String(user.userId),
    });

    // Invalidate product caches so list queries reflect the new product
    this.cache.deletePattern("products:");

    return newProduct;
  }
}
