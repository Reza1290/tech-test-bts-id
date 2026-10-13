import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetProductsUseCase } from "./get-products.use-case";
import { IProductRepository, PaginatedProducts } from "../domain/product.repository";
import { CacheService } from "../../../core/cache/cache.service";

describe("GetProductsUseCase", () => {
  let mockRepo: IProductRepository;
  let cache: CacheService;
  let useCase: GetProductsUseCase;

  const samplePaginated: PaginatedProducts = {
    data: [
      {
        id: 1,
        title: "Awesome T-Shirt",
        price: 99.99,
        description: "High-quality cotton t-shirt",
        category: "Clothes",
        images: ["https://placeimg.com/640/480/any"],
        created_at: "2025-01-01 15:01:04",
        created_by: "jhon_doe",
        created_by_id: "1",
        updated_at: "2025-01-01 15:01:04",
        updated_by: "jhon_doe",
        updated_by_id: "1",
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    mockRepo = {
      findAll: vi.fn().mockResolvedValue(samplePaginated),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    cache = new CacheService(60);
    useCase = new GetProductsUseCase(mockRepo, cache);
  });

  it("should query repository and cache results on cache miss", async () => {
    const { result, fromCache } = await useCase.execute({ page: 1, limit: 10 });

    expect(fromCache).toBe(false);
    expect(result).toEqual(samplePaginated);
    expect(mockRepo.findAll).toHaveBeenCalledWith({
      search: undefined,
      category: undefined,
      page: 1,
      limit: 10,
    });
  });

  it("should return cached result on second call", async () => {
    await useCase.execute({ page: 1, limit: 10 });
    const { result, fromCache } = await useCase.execute({ page: 1, limit: 10 });

    expect(fromCache).toBe(true);
    expect(result).toEqual(samplePaginated);
    expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
  });

  it("should pass search and category filters", async () => {
    await useCase.execute({ search: "T-Shirt", category: "Clothes", page: 2, limit: 5 });

    expect(mockRepo.findAll).toHaveBeenCalledWith({
      search: "T-Shirt",
      category: "Clothes",
      page: 2,
      limit: 5,
    });
  });
});
