import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateProductUseCase } from "./create-product.use-case";
import { IProductRepository } from "../domain/product.repository";
import { ProductEntity } from "../domain/product.entity";
import { CacheService } from "../../../core/cache/cache.service";
import { ValidationError } from "../../../core/errors/app-error";

describe("CreateProductUseCase", () => {
  let mockRepo: IProductRepository;
  let cache: CacheService;
  let useCase: CreateProductUseCase;

  const mockUser = { userId: 1, username: "jhon_doe" };

  const createdProduct: ProductEntity = {
    id: 10,
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
      create: vi.fn().mockResolvedValue(createdProduct),
      update: vi.fn(),
      delete: vi.fn(),
    };
    cache = new CacheService(60);
    vi.spyOn(cache, "deletePattern");
    useCase = new CreateProductUseCase(mockRepo, cache);
  });

  it("should create product and invalidate product cache", async () => {
    const result = await useCase.execute(
      {
        title: "Awesome T-Shirt",
        price: 99.99,
        category: "Clothes",
        images: ["https://placeimg.com/640/480/any"],
        description: "High-quality cotton t-shirt",
      },
      mockUser
    );

    expect(result).toEqual(createdProduct);
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Awesome T-Shirt",
        price: 99.99,
        category: "Clothes",
        created_by: "jhon_doe",
        created_by_id: "1",
      })
    );
    expect(cache.deletePattern).toHaveBeenCalledWith("products:");
  });

  it("should throw ValidationError if images are empty", async () => {
    await expect(
      useCase.execute(
        {
          title: "Shoes",
          price: 50,
          category: "Footwear",
          images: [],
        },
        mockUser
      )
    ).rejects.toThrow(ValidationError);
  });

  it("should throw ValidationError if title is missing", async () => {
    await expect(
      useCase.execute(
        {
          title: "",
          price: 50,
          category: "Footwear",
          images: ["https://img.com/1.png"],
        },
        mockUser
      )
    ).rejects.toThrow(ValidationError);
  });
});
