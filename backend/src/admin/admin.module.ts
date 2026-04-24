import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BdoModule } from '../bdo/bdo.module';
import { Admin } from '../database/entities/admin.entity';
import { PartnerModule } from '../partner/partner.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Admin]),
    forwardRef(() => AuthModule),
    PartnerModule,
    BdoModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
