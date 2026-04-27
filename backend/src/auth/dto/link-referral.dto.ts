import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class LinkReferralDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10}$/)
  phone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  bdoId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  bdo_id?: string;
}
