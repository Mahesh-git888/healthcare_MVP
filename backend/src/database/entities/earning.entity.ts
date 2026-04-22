import {
  CreateDateColumn,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Lead } from './lead.entity';
import { Partner } from './partner.entity';

export type EarningStatus = 'PENDING' | 'PAID' | 'CANCELLED';

@Entity({ name: 'earnings' })
export class Earning {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Partner, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partner_id' })
  partner!: Partner;

  @ManyToOne(() => Lead, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lead_id' })
  lead!: Lead;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: string;

  @Column({ type: 'varchar', length: 32, default: 'PENDING' })
  status!: EarningStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

