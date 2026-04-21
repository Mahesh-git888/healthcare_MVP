import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PartnerJwtAuthGuard } from '../common/guards/partner-jwt-auth.guard';
import { JwtUser } from '../common/types/jwt-user.type';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadService } from './lead.service';

@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @UseGuards(PartnerJwtAuthGuard)
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() body: CreateLeadDto) {
    return this.leadService.submitLead(user.sub, body);
  }
}

