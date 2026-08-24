import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTitleDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string | null;
}
