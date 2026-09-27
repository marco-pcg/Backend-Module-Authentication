export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Backend Auth API',
    description: 'Authentication and user management API.',
    version: '1.0.0',
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'Auth', description: 'User registration and authentication' },
    { name: 'Users', description: 'Authenticated user management' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        required: ['id', 'name', 'email'],
        properties: {
          id: { type: 'integer', format: 'int64', example: 1 },
          name: { type: 'string', example: 'Ada Lovelace' },
          email: { type: 'string', format: 'email', example: 'ada@example.com' },
        },
      },
      Credentials: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'ada@example.com' },
          password: { type: 'string', format: 'password', minLength: 8, example: 'password123' },
        },
      },
      RegisterRequest: {
        allOf: [
          { $ref: '#/components/schemas/Credentials' },
          {
            type: 'object',
            required: ['name'],
            properties: {
              name: { type: 'string', example: 'Ada Lovelace' },
            },
          },
        ],
      },
      UserRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Ada Lovelace' },
          email: { type: 'string', format: 'email', example: 'ada@example.com' },
          password: { type: 'string', format: 'password', minLength: 8, example: 'newpassword123' },
        },
      },
      AuthResponse: {
        type: 'object',
        required: ['access_token', 'user'],
        properties: {
          access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      Error: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string', example: 'User not found' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
        },
        responses: {
          '201': {
            description: 'User registered and authenticated',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          '409': { description: 'Email is already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate a user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Credentials' } } },
        },
        responses: {
          '200': {
            description: 'User authenticated',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          '401': { description: 'Invalid email or password', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List users',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Users retrieved',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } },
          },
          '401': { description: 'Missing or invalid bearer token' },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Create a user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UserRequest' } } },
        },
        responses: {
          '201': {
            description: 'User created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          '401': { description: 'Missing or invalid bearer token' },
          '409': { description: 'Email is already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/users/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 }, example: 1 }],
      get: {
        tags: ['Users'],
        summary: 'Get a user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'User retrieved', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          '401': { description: 'Missing or invalid bearer token' },
          '404': { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update a user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UserRequest' } } },
        },
        responses: {
          '200': { description: 'User updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          '401': { description: 'Missing or invalid bearer token' },
          '404': { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete a user',
        security: [{ bearerAuth: [] }],
        responses: {
          '204': { description: 'User deleted' },
          '401': { description: 'Missing or invalid bearer token' },
          '404': { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
  },
} as const;
