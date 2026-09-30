import { RequestHandler, Router } from 'express';
import { AuthService } from './auth.service.js';
import { oauth2Client, SCOPES } from '../utils/googleClient.ts';
import { GoogleUser } from '../types.ts';

export class AuthController {
  readonly router = Router();

  constructor(private readonly authService: AuthService) {
    this.router.post('/register', this.register);
    this.router.post('/login', this.login);
    this.router.get('/google', this.googleLoginHandler);
    this.router.get('/google/callback', this.googleCallbackHandler);
  }

  private register: RequestHandler = async (request, response, next) => {
    try {
      const { name, email, password } = request.body;
      validateCredentials(name, email, password);
      response.status(201).json(
        await this.authService.register({ name, email, password }),
      );
    } catch (error) {
      next(error);
    }
  };

  private login: RequestHandler = async (request, response, next) => {
    try {
      const { email, password } = request.body;
      validateCredentials('user', email, password);
      response.json(await this.authService.login(email, password));
    } catch (error) {
      next(error);
    }
  };

  private googleLoginHandler: RequestHandler = async (request, response) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    });
    response.redirect(authUrl);
  }

  private googleCallbackHandler: RequestHandler = async (request, response) => {
    const code = request.query.code as string

    if (!code) {
      return response.status(400).json({ error: 'Missing code parameter' });
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const userResponse = await oauth2Client.request<GoogleUser>({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',
        method: 'GET',
      });

      const googleUser = userResponse.data;

      await this.authService.findOrCreateGoogleUser(googleUser)

      return response.json({
        message: 'Authentication successful',
        user: googleUser,
        tokens
      })

    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      return response.status(500).json({ error: 'Failed to authenticate user' });
    }
  }
}

function validateCredentials(
  name: unknown,
  email: unknown,
  password: unknown,
): asserts name is string {
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !name.trim() ||
    !email.trim() ||
    password.length < 8
  ) {
    const error = new Error(
      'Name, email, and a password of at least 8 characters are required',
    );
    error.name = 'ValidationError';
    throw error;
  }
}
