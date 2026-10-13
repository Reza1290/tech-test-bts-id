import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteProductUseCase } from "./delete-product.use-case";
import { IProductRepository } from "../domain/product.repository";
import { ProductEntity } from "../domain/product.entity";
import { CacheService } from "../../../core/cache/cache.service";
import { NotFoundError } from "../../../core/errors/app-error";

describe("DeleteProductUseCase", () => {
  let mockRepo: IProductRepository;
  let cache: CacheService;
  let useCase: DeleteProductUseCase;

  const existingProduct: ProductEntity = {
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
      findById: vi.fn().mockResolvedValue(existingProduct),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue(true),
    };
    cache = new CacheService(60);
    vi.spyOn(cache, "deletePattern");
    useCase = new DeleteProductUseCase(mockRepo, cache);
  });

  it("should delete existing product and invalidate cache", async () => {
    const result = await useCase.execute(1);

    expect(result).toEqual({ id: 1 });
    expect(mockRepo.delete).toHaveBeenCalledWith(1);
    expect(cache.deletePattern).toHaveBeenCalledWith("products:");
  });

  it("should throw NotFoundError if product does not exist", async () => {
    vi.mocked(mockRepo.findById).mockResolvedValueOnce(null);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundError);
  });
});
