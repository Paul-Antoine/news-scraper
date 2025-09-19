import { Article } from '../interfaces/article.interface';

export const NewsScraperPort = Symbol('NewsScraperPort');

export interface NewsScraperPort {
  scrapeArticles(): Promise<Article[]>;
}
