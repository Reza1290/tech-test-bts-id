import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: "title is required" })
      .min(1, "title cannot be empty")
      .max(255, "title cannot exceed 255 characters"),
    price: z.coerce
      .number({ required_error: "price is required" })
      .min(0, "price must be a non-negative number"),
    description: z.string().optional(),
    category: z
      .string({ required_error: "category is required" })
      .min(1, "category cannot be empty")
      .max(100, "category cannot exceed 100 characters"),
    images: z
      .array(z.string().url("Each image must be a valid URL"), {
        required_error: "images is required",
      })
      .min(1, "images must contain at least 1 image URL"),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("id must be a positive integer"),
  }),
  body: z.object({
    title: z.string().min(1, "title cannot be empty").max(255).optional(),
    price: z.coerce.number().min(0, "price must be a non-negative number").optional(),
    description: z.string().optional(),
    category: z.string().min(1, "category cannot be empty").max(100).optional(),
    images: z.array(z.string().url("Each image must be a valid URL")).min(1, "images must contain at least 1 image URL").optional(),
  }),
});

export const getProductByIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("id must be a positive integer"),
  }),
});

export const getProductsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
  }),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
export type GetProductByIdSchema = z.infer<typeof getProductByIdSchema>;
export type GetProductsQuerySchema = z.infer<typeof getProductsQuerySchema>;
