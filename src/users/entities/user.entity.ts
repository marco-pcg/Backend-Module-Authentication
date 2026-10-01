import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false, nullable: true })
  password?: string;

  @Column({ select: false, nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  picture?: string;

  @Column({ nullable: true })
  accessToken?: string;
}
