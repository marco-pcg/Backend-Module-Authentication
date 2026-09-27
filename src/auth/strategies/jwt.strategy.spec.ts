import { ConfigService } from '@nestjs/config';
import { JwtStrategy, JwtPayload } from './jwt.strategy.js';

describe('JwtStrategy', () => {
  it('maps JWT claims to the authenticated user context', () => {
    const configService = {
      getOrThrow: vi.fn(() => 'test-secret'),
    } as unknown as ConfigService;
    const strategy = new JwtStrategy(configService);
    const payload: JwtPayload = { sub: 7, email: 'ada@example.com' };

    expect(strategy.validate(payload)).toEqual({
      userId: 7,
      email: 'ada@example.com',
    });
  });
});
