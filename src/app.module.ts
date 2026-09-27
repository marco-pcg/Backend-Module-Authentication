import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { User } from './users/entities/user.entity.js';
import { UsersModule } from './users/users.module.js';

const databaseModule =
  process.env.NODE_ENV === 'test'
    ? []
    : [
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres' as const,
            url: configService.get<string>('DATABASE_URL'),
            entities: [User],
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
