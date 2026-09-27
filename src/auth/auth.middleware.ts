import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config.js';
import { AuthenticatedRequest } from '../types.js';

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
