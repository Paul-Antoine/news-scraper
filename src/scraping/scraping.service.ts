import { Injectable, Logger, Inject } from '@nestjs/common';
import { NewsScraperPort } from './ports/news-scraper.port';
import { Article } from './interfaces/article.interface';

export interface ScrapeResult {
  articles: Article[];
  count: number;
  status: 'success' | 'error';
  message?: string;
}

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(
    @Inject(NewsScraperPort) private readonly newsScraper: NewsScraperPort,
  ) {}

  async scrapeNews(): Promise<ScrapeResult> {
    try {
      this.logger.log('Starting news scraping operation');

      const articles = await this.newsScraper.scrapeArticles();

      this.logger.log(
        `News scraping completed successfully. Found ${articles.length} articles`,
      );

      return {
        articles,
        count: articles.length,
        status: 'success',
        message: `Successfully scraped ${articles.length} articles`,
      };
    } catch (error) {
      this.logger.error('News scraping failed', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        articles: [],
        count: 0,
        status: 'error',
        message: `Scraping failed: ${errorMessage}`,
      };
    }
  }
}
