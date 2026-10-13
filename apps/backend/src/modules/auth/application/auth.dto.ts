import { SafeUser } from "../domain/user.entity";

export interface RegisterDTO {
  username: string;
  password: string;
  password_confirmation: string;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface LoginResultDTO {
  user: SafeUser;
  authentication_token: string;
  refresh_token: string;
  token_type: string;
}
