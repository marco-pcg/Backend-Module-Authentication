export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: Pick<User, 'id' | 'email'>;
}

export interface AuthResult {
  access_token: string;
  user: Omit<User, 'password'>;
}
