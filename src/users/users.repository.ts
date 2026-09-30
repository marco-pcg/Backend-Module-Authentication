import { Repository } from 'typeorm';
import { User } from './user.entity.js';
import { GoogleUser } from '../types.ts';

export class UsersRepository {
  constructor(private readonly repository: Repository<User>) {}

  create(user: Partial<User>): User {
    return this.repository.create(user);
  }

  save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.repository.find({
      select: { id: true, name: true, email: true },
      order: { id: 'ASC' },
    });
  }

  findById(id: number): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      select: { id: true, name: true, email: true },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async update(
    id: number,
    changes: Partial<Pick<User, 'name' | 'email' | 'password'>>,
  ): Promise<User | null> {
    await this.repository.update(id, changes);
    return this.findById(id);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected === 1;
  }
}
