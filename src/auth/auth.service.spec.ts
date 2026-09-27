import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    findByEmail: vi.fn(),
    create: vi.fn(),
  };
  const jwtService = {
    sign: vi.fn(() => 'signed-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
    vi.clearAllMocks();
  });

  it('registers a user and returns a JWT without the password', async () => {
    const user = { id: 1, name: 'Ada', email: 'ada@example.com' } as User;
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue(user);

    const result = await service.register({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'secret',
    });

    expect(usersService.create).toHaveBeenCalledWith({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'secret',
    });
    expect(result).toEqual({
      access_token: 'signed-token',
      user,
    });
    expect(result.user).not.toHaveProperty('password');
  });

  it('rejects duplicate email registration', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 1,
      email: 'ada@example.com',
    });

    await expect(
      service.register({
        name: 'Ada',
        email: 'ada@example.com',
        password: 'secret',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(usersService.create).not.toHaveBeenCalled();
  });

  it('returns a JWT for valid credentials', async () => {
    const password = await bcrypt.hash('secret', 4);
    usersService.findByEmail.mockResolvedValue({
      id: 1,
      name: 'Ada',
      email: 'ada@example.com',
      password,
    });

    await expect(service.login('ada@example.com', 'secret')).resolves.toEqual({
      access_token: 'signed-token',
      user: { id: 1, name: 'Ada', email: 'ada@example.com' },
    });
  });

  it('rejects invalid credentials without issuing a token', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login('ada@example.com', 'wrong'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});
