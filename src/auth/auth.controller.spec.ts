import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

describe('AuthController', () => {
  let app: INestApplication;
  const authService = {
    register: vi.fn(),
    login: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: {
          switchToHttp: () => {
            getRequest: () => { user: { userId: number; email: string } };
          };
        }) => {
          context.switchToHttp().getRequest().user = {
            userId: 7,
            email: 'ada@example.com',
          };
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    vi.clearAllMocks();
  });

  it('accepts registration requests at POST /auth/register', async () => {
    const response = { access_token: 'token', user: { id: 1 } };
    authService.register.mockResolvedValue(response);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Ada', email: 'ada@example.com', password: 'secret' })
      .expect(201)
      .expect(response);

    expect(authService.register).toHaveBeenCalledWith({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'secret',
    });
  });

  it('accepts login requests at POST /auth/login', async () => {
    const response = { access_token: 'token', user: { id: 1 } };
    authService.login.mockResolvedValue(response);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ada@example.com', password: 'secret' })
      .expect(201)
      .expect(response);

    expect(authService.login).toHaveBeenCalledWith('ada@example.com', 'secret');
  });

  it('returns the authenticated user at GET /auth/profile', async () => {
    await request(app.getHttpServer())
      .get('/auth/profile')
      .expect(200)
      .expect({ userId: 7, email: 'ada@example.com' });
  });
});
