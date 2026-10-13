import { IProductRepository, PaginatedProducts } from "../domain/product.repository";
import { GetProductsQueryDTO } from "./product.dto";
import { CacheService, cacheService as defaultCache } from "../../../core/cache/cache.service";

export class GetProductsUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly cache: CacheService = defaultCache
  ) {}

  public async execute(dto: GetProductsQueryDTO): Promise<{ result: PaginatedProducts; fromCache: boolean }> {
    const page = Math.max(1, dto.page ? Number(dto.page) : 1);
    const limit = Math.max(1, Math.min(100, dto.limit ? Number(dto.limit) : 10));
    const search = dto.search?.trim();
    const category = dto.category?.trim();

    const cacheKey = `products:list:${search ?? ""}:${category ?? ""}:${page}:${limit}`;
    const cached = this.cache.get<PaginatedProducts>(cacheKey);

    if (cached) {
      return { result: cached, fromCache: true };
    }

    const result = await this.productRepository.findAll({
      search,
      category,
      page,
      limit,
    });

    this.cache.set(cacheKey, result);

    return { result, fromCache: false };
  }
}
