import { IAuthRepository } from "../domain/auth.repository";
import { IPasswordHasher } from "../domain/password-hasher.interface";
import { ITokenService } from "../domain/token-service.interface";
import { LoginDTO, LoginResultDTO } from "./auth.dto";
import { UnauthorizedError } from "../../../core/errors/app-error";

export class LoginUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  public async execute(dto: LoginDTO): Promise<LoginResultDTO> {
    const normalizedUsername = dto.username.trim().toLowerCase();
    const user = await this.authRepository.findByUsername(normalizedUsername);

    if (!user) {
      throw new UnauthorizedError("Invalid username or password");
    }

    const isPasswordValid = await this.passwordHasher.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid username or password");
    }

    const tokens = this.tokenService.generateAuthTokens({
      userId: user.id,
      username: user.username,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
      },
      authentication_token: tokens.authenticationToken,
      refresh_token: tokens.refreshToken,
      token_type: "Bearer",
    };
  }
}
