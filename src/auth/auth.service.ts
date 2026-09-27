import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const user = await this.usersService.create(createUserDto);
    return this.issueToken(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueToken(user);
  }

  private issueToken(user: User) {
    return {
      access_token: this.jwtService.sign({ sub: user.id, email: user.email }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
