import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '<a href="/auth/google">Sign in with Google</a>';
  }
}
