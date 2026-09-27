import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  email!: string;

  @Column({ select: false, type: 'varchar', length: 255 })
  password!: string;
}
