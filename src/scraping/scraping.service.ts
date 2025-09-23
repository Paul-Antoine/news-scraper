import { Injectable, Logger } from '@nestjs/common';
import { ArticlesService } from '../articles/articles.service';
import { BbcScraperService } from './bbc-scraper.service';
import { ScrapeResponseDto } from './dto/scrape-response.dto';
import { ArticleResponseDto } from '../articles/dto/article-response.dto';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(
    private readonly bbcScraper: BbcScraperService,
    private readonly articlesService: ArticlesService,
  ) {}

  async scrapeNews(): Promise<ScrapeResponseDto> {
    try {
      this.logger.log('Starting news scraping operation');

      const scrapedArticles = await this.bbcScraper.scrapeArticles();
      this.logger.log(
        `Scraping completed. Found ${scrapedArticles.length} articles`,
      );

      if (scrapedArticles.length === 0) {
        return {
          articles: [],
          count: 0,
          saved: 0,
          duplicates: 0,
          status: 'success',
          message: 'No new articles found',
        };
      }

      let savedCount = 0;
      let duplicatesCount = 0;
      const savedArticles: ArticleResponseDto[] = [];

      for (const article of scrapedArticles) {
        try {
          const articleData = {
            title: article.title,
            url: article.url,
            publicationDate: article.publicationDate || null,
            source: article.source,
          };
          const savedArticle = await this.articlesService.create(articleData);
          savedArticles.push(savedArticle);
          savedCount++;
        } catch (error) {
          if ((error as Error).name === 'SequelizeUniqueConstraintError') {
            duplicatesCount++;
          } else {
            this.logger.error(
              `Failed to save article: ${article.title}`,
              error,
            );
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
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

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
