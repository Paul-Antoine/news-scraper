export class ArticleResponseDto {
  id: number;
  title: string;
  url: string;
  source: string;
  publicationDate?: Date | null;
}

export class PaginationResponseDto {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export class GetArticlesResponseDto {
  articles: ArticleResponseDto[];
  pagination: PaginationResponseDto;
}
