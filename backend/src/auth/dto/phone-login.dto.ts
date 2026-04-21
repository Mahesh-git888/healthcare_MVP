import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class PhoneLoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+\-\s]{8,15}$/)
  phone!: string;
}

