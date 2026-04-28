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

  @Column({ name: 'language_preference', type: 'varchar', length: 32, nullable: true })
  languagePreference!: string | null;

  @Column({ name: 'organization_name', type: 'varchar', nullable: true })
  organizationName!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
