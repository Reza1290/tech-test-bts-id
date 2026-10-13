import { IProductRepository } from "../domain/product.repository";
import { CacheService, cacheService as defaultCache } from "../../../core/cache/cache.service";
import { NotFoundError } from "../../../core/errors/app-error";

export class DeleteProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly cache: CacheService = defaultCache
  ) {}

  public async execute(id: number): Promise<{ id: number }> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    const deleted = await this.productRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    // Invalidate product caches
    this.cache.deletePattern("products:");

    return { id };
  }
}
