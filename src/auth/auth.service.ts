import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User } from '../users/user.entity.js';
import { CreateUserInput, UsersService } from '../users/users.service.js';

export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(input: CreateUserInput) {
    if (await this.usersService.findByEmail(input.email)) {
      const error = new Error('Email is already registered');
      error.name = 'ConflictError';
      throw error;
    }
    return this.issueToken(await this.usersService.create(input));
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
      const error = new Error('Invalid email or password');
      error.name = 'UnauthorizedError';
      throw error;
    }
    return this.issueToken(user);
  }

  private issueToken(user: User) {
    return {
      access_token: jwt.sign({ sub: user.id, email: user.email }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
      }),
      user: { id: user.id, name: user.name, email: user.email },
    };
  }
}
