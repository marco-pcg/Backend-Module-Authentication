import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { Injectable, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create({
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 12),
    });
    return this.usersRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const update = { ...updateUserDto };
    if (update.password) {
      update.password = await bcrypt.hash(update.password, 12);
    }
    return this.usersRepository.save({ id, ...update });
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async findOrCreateGoogleUser (googleUser: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    accessToken: string;
  }): Promise<User> {
    let user = await this.usersRepository.findOne({
      where: [{ googleId: googleUser.googleId }, { email: googleUser.email }]
    })

    if (user) {
      if (!user.googleId) {
        user.googleId = googleUser.googleId
        user.picture = googleUser.picture
        user.accessToken = googleUser.accessToken
        await this.usersRepository.save(user)
      }
      return user
    }

    const newUser = this.usersRepository.create({
      email: googleUser.email,
      name: `${googleUser.firstName} ${googleUser.lastName ?? ''}`.trim(),
      googleId: googleUser.googleId,
      picture: googleUser.picture,
      accessToken: googleUser.accessToken
    })

    return await this.usersRepository.save(newUser)
  }

}
