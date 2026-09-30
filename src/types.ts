import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string };
}

export interface GoogleUser {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
  expires_date: number;
}
