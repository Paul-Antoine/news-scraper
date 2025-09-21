export interface GetArticlesQueryDto {
  page: number;
  limit: number;
  source?: string;
}

export interface GetArticlesResultDto {
  articles: GetArticlesArticleDto[];
  pagination: PaginationDto;
}

export interface GetArticlesArticleDto {
  id?: number;
  title: string;
  url: string;
  source: string;
  publicationDate?: Date;
}

export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
