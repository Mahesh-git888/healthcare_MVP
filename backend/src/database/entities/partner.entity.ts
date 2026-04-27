import { CreateDateColumn, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PartnerRole } from '../../common/enums/partner-role.enum';

@Entity({ name: 'partners' })
export class Partner {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  phone!: string;

  @Column({ name: 'bdo_id', type: 'varchar', length: 64, nullable: true })
  bdoId!: string | null;

  @Column({
    type: 'enum',
    enum: PartnerRole,
  })
  role!: PartnerRole;

  @Column()
  city!: string;

  @Column()
  area!: string;

<<<<<<< HEAD
  @Column({ name: 'organization_name', nullable: true })
  organizationName!: string | null;

  @Column({ nullable: true })
=======
  @Column({ name: 'organization_name', type: 'varchar', nullable: true })
  organizationName!: string | null;

  @Column({ type: 'text', nullable: true })
>>>>>>> c107e18 (Fix nullable TypeORM column types for Postgres)
  address!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
