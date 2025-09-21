export interface ScrapeNewsResultDto {
  articles: ArticleDto[];
  count: number;
  saved: number;
  duplicates: number;
  status: 'success' | 'error';
  message?: string;
}

export interface ArticleDto {
  id?: number;
  title: string;
  url: string;
  source: string;
  publicationDate?: Date;
}
