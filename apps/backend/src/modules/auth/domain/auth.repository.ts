import { UserEntity } from "./user.entity";

export interface IAuthRepository {
  findByUsername(username: string): Promise<UserEntity | null>;
  findById(id: number): Promise<UserEntity | null>;
  create(userData: { username: string; passwordHash: string }): Promise<UserEntity>;
}
