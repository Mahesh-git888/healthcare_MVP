import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from '../common/guards/admin-jwt-auth.guard';
import { RegisterPartnerDto } from '../partner/dto/register-partner.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { GenerateBdoLinkDto } from './dto/generate-bdo-link.dto';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  login(@Body() body: AdminLoginDto) {
    return this.adminService.login(body);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('partners')
  createPartner(@Body() body: RegisterPartnerDto) {
    return this.adminService.createPartner(body);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('partners')
  getPartners() {
    return this.adminService.listPartners();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('generate-link/:id')
  generateAccessLink(@Param('id') partnerId: string) {
    return this.adminService.generateAccessLink(partnerId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('generate-bdo-link')
  generateBdoLink(@Body() body: GenerateBdoLinkDto) {
    return this.adminService.generateBdoLink(body);
  }
}
