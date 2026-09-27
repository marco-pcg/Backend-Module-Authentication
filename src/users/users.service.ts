import * as bcrypt from 'bcrypt';
import { User } from './user.entity.js';
import { UsersRepository } from './users.repository.js';
import { CreateUserInput, UpdateUserInput } from './dto/user.dto.js';

export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(input: CreateUserInput): Promise<User> {
    const password = await bcrypt.hash(input.password, 12);
    return this.usersRepository.save(
      this.usersRepository.create({ ...input, password }),
    );
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async update(id: number, input: UpdateUserInput): Promise<User | null> {
    const changes = { ...input };
    if (changes.password) {
      changes.password = await bcrypt.hash(changes.password, 12);
    }
    return this.usersRepository.update(id, changes);
  }

  remove(id: number): Promise<boolean> {
    return this.usersRepository.remove(id);
  }
}
