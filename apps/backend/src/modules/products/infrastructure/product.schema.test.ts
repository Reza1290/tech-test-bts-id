import { describe, it, expect } from "vitest";
import {
  createProductSchema,
  updateProductSchema,
  getProductByIdSchema,
  getProductsQuerySchema,
} from "./product.schema";

describe("Product Validation Schemas", () => {
  describe("createProductSchema", () => {
    it("should accept valid product data", () => {
      const payload = {
        body: {
          title: "Awesome T-Shirt",
          price: 99.99,
          description: "High-quality cotton t-shirt",
          category: "Clothes",
          images: ["https://placeimg.com/640/480/any"],
        },
      };

      const result = createProductSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should reject product with empty images array", () => {
      const payload = {
        body: {
          title: "Awesome T-Shirt",
          price: 99.99,
          category: "Clothes",
          images: [],
        },
      };

      const result = createProductSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("images must contain at least 1 image URL");
      }
    });

    it("should reject product with invalid image URL", () => {
      const payload = {
        body: {
          title: "Awesome T-Shirt",
          price: 99.99,
          category: "Clothes",
          images: ["not-a-valid-url"],
        },
      };

      const result = createProductSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("should reject product with negative price", () => {
      const payload = {
        body: {
          title: "Awesome T-Shirt",
          price: -10,
          category: "Clothes",
          images: ["https://placeimg.com/640/480/any"],
        },
      };

      const result = createProductSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("updateProductSchema", () => {
    it("should accept valid partial update", () => {
      const payload = {
        params: { id: "1" },
        body: {
          price: 79.99,
        },
      };

      const result = updateProductSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.params.id).toBe(1);
        expect(result.data.body.price).toBe(79.99);
      }
    });
  });

  describe("getProductByIdSchema", () => {
    it("should parse integer ID from string param", () => {
      const payload = {
        params: { id: "42" },
      };

      const result = getProductByIdSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.params.id).toBe(42);
      }
    });
  });

  describe("getProductsQuerySchema", () => {
    it("should apply default page and limit", () => {
      const payload = {
        query: {},
      };

      const result = getProductsQuerySchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query.page).toBe(1);
        expect(result.data.query.limit).toBe(10);
      }
    });

    it("should parse query filter params", () => {
      const payload = {
        query: {
          search: "Shirt",
          category: "Clothes",
          page: "2",
          limit: "20",
        },
      };

      const result = getProductsQuerySchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query.search).toBe("Shirt");
        expect(result.data.query.category).toBe("Clothes");
        expect(result.data.query.page).toBe(2);
        expect(result.data.query.limit).toBe(20);
      }
    });
  });
});
