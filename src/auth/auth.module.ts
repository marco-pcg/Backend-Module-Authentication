import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';

export class AuthModule {
  readonly router: Router;

  constructor(usersService: UsersService) {
    this.router = new AuthController(new AuthService(usersService)).router;
  }
}
