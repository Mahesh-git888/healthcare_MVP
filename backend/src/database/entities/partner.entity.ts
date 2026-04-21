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

  @Column({
    type: 'enum',
    enum: PartnerRole,
  })
  role!: PartnerRole;

  @Column()
  city!: string;

  @Column()
  area!: string;

  @Column({ name: 'organization_name' })
  organizationName!: string;

  @Column()
  address!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

