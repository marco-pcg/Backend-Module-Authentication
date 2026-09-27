import { Router, RequestHandler } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { UsersService } from './users.service.js';
import { User } from './user.entity.js';

export class UsersController {
  readonly router = Router();

  constructor(private readonly usersService: UsersService) {
    this.router.use(authenticate);
    this.router.post('/', this.create);
    this.router.get('/', this.findAll);
    this.router.get('/:id', this.findOne);
    this.router.patch('/:id', this.update);
    this.router.delete('/:id', this.remove);
  }

  private create: RequestHandler = async (request, response, next) => {
    try {
      const { name, email, password } = request.body;
      validateUserInput(name, email, password);
      const existing = await this.usersService.findByEmail(email);
      if (existing) {
        response.status(409).json({ message: 'Email is already registered' });
        return;
      }
      const user = await this.usersService.create({ name, email, password });
      response.status(201).json(publicUser(user));
    } catch (error) {
      next(error);
    }
  };

  private findAll: RequestHandler = async (_request, response, next) => {
    try {
      response.json((await this.usersService.findAll()).map(publicUser));
    } catch (error) {
      next(error);
    }
  };

  private findOne: RequestHandler = async (request, response, next) => {
    try {
      const user = await this.usersService.findById(parseId(request.params.id));
      if (!user) {
        response.status(404).json({ message: 'User not found' });
        return;
      }
      response.json(publicUser(user));
    } catch (error) {
      next(error);
    }
  };

  private update: RequestHandler = async (request, response, next) => {
    try {
      const id = parseId(request.params.id);
      const { name, email, password } = request.body;
      const user = await this.usersService.update(id, { name, email, password });
      if (!user) {
        response.status(404).json({ message: 'User not found' });
        return;
      }
      response.json(publicUser(user));
    } catch (error) {
      next(error);
    }
  };

  private remove: RequestHandler = async (request, response, next) => {
    try {
      const removed = await this.usersService.remove(parseId(request.params.id));
      if (!removed) {
        response.status(404).json({ message: 'User not found' });
        return;
      }
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

function validateUserInput(
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

function parseId(value: string | string[]): number {
  if (Array.isArray(value)) {
    const error = new Error('User ID must be a positive integer');
    error.name = 'ValidationError';
    throw error;
  }
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    const error = new Error('User ID must be a positive integer');
    error.name = 'ValidationError';
    throw error;
  }
  return id;
}

function publicUser(user: User) {
  return { id: user.id, name: user.name, email: user.email };
}
