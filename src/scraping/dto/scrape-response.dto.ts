import { ArticleResponseDto } from '../../articles/dto/article-response.dto';

export class ScrapeResponseDto {
  articles: ArticleResponseDto[];
  count: number;
  saved: number;
  duplicates: number;
  status: 'success' | 'error';
  message?: string;
}
