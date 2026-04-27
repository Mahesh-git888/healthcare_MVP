import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner } from '../database/entities/partner.entity';
import { AuthService } from '../auth/auth.service';
import { BdoService } from '../bdo/bdo.service';
import { RegisterPartnerDto } from './dto/register-partner.dto';

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    private readonly authService: AuthService,
    private readonly bdoService: BdoService,
  ) {}

  async register(body: RegisterPartnerDto) {
    const normalizedPhone = normalizePhone(body.phone);
    const normalizedBdoId = normalizeOptionalString(body.bdoId ?? body.bdo_id)?.toUpperCase();
    const existingPartner = await this.partnerRepository.findOne({
      where: { phone: normalizedPhone },
    });

    if (existingPartner) {
      throw new ConflictException('Phone number is already registered');
    }

    if (normalizedBdoId) {
      await this.bdoService.validateEmployeeId(normalizedBdoId);
    }

    const partner = this.partnerRepository.create({
      name: body.name.trim(),
      phone: normalizedPhone,
      role: body.role,
      city: body.city.trim(),
      area: body.city.trim(),
      organizationName: normalizeOptionalString(body.organizationName),
      address: null,
      bdoId: normalizedBdoId || null,
    });
    const savedPartner = await this.partnerRepository.save(partner);

    return {
      message: 'Partner registered successfully',
      ...(await this.authService.buildPartnerSession(savedPartner)),
    };
  }

  findAll() {
    return this.partnerRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: string) {
    return this.partnerRepository.findOne({ where: { id } });
  }

  async createByAdmin(body: RegisterPartnerDto) {
    const normalizedPhone = normalizePhone(body.phone);
    const normalizedBdoId = normalizeOptionalString(body.bdoId ?? body.bdo_id)?.toUpperCase();
    const existingPartner = await this.partnerRepository.findOne({
      where: { phone: normalizedPhone },
    });

    if (existingPartner) {
      throw new ConflictException('Phone number is already registered');
    }

    if (normalizedBdoId) {
      await this.bdoService.validateEmployeeId(normalizedBdoId);
    }

    const partner = this.partnerRepository.create({
      name: body.name.trim(),
      phone: normalizedPhone,
      role: body.role,
      city: body.city.trim(),
      area: body.city.trim(),
      organizationName: normalizeOptionalString(body.organizationName),
      address: null,
      bdoId: normalizedBdoId || null,
    });

    return this.partnerRepository.save(partner);
  }
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D+/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function normalizeOptionalString(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
