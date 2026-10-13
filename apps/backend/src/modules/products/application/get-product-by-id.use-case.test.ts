import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetProductByIdUseCase } from "./get-product-by-id.use-case";
import { IProductRepository } from "../domain/product.repository";
import { ProductEntity } from "../domain/product.entity";
import { CacheService } from "../../../core/cache/cache.service";
import { NotFoundError } from "../../../core/errors/app-error";

describe("GetProductByIdUseCase", () => {
  let mockRepo: IProductRepository;
  let cache: CacheService;
  let useCase: GetProductByIdUseCase;

  const mockProduct: ProductEntity = {
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
  };

  beforeEach(() => {
    mockRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    cache = new CacheService(60);
    useCase = new GetProductByIdUseCase(mockRepo, cache);
  });

  it("should fetch product from repo and cache it", async () => {
    vi.mocked(mockRepo.findById).mockResolvedValueOnce(mockProduct);

    const { product, fromCache } = await useCase.execute(1);

    expect(fromCache).toBe(false);
    expect(product).toEqual(mockProduct);
    expect(mockRepo.findById).toHaveBeenCalledWith(1);
  });

  it("should return cached product on subsequent call", async () => {
    vi.mocked(mockRepo.findById).mockResolvedValueOnce(mockProduct);

    await useCase.execute(1);
    const { product, fromCache } = await useCase.execute(1);

    expect(fromCache).toBe(true);
    expect(product).toEqual(mockProduct);
    expect(mockRepo.findById).toHaveBeenCalledTimes(1);
  });

  it("should throw NotFoundError when product does not exist", async () => {
    vi.mocked(mockRepo.findById).mockResolvedValueOnce(null);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundError);
  });
});
