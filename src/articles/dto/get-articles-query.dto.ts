import { IsOptional, IsNumberString, IsString, Length } from 'class-validator';

export class GetArticlesQueryDto {
  @IsOptional()
  @IsNumberString({}, { message: 'Page must be a valid number' })
  page?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'Limit must be a valid number' })
  limit?: string;

  @IsOptional()
  @IsString({ message: 'Source must be a string' })
  @Length(1, 100, { message: 'Source must be between 1 and 100 characters' })
  source?: string;
}
