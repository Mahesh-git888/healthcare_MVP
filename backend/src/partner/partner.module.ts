import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BdoModule } from '../bdo/bdo.module';
import { Partner } from '../database/entities/partner.entity';
import { PartnerController } from './partner.controller';
import { PartnerService } from './partner.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Partner]),
    forwardRef(() => AuthModule),
    BdoModule,
  ],
  controllers: [PartnerController],
  providers: [PartnerService],
  exports: [PartnerService, TypeOrmModule],
})
export class PartnerModule {}
