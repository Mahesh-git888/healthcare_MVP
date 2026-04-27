import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class PhoneLoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10}$/)
  phone!: string;
}
