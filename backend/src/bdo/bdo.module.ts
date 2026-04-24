import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bdo } from '../database/entities/bdo.entity';
import { BdoService } from './bdo.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Bdo])],
  providers: [BdoService],
  exports: [BdoService, TypeOrmModule],
})
export class BdoModule {}
