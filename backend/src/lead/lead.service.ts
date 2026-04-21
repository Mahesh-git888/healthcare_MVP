import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner } from '../database/entities/partner.entity';
import { GoogleSheetsService } from '../google-sheets/google-sheets.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    private readonly googleSheetsService: GoogleSheetsService,
  ) {}

  async submitLead(partnerId: string, body: CreateLeadDto) {
    const partner = await this.partnerRepository.findOne({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    await this.googleSheetsService.appendLead(partner, body);

    return {
      message: 'Lead submitted successfully',
      status: 'NEW',
    };
  }
}

