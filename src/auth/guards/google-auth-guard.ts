import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard, AuthGuardAuthenticateOptions } from "@nestjs/passport";

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext): Promise<AuthGuardAuthenticateOptions> | AuthGuardAuthenticateOptions | undefined {
    return {
      scope: ['email', 'profile'],
      accessType: 'offline',
      prompt: 'select_account',
    };
  }
}
