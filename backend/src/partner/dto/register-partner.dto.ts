import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';
import { PartnerRole } from '../../common/enums/partner-role.enum';

export class RegisterPartnerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+\-\s]{8,15}$/)
  phone!: string;

  @IsEnum(PartnerRole)
  role!: PartnerRole;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  area!: string;

  @IsString()
  @IsNotEmpty()
  organizationName!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;
}

