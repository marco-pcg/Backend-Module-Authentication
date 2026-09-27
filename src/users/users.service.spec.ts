import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;
  const repository = {
    create: vi.fn((user) => user),
    save: vi.fn((user) => Promise.resolve({ id: 1, ...user })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('hashes a password before saving a user', async () => {
    const user = await service.create({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'secret',
    });

    expect(user.password).not.toBe('secret');
    await expect(bcrypt.compare('secret', user.password)).resolves.toBe(true);
    expect(repository.save).toHaveBeenCalledOnce();
  });
});
