import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  patientName!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10}$/)
  phone!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  serviceType?: string;
}
