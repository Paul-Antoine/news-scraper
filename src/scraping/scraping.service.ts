import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NewsScraperPort } from './ports/news-scraper.port';
import { Article } from './interfaces/article.interface';
import { Article as ArticleModel } from '../database/models/article.model';

export interface ScrapeResult {
  articles: ArticleModel[];
  count: number;
  status: 'success' | 'error';
  message?: string;
  saved: number;
  duplicates: number;
}

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(
    @Inject(NewsScraperPort) private readonly newsScraper: NewsScraperPort,
    @InjectModel(ArticleModel)
    private readonly articleModel: typeof ArticleModel,
  ) {}

  async scrapeNews(): Promise<ScrapeResult> {
    try {
      this.logger.log('Starting news scraping operation');

      const scrapedArticles = await this.newsScraper.scrapeArticles();
      this.logger.log(`Scraping completed. Found ${scrapedArticles.length} articles`);

      let savedCount = 0;
      let duplicatesCount = 0;
      const savedArticles: ArticleModel[] = [];

      for (const article of scrapedArticles) {
        try {
          const savedArticle = await this.articleModel.create({
            title: article.title,
            url: article.url,
            publicationDate: article.publicationDate || null,
            source: article.source,
          } as any);
          savedArticles.push(savedArticle);
          savedCount++;
          this.logger.debug(`Article saved: ${article.title}`);
        } catch (error) {
          if (error.name === 'SequelizeUniqueConstraintError') {
            duplicatesCount++;
            this.logger.debug(`Duplicate article skipped: ${article.title}`);
          } else {
            this.logger.error(`Failed to save article: ${article.title}`, error);
            throw error;
          }
        }
      }

      this.logger.log(
        `News scraping completed. Saved: ${savedCount}, Duplicates: ${duplicatesCount}`,
      );

      return {
        articles: savedArticles,
        count: scrapedArticles.length,
        saved: savedCount,
        duplicates: duplicatesCount,
        status: 'success',
        message: `Successfully scraped ${scrapedArticles.length} articles. Saved: ${savedCount}, Duplicates: ${duplicatesCount}`,
      };
    } catch (error) {
      this.logger.error('News scraping failed', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        articles: [],
        count: 0,
        saved: 0,
        duplicates: 0,
        status: 'error',
        message: `Scraping failed: ${errorMessage}`,
      };
    }
  }
}
