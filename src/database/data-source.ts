import 'reflect-metadata'
import { DataSource } from 'typeorm';
import { config } from '../config.js';
import { User } from '../users/user.entity.js';
import { CreateUsersTable1710000000000 } from './migrations/1710000000000-CreateUsersTable.js';

export const dataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.user,
  password: config.database.password,
  database: config.database.name,
  entities: [User],
  migrations: [CreateUsersTable1710000000000],
  migrationsRun: true,
  synchronize: true,
});
