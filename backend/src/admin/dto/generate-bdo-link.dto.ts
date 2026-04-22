import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class GenerateBdoLinkDto {
  @IsString()
  @IsOptional()
  @MaxLength(64)
  bdoId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(64)
  bdo_id?: string;
}
