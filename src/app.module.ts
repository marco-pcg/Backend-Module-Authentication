import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { User } from './users/entities/user.entity.js';
import { UsersModule } from './users/users.module.js';

const databaseModule = [
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
            synchronize:
              configService.get<string>('DATABASE_SYNCHRONIZE') === 'true',
          }),
        }),
      ];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...databaseModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
