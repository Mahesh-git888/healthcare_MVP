import { IsNotEmpty, IsString } from 'class-validator';

export class AccessLinkLoginDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

