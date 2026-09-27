import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

describe('UsersController', () => {
  let app: INestApplication;
  const usersService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    vi.clearAllMocks();
  });

  it('creates a user through POST /users', async () => {
    const user = { id: 1, name: 'Ada', email: 'ada@example.com' };
    usersService.create.mockResolvedValue(user);

    await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Ada', email: 'ada@example.com', password: 'secret' })
      .expect(201)
      .expect(user);

    expect(usersService.create).toHaveBeenCalledWith({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'secret',
    });
  });

  it('requires the JWT guard for user routes', async () => {
    usersService.findAll.mockResolvedValue([]);

    await request(app.getHttpServer()).get('/users').expect(200).expect([]);
    expect(usersService.findAll).toHaveBeenCalledOnce();
  });

  it('parses user IDs and delegates update and delete operations', async () => {
    const updatedUser = { id: 7, name: 'Grace', email: 'grace@example.com' };
    usersService.update.mockResolvedValue(updatedUser);
    usersService.remove.mockResolvedValue(undefined);

    await request(app.getHttpServer())
      .patch('/users/7')
      .send({ name: 'Grace' })
      .expect(200)
      .expect(updatedUser);
    await request(app.getHttpServer()).delete('/users/7').expect(200);

    expect(usersService.update).toHaveBeenCalledWith(7, { name: 'Grace' });
    expect(usersService.remove).toHaveBeenCalledWith(7);
  });
});
