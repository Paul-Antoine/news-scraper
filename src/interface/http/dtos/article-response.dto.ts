import { Expose } from 'class-transformer';

export class ArticleResponseDto {
  @Expose()
  id?: number;

  @Expose()
  title: string;

  @Expose()
  url: string;

  @Expose()
  source: string;

  @Expose()
  publicationDate?: Date;
}

export class PaginationResponseDto {
  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  total: number;

  @Expose()
  pages: number;
}

export class GetArticlesResponseDto {
  @Expose()
  articles: ArticleResponseDto[];

  @Expose()
  pagination: PaginationResponseDto;
}

export class ScrapeNewsResponseDto {
  @Expose()
  articles: ArticleResponseDto[];

  @Expose()
  count: number;

  @Expose()
  saved: number;

  @Expose()
  duplicates: number;

  @Expose()
  status: 'success' | 'error';

  @Expose()
  message?: string;
}
