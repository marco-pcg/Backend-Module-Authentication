import { Router } from 'express';
import { dataSource } from '../database/data-source.js';
import { User } from './user.entity.js';
import { UsersController } from './users.controller.js';
import { UsersRepository } from './users.repository.js';
import { UsersService } from './users.service.js';

export class UsersModule {
  readonly service: UsersService;
  readonly router: Router;

  constructor() {
    this.service = new UsersService(
      new UsersRepository(dataSource.getRepository(User)),
    );
    this.router = new UsersController(this.service).router;
  }
}
