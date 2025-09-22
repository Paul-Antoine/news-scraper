import { IsOptional, IsNumberString } from 'class-validator';

export class GetArticlesQueryDto {
  @IsOptional()
  @IsNumberString({}, { message: 'Page must be a valid number' })
  page?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'Limit must be a valid number' })
  limit?: string;
}
