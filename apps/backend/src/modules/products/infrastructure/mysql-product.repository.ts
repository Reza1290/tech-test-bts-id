import { Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import {
  IProductRepository,
  ProductFilterQuery,
  PaginatedProducts,
  CreateProductData,
  UpdateProductData,
} from "../domain/product.repository";
import { ProductEntity } from "../domain/product.entity";
import { dbPool } from "../../../core/database/connection";

interface ProductRow extends RowDataPacket {
  id: number;
  title: string;
  price: string | number;
  description: string | null;
  category: string;
  images: unknown;
  created_at: string;
  created_by: string;
  created_by_id: string;
  updated_at: string;
  updated_by: string;
  updated_by_id: string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

export class MysqlProductRepository implements IProductRepository {
  constructor(private readonly pool: Pool = dbPool) {}

  private mapRowToEntity(row: ProductRow): ProductEntity {
    let parsedImages: string[] = [];

    if (Array.isArray(row.images)) {
      parsedImages = row.images;
    } else if (typeof row.images === "string") {
      try {
        const parsed = JSON.parse(row.images);
        parsedImages = Array.isArray(parsed) ? parsed : [row.images];
      } catch {
        parsedImages = [row.images];
      }
    }

    return {
      id: Number(row.id),
      title: row.title,
      price: Number(row.price),
      description: row.description,
      category: row.category,
      images: parsedImages,
      created_at: String(row.created_at),
      created_by: row.created_by,
      created_by_id: String(row.created_by_id),
      updated_at: String(row.updated_at),
      updated_by: row.updated_by,
      updated_by_id: String(row.updated_by_id),
    };
  }

  public async findAll(filter: ProductFilterQuery): Promise<PaginatedProducts> {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filter.search) {
      conditions.push("title LIKE ?");
      params.push(`%${filter.search}%`);
    }

    if (filter.category) {
      conditions.push("category = ?");
      params.push(filter.category);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count query
    const countSql = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    const [countRows] = await this.pool.query<CountRow[]>(countSql, params);
    const total = countRows[0]?.total ?? 0;

    // Pagination calculation
    const page = filter.page;
    const limit = filter.limit;
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit) || 1;

    // Select query
    const selectSql = `
      SELECT id, title, price, description, category, images, created_at, created_by, created_by_id, updated_at, updated_by, updated_by_id
      FROM products
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await this.pool.query<ProductRow[]>(selectSql, [...params, limit, offset]);
    const data = rows.map((r) => this.mapRowToEntity(r));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  public async findById(id: number): Promise<ProductEntity | null> {
    const [rows] = await this.pool.query<ProductRow[]>(
      "SELECT id, title, price, description, category, images, created_at, created_by, created_by_id, updated_at, updated_by, updated_by_id FROM products WHERE id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(rows[0]);
  }

  public async create(data: CreateProductData): Promise<ProductEntity> {
    const imagesJson = JSON.stringify(data.images);

    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO products (
        title, price, description, category, images, created_at, created_by, created_by_id, updated_at, updated_by, updated_by_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.price,
        data.description,
        data.category,
        imagesJson,
        data.created_at,
        data.created_by,
        data.created_by_id,
        data.updated_at,
        data.updated_by,
        data.updated_by_id,
      ]
    );

    return {
      id: result.insertId,
      ...data,
    };
  }

  public async update(id: number, data: UpdateProductData): Promise<ProductEntity | null> {
    const fields: string[] = [];
    const params: (string | number | null)[] = [];

    if (data.title !== undefined) {
      fields.push("title = ?");
      params.push(data.title);
    }
    if (data.price !== undefined) {
      fields.push("price = ?");
      params.push(data.price);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      params.push(data.description);
    }
    if (data.category !== undefined) {
      fields.push("category = ?");
      params.push(data.category);
    }
    if (data.images !== undefined) {
      fields.push("images = ?");
      params.push(JSON.stringify(data.images));
    }
    if (data.updated_at !== undefined) {
      fields.push("updated_at = ?");
      params.push(data.updated_at);
    }
    if (data.updated_by !== undefined) {
      fields.push("updated_by = ?");
      params.push(data.updated_by);
    }
    if (data.updated_by_id !== undefined) {
      fields.push("updated_by_id = ?");
      params.push(data.updated_by_id);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    await this.pool.query(
      `UPDATE products SET ${fields.join(", ")} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  public async delete(id: number): Promise<boolean> {
    const [result] = await this.pool.query<ResultSetHeader>(
      "DELETE FROM products WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  }
}
