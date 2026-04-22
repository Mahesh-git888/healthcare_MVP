import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../database/entities/lead.entity';
import { Partner } from '../database/entities/partner.entity';
import { GoogleSheetsService } from '../google-sheets/google-sheets.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    private readonly googleSheetsService: GoogleSheetsService,
  ) {}

  async submitLead(partnerId: string, body: CreateLeadDto) {
    const partner = await this.partnerRepository.findOne({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    const lead = this.leadRepository.create({
      partner,
      bdoId: partner.bdoId ?? null,
      patientName: body.patientName,
      patientPhone: body.phone,
      city: body.city,
      area: body.area,
      serviceType: body.serviceType,
      shiftType: body.shiftType?.trim() || null,
      status: 'NEW',
    });

    const savedLead = await this.leadRepository.save(lead);
    await this.googleSheetsService.appendLead(partner, body);

    return {
      message: 'Lead submitted successfully',
      status: 'NEW',
      leadId: savedLead.id,
    };
  }
}
