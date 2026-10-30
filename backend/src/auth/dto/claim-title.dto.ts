import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ClaimTitleDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;
}
