export interface AuthenticatedUser {
  userId: number;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
