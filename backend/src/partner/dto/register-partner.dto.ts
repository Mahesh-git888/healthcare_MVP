import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { PartnerRole } from '../../common/enums/partner-role.enum';

export class RegisterPartnerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10}$/)
  phone!: string;

  @IsEnum(PartnerRole)
  role!: PartnerRole;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  bdoId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  bdo_id?: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsOptional()
  @IsString()
  organizationName?: string;
}
