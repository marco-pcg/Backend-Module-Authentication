import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { config } from './config.js';
import { pool } from './database.js';
import { AuthenticatedRequest, AuthResult, User } from './types.js';

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const existing = await pool.query<User>(
    'SELECT id, name, email FROM users WHERE email = $1',
    [email],
  );
  if (existing.rowCount) {
    const error = new Error('Email is already registered');
    error.name = 'ConflictError';
    throw error;
  }

  const hash = await bcrypt.hash(password, 12);
  const result = await pool.query<User>(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
    [name, email, hash],
  );
  return issueToken(result.rows[0]);
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResult> {
  const result = await pool.query<User>(
    'SELECT id, name, email, password FROM users WHERE email = $1',
    [email],
  );
  const user = result.rows[0];
  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    const error = new Error('Invalid email or password');
    error.name = 'UnauthorizedError';
    throw error;
  }
  return issueToken(user);
}

function issueToken(user: User) {
  return {
    access_token: jwt.sign({ sub: user.id, email: user.email }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    }),
    user: { id: user.id, name: user.name, email: user.email },
  };
}

export function authenticate(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const header = request.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) {
    response.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
    if (typeof payload.sub !== 'number' || typeof payload.email !== 'string') {
      response.status(401).json({ message: 'Unauthorized' });
      return;
    }
    (request as AuthenticatedRequest).user = {
      id: payload.sub,
      email: payload.email,
    };
    next();
  } catch {
    response.status(401).json({ message: 'Unauthorized' });
  }
}
