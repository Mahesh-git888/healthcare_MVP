import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '../database/entities/admin.entity';
import { Partner } from '../database/entities/partner.entity';
import { PartnerModule } from '../partner/partner.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';
import { PartnerJwtStrategy } from './strategies/partner-jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Partner, Admin]),
    forwardRef(() => PartnerModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, PartnerJwtStrategy, AdminJwtStrategy],
  exports: [AuthService, TypeOrmModule],
})
export class AuthModule {}
