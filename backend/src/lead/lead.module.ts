import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from '../database/entities/lead.entity';
import { Partner } from '../database/entities/partner.entity';
import { GoogleSheetsModule } from '../google-sheets/google-sheets.module';
import { LeadController } from './lead.controller';
import { LeadService } from './lead.service';

@Module({
  imports: [TypeOrmModule.forFeature([Partner, Lead]), GoogleSheetsModule],
  controllers: [LeadController],
  providers: [LeadService],
})
export class LeadModule {}
