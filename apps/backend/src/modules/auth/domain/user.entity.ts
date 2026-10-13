export interface UserEntity {
  id: number;
  username: string;
  passwordHash: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SafeUser {
  id: number;
  username: string;
}
