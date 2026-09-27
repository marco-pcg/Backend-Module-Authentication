import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';

const userDatabaseModule =
  process.env.NODE_ENV === 'test'
    ? []
    : [TypeOrmModule.forFeature([User])];

@Module({
  imports: userDatabaseModule,
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
