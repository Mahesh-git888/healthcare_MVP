import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PartnerJwtAuthGuard } from '../common/guards/partner-jwt-auth.guard';
import { JwtUser } from '../common/types/jwt-user.type';
import { LeadConvertedDto } from './dto/lead-converted.dto';

@Controller()
export class EarningsController {
  @UseGuards(PartnerJwtAuthGuard)
  @Get('partner/earnings')
  getPartnerEarnings(@CurrentUser() _user: JwtUser) {
    return {
      coming_soon: true,
      message: 'Referral earnings tracking is coming soon.',
      summary: {
        total_earned: null,
        pending: null,
        paid: null,
      },
      leads: [],
    };
  }

  // Stub: accepts conversion events but does not process yet.
  @Post('internal/lead-converted')
  leadConverted(@Body() _body: LeadConvertedDto) {
    return { received: true };
  }
}

