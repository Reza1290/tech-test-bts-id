export interface GetProductsQueryDTO {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface CreateProductDTO {
  title: string;
  price: number;
  description?: string;
  category: string;
  images: string[];
}

export interface UpdateProductDTO {
  title?: string;
  price?: number;
  description?: string;
  category?: string;
  images?: string[];
}

export interface UserAuditContext {
  userId: number;
  username: string;
}
