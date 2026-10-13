import { IProductRepository } from "../domain/product.repository";
import { ProductEntity } from "../domain/product.entity";
import { NotFoundError } from "../../../core/errors/app-error";
import { CacheService, cacheService as defaultCache } from "../../../core/cache/cache.service";

export class GetProductByIdUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly cache: CacheService = defaultCache
  ) {}

  public async execute(id: number): Promise<{ product: ProductEntity; fromCache: boolean }> {
    const cacheKey = `products:item:${id}`;
    const cached = this.cache.get<ProductEntity>(cacheKey);

    if (cached) {
      return { product: cached, fromCache: true };
    }

    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    this.cache.set(cacheKey, product);

    return { product, fromCache: false };
  }
}
