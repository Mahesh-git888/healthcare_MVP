import { CreateDateColumn, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'bdos' })
export class Bdo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id', unique: true, length: 64 })
  employeeId!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  phone!: string;

  @Column()
  city!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
