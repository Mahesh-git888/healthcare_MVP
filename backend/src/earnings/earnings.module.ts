import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Earning } from '../database/entities/earning.entity';
import { EarningsController } from './earnings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Earning])],
  controllers: [EarningsController],
})
export class EarningsModule {}
