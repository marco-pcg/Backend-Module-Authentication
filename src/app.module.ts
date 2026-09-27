import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { User } from './users/entities/user.entity.js';
import { UsersModule } from './users/users.module.js';
import { CreateUsersTable1710000000000 } from './database/migrations/1710000000000-CreateUsersTable.js';

const databaseModule =
  process.env.NODE_ENV === 'test'
    ? []
    : [
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres' as const,
            host: configService.getOrThrow<string>('DATABASE_HOST'),
            port: Number(configService.getOrThrow<string>('DATABASE_PORT')),
            username: configService.getOrThrow<string>('DATABASE_USER'),
            password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
            database: configService.getOrThrow<string>('DATABASE_NAME'),
            entities: [User],
            migrations: [CreateUsersTable1710000000000],
            migrationsRun: true,
            synchronize:
              configService.get<string>('DATABASE_SYNCHRONIZE') === 'true',
          }),
        }),
      ];

const featureModules =
  process.env.NODE_ENV === 'test' ? [] : [UsersModule, AuthModule];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...databaseModule,
    ...featureModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
