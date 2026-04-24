import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { BdoService } from '../bdo/bdo.service';
import { Admin } from '../database/entities/admin.entity';
import { PartnerService } from '../partner/partner.service';
import { RegisterPartnerDto } from '../partner/dto/register-partner.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { GenerateBdoLinkDto } from './dto/generate-bdo-link.dto';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly authService: AuthService,
    private readonly partnerService: PartnerService,
    private readonly bdoService: BdoService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const email = this.configService.get<string>('ADMIN_EMAIL')?.trim().toLowerCase();
    const password = this.configService.get<string>('ADMIN_PASSWORD');

    if (!email || !password) {
      return;
    }

    const existingAdmin = await this.adminRepository.findOne({
      where: { email },
    });

    if (existingAdmin) {
      return;
    }

    const admin = this.adminRepository.create({
      email,
      password: await hash(password, 10),
    });

    await this.adminRepository.save(admin);
  }

  async login(body: AdminLoginDto) {
    const admin = await this.adminRepository.findOne({
      where: { email: body.email.trim().toLowerCase() },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const passwordMatches = await compare(body.password, admin.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    return this.authService.buildAdminSession(admin);
  }

  createPartner(body: RegisterPartnerDto) {
    return this.partnerService.createByAdmin(body);
  }

  async listPartners() {
    const partners = await this.partnerService.findAll();

    return partners.map((partner) => ({
      id: partner.id,
      name: partner.name,
      phone: partner.phone,
      bdoId: partner.bdoId ?? null,
      role: partner.role,
      city: partner.city,
      area: partner.area,
      organizationName: partner.organizationName,
      address: partner.address,
      createdAt: partner.createdAt,
    }));
  }

  async generateAccessLink(partnerId: string) {
    const partner = await this.partnerService.findById(partnerId);

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    return this.authService.generatePartnerAccessLink(partner);
  }

  listBdos() {
    return this.bdoService.listBdos();
  }

  async generateBdoLink(body: GenerateBdoLinkDto) {
    const bdoId = (body.bdoId ?? body.bdo_id)?.trim();

    if (!bdoId) {
      throw new BadRequestException('bdo_id is required');
    }

    return this.bdoService.generateWhatsAppLink(bdoId);
  }
}
