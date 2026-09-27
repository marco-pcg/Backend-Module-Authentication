import express, { NextFunction, Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { authenticate, login, register } from './auth.js';
import { pool } from './database.js';
import { User } from './types.js';

export const app = express();
app.use(express.json());

app.get('/', (_request, response) => {
  response.send('Hello World!');
});

app.post('/auth/register', async (request, response, next) => {
  try {
    const { name, email, password } = request.body as Record<string, string>;
    validateCredentials(name, email, password);
    response.status(201).json(await register(name, email, password));
  } catch (error) {
    next(error);
  }
});

app.post('/auth/login', async (request, response, next) => {
  try {
    const { email, password } = request.body as Record<string, string>;
    validateCredentials('user', email, password);
    response.json(await login(email, password));
  } catch (error) {
    next(error);
  }
});

const users = express.Router();
users.use(authenticate);

users.post('/', async (request, response, next) => {
  try {
    const { name, email, password } = request.body as Record<string, string>;
    validateCredentials(name, email, password);
    const result = await register(name, email, password);
    response.status(201).json(result.user);
  } catch (error) {
    next(error);
  }
});

users.get('/', async (_request, response, next) => {
  try {
    const result = await pool.query<User>('SELECT id, name, email FROM users ORDER BY id');
    response.json(result.rows);
  } catch (error) {
    next(error);
  }
});

users.get('/:id', async (request, response, next) => {
  try {
    const result = await pool.query<User>(
      'SELECT id, name, email FROM users WHERE id = $1',
      [parseId(request.params.id)],
    );
    if (!result.rowCount) {
      response.status(404).json({ message: 'User not found' });
      return;
    }
    response.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

users.patch('/:id', async (request, response, next) => {
  try {
    const id = parseId(request.params.id);
    const { name, email, password } = request.body as Partial<User>;
    const hash = password ? await bcrypt.hash(password, 12) : undefined;
    const result = await pool.query<User>(
      `UPDATE users
       SET name = COALESCE($1, name), email = COALESCE($2, email),
           password = COALESCE($3, password)
       WHERE id = $4
       RETURNING id, name, email`,
      [name, email, hash, id],
    );
    if (!result.rowCount) {
      response.status(404).json({ message: 'User not found' });
      return;
    }
    response.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

users.delete('/:id', async (request, response, next) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [
      parseId(request.params.id),
    ]);
    if (!result.rowCount) {
      response.status(404).json({ message: 'User not found' });
      return;
    }
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use('/users', users);

function validateCredentials(name: unknown, email: unknown, password: unknown): asserts name is string {
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !name.trim() ||
    !email.trim() ||
    password.length < 8
  ) {
    const error = new Error('Name, email, and a password of at least 8 characters are required');
    error.name = 'ValidationError';
    throw error;
  }
}

function parseId(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    const error = new Error('User ID must be a positive integer');
    error.name = 'ValidationError';
    throw error;
  }
  return id;
}

app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
  const status =
    error.name === 'ConflictError'
      ? 409
      : error.name === 'UnauthorizedError'
        ? 401
        : error.name === 'ValidationError'
          ? 400
          : 500;
  if (status === 500) {
    console.error(error);
  }
  response.status(status).json({ message: error.message });
});
