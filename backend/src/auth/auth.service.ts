import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../database/entities/admin.entity';
import { Partner } from '../database/entities/partner.entity';
import { JwtUser } from '../common/types/jwt-user.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async loginPartnerByPhone(phone: string) {
    const partner = await this.partnerRepository.findOne({
      where: { phone: normalizePhone(phone) },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    return this.buildPartnerSession(partner);
  }

  async exchangeAccessLinkToken(token: string) {
    const secret = this.configService.getOrThrow<string>('ACCESS_LINK_SECRET');

    let payload: { sub: string; kind: 'partner'; phone: string };

    try {
      payload = await this.jwtService.verifyAsync(token, { secret });
    } catch {
      throw new UnauthorizedException('Access link is invalid or expired');
    }

    if (payload.kind !== 'partner') {
      throw new UnauthorizedException('Access link is invalid');
    }

    const partner = await this.partnerRepository.findOne({
      where: { id: payload.sub },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    return this.buildPartnerSession(partner);
  }

  async buildPartnerSession(partner: Partner) {
    const accessToken = await this.signSessionToken({
      sub: partner.id,
      kind: 'partner',
      phone: partner.phone,
    });

    return {
      accessToken,
      partner: serializePartner(partner),
    };
  }

  async buildAdminSession(admin: Admin) {
    const accessToken = await this.signSessionToken({
      sub: admin.id,
      kind: 'admin',
      email: admin.email,
    });

    return {
      accessToken,
      admin: serializeAdmin(admin),
    };
  }

  async generatePartnerAccessLink(partner: Partner) {
    const token = await this.jwtService.signAsync(
      {
        sub: partner.id,
        kind: 'partner',
        phone: partner.phone,
      },
      {
        secret: this.configService.getOrThrow<string>('ACCESS_LINK_SECRET'),
        expiresIn: this.getAccessLinkExpiresIn(),
      },
    );

    const frontendUrl =
      this.configService.get<string>('APP_FRONTEND_URL') ??
      this.configService.get<string>('FRONTEND_URL')?.split(',')[0]?.trim() ??
      '';
    const accessLink = `${frontendUrl.replace(/\/$/, '')}/access?token=${token}`;

    return {
      token,
      accessLink,
      expiresIn:
        this.configService.get<string>('ACCESS_LINK_EXPIRES_IN') ?? '7d',
    };
  }

  private signSessionToken(payload: JwtUser) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.getSessionExpiresIn(),
    });
  }

  private getSessionExpiresIn(): NonNullable<JwtSignOptions['expiresIn']> {
    return (this.configService.get<string>('JWT_EXPIRES_IN') ??
      '7d') as NonNullable<JwtSignOptions['expiresIn']>;
  }

  private getAccessLinkExpiresIn(): NonNullable<JwtSignOptions['expiresIn']> {
    return (this.configService.get<string>('ACCESS_LINK_EXPIRES_IN') ??
      '7d') as NonNullable<JwtSignOptions['expiresIn']>;
  }
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D+/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function serializePartner(partner: Partner) {
  return {
    id: partner.id,
    name: partner.name,
    phone: partner.phone,
    bdoId: partner.bdoId ?? null,
    role: partner.role,
    city: partner.city,
    languagePreference: partner.languagePreference ?? null,
    organizationName: partner.organizationName ?? null,
    createdAt: partner.createdAt,
  };
}

function serializeAdmin(admin: Admin) {
  return {
    id: admin.id,
    email: admin.email,
    createdAt: admin.createdAt,
  };
}
