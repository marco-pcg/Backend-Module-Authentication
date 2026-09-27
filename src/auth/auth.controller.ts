import { RequestHandler, Router } from 'express';
import { AuthService } from './auth.service.js';

export class AuthController {
  readonly router = Router();

  constructor(private readonly authService: AuthService) {
    this.router.post('/register', this.register);
    this.router.post('/login', this.login);
  }

  private register: RequestHandler = async (request, response, next) => {
    try {
      const { name, email, password } = request.body;
      validateCredentials(name, email, password);
      response.status(201).json(
        await this.authService.register({ name, email, password }),
      );
    } catch (error) {
      next(error);
    }
  };

  private login: RequestHandler = async (request, response, next) => {
    try {
      const { email, password } = request.body;
      validateCredentials('user', email, password);
      response.json(await this.authService.login(email, password));
    } catch (error) {
      next(error);
    }
  };
}

function validateCredentials(
  name: unknown,
  email: unknown,
  password: unknown,
): asserts name is string {
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !name.trim() ||
    !email.trim() ||
    password.length < 8
  ) {
    const error = new Error(
      'Name, email, and a password of at least 8 characters are required',
    );
    error.name = 'ValidationError';
    throw error;
  }
}
