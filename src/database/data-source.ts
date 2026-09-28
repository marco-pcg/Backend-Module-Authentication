import 'reflect-metadata'
import { DataSource } from 'typeorm';
import { config } from '../config.js';
import { User } from '../users/user.entity.ts';

export const dataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.user,
  password: config.database.password,
  database: config.database.name,
  entities: [User],
  synchronize: true,
});

export const initializeDataSource = () => {
  return dataSource.initialize();
}
