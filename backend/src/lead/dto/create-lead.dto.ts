import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  patientName!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+\-\s]{8,15}$/)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  area!: string;

  @IsString()
  @IsNotEmpty()
  serviceType!: string;

  @IsOptional()
  @IsString()
  shiftType?: string;
}

