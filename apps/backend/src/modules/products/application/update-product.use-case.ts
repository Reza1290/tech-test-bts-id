import { IProductRepository } from "../domain/product.repository";
import { ProductEntity } from "../domain/product.entity";
import { UpdateProductDTO, UserAuditContext } from "./product.dto";
import { CacheService, cacheService as defaultCache } from "../../../core/cache/cache.service";
import { NotFoundError, ValidationError } from "../../../core/errors/app-error";

export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly cache: CacheService = defaultCache
  ) {}

  public async execute(
    id: number,
    dto: UpdateProductDTO,
    user: UserAuditContext
  ): Promise<ProductEntity> {
    if (dto.title !== undefined && dto.title.trim().length === 0) {
      throw new ValidationError("Product title cannot be empty");
    }
    if (dto.price !== undefined && (isNaN(dto.price) || dto.price < 0)) {
      throw new ValidationError("Product price must be a valid non-negative number");
    }
    if (dto.category !== undefined && dto.category.trim().length === 0) {
      throw new ValidationError("Product category cannot be empty");
    }
    if (dto.images !== undefined && (!Array.isArray(dto.images) || dto.images.length === 0)) {
      throw new ValidationError("Product must have at least 1 image");
    }

    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    const updatePayload = {
      ...(dto.title !== undefined && { title: dto.title.trim() }),
      ...(dto.price !== undefined && { price: Number(dto.price) }),
      ...(dto.description !== undefined && { description: dto.description ? dto.description.trim() : null }),
      ...(dto.category !== undefined && { category: dto.category.trim() }),
      ...(dto.images !== undefined && { images: dto.images }),
      updated_at: now,
      updated_by: user.username,
      updated_by_id: String(user.userId),
    };

    const updated = await this.productRepository.update(id, updatePayload);

    if (!updated) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    // Invalidate product caches
    this.cache.deletePattern("products:");

    return updated;
  }
}
