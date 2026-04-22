import {
  CreateDateColumn,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Partner } from './partner.entity';

export type LeadStatus = 'NEW' | 'CONVERTED' | 'CLOSED';

@Entity({ name: 'leads' })
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Partner, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partner_id' })
  partner!: Partner;

  @Column({ name: 'bdo_id', type: 'varchar', length: 64, nullable: true })
  bdoId!: string | null;

  @Column({ name: 'patient_name' })
  patientName!: string;

  @Column({ name: 'patient_phone' })
  patientPhone!: string;

  @Column()
  city!: string;

  @Column()
  area!: string;

  @Column({ name: 'service_type' })
  serviceType!: string;

 @Column({ name: 'shift_type', type: 'varchar', nullable: true })
  shiftType!: string | null;

  @Column({ default: 'NEW' })
  status!: LeadStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

