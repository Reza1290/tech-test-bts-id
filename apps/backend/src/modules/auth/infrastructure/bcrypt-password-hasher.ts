import bcrypt from "bcryptjs";
import { IPasswordHasher } from "../domain/password-hasher.interface";

export class BcryptPasswordHasher implements IPasswordHasher {
  constructor(private readonly saltRounds: number = 10) {}

  public async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  public async compare(plainText: string, hashedText: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashedText);
  }
}
