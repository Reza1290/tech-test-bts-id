import { IAuthRepository } from "../domain/auth.repository";
import { IPasswordHasher } from "../domain/password-hasher.interface";
import { RegisterDTO } from "./auth.dto";
import { SafeUser } from "../domain/user.entity";
import { ConflictError, ValidationError } from "../../../core/errors/app-error";

export class RegisterUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  public async execute(dto: RegisterDTO): Promise<SafeUser> {
    if (dto.password !== dto.password_confirmation) {
      throw new ValidationError("Password confirmation does not match password");
    }

    const normalizedUsername = dto.username.trim().toLowerCase();
    const existing = await this.authRepository.findByUsername(normalizedUsername);

    if (existing) {
      throw new ConflictError(`Username '${dto.username}' is already taken`);
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);
    const createdUser = await this.authRepository.create({
      username: normalizedUsername,
      passwordHash,
    });

    return {
      id: createdUser.id,
      username: createdUser.username,
    };
  }
}
