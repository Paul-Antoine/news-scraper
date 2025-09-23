export interface IArticle {
  id?: number;
  title: string;
  url: string;
  source: string;
  publicationDate?: Date;
}

export interface IPaginationOptions {
  page: number;
  limit: number;
}

export interface IPaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
