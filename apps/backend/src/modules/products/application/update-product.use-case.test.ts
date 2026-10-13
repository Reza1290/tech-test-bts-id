import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateProductUseCase } from "./update-product.use-case";
import { IProductRepository } from "../domain/product.repository";
import { ProductEntity } from "../domain/product.entity";
import { CacheService } from "../../../core/cache/cache.service";
import { NotFoundError } from "../../../core/errors/app-error";

describe("UpdateProductUseCase", () => {
  let mockRepo: IProductRepository;
  let cache: CacheService;
  let useCase: UpdateProductUseCase;

  const mockUser = { userId: 1, username: "jhon_doe" };

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

  const updatedProduct: ProductEntity = {
    ...existingProduct,
    title: "Updated T-Shirt",
    price: 119.99,
  };

  beforeEach(() => {
    mockRepo = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(existingProduct),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(updatedProduct),
      delete: vi.fn(),
    };
    cache = new CacheService(60);
    vi.spyOn(cache, "deletePattern");
    useCase = new UpdateProductUseCase(mockRepo, cache);
  });

  it("should update product and invalidate cache", async () => {
    const result = await useCase.execute(1, { title: "Updated T-Shirt", price: 119.99 }, mockUser);

    expect(result).toEqual(updatedProduct);
    expect(mockRepo.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        title: "Updated T-Shirt",
        price: 119.99,
        updated_by: "jhon_doe",
        updated_by_id: "1",
      })
    );
    expect(cache.deletePattern).toHaveBeenCalledWith("products:");
  });

  it("should throw NotFoundError if product does not exist", async () => {
    vi.mocked(mockRepo.findById).mockResolvedValueOnce(null);

    await expect(
      useCase.execute(999, { title: "Non existent" }, mockUser)
    ).rejects.toThrow(NotFoundError);
  });
});
