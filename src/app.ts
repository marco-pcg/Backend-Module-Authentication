import express from 'express';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';

export const app = express();
app.use(express.json());

const usersModule = new UsersModule();
const authModule = new AuthModule(usersModule.service);

app.use('/auth', authModule.router);
app.use('/users', usersModule.router);

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on http://localhost:' + (process.env.PORT || 3000));
})
