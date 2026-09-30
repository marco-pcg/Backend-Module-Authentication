export interface CreateUserInput {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  picture?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
}
