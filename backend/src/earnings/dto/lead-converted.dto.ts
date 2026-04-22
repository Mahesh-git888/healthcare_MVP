import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class LeadConvertedDto {
  @IsUUID()
  @IsNotEmpty()
  lead_id!: string;

  @IsNumber()
  @Type(() => Number)
  service_amount!: number;

  @IsDateString()
  service_date!: string;
}
