import { Body, Controller, Post } from '@nestjs/common';
import { RegisterPartnerDto } from './dto/register-partner.dto';
import { PartnerService } from './partner.service';

@Controller('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post('register')
  register(@Body() body: RegisterPartnerDto) {
    return this.partnerService.register(body);
  }
}

