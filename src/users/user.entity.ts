import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  email!: string;

  @Column({ select: false, nullable: true, type: 'varchar', length: 255 })
  password?: string;

  @Column({ nullable: true, unique: true, type: 'varchar', length: 255 })
  googleId?: string;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  picture?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
