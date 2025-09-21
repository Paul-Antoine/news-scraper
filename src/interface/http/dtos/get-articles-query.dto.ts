import { IsOptional, IsNumberString, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetArticlesQueryDto {
  @IsOptional()
  @IsNumberString({}, { message: 'Page must be a valid number' })
  @Transform(({ value }): string => (value as string) || '1')
  page?: string = '1';

  @IsOptional()
  @IsNumberString({}, { message: 'Limit must be a valid number' })
  @Transform(({ value }): string => (value as string) || '10')
  limit?: string = '10';

  @IsOptional()
  @IsString({ message: 'Source must be a string' })
  @Length(1, 100, { message: 'Source must be between 1 and 100 characters' })
  source?: string;
}
