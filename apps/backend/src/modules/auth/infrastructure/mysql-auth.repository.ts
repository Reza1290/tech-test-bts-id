import { Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { IAuthRepository } from "../domain/auth.repository";
import { UserEntity } from "../domain/user.entity";
import { dbPool } from "../../../core/database/connection";

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export class MysqlAuthRepository implements IAuthRepository {
  constructor(private readonly pool: Pool = dbPool) {}

  public async findByUsername(username: string): Promise<UserEntity | null> {
    const [rows] = await this.pool.query<UserRow[]>(
      "SELECT id, username, password_hash, created_at, updated_at FROM users WHERE username = ? LIMIT 1",
      [username]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  public async findById(id: number): Promise<UserEntity | null> {
    const [rows] = await this.pool.query<UserRow[]>(
      "SELECT id, username, password_hash, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  public async create(userData: { username: string; passwordHash: string }): Promise<UserEntity> {
    const [result] = await this.pool.query<ResultSetHeader>(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      [userData.username, userData.passwordHash]
    );

    const insertedId = result.insertId;
    return {
      id: insertedId,
      username: userData.username,
      passwordHash: userData.passwordHash,
    };
  }
}
