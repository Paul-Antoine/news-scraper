import { ArticleEntity } from '../entities/article.entity';

export interface FindArticlesOptions {
  page: number;
  limit: number;
  source?: string;
}

export interface FindArticlesResult {
  articles: ArticleEntity[];
  total: number;
}

export const ARTICLE_REPOSITORY = Symbol('ArticleRepository');

export interface ArticleRepository {
  save(article: ArticleEntity): Promise<ArticleEntity>;
  findByUrl(url: string): Promise<ArticleEntity | null>;
  findAll(options: FindArticlesOptions): Promise<FindArticlesResult>;
  exists(url: string): Promise<boolean>;
}
