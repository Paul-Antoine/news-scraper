import { Injectable, Inject, Logger } from '@nestjs/common';
import { Result } from '../common/result';
import { ArticleEntity, ARTICLE_REPOSITORY } from '../../domain';
import type { ArticleRepository } from '../../domain';
import { NewsScraperPort } from '../../scraping/ports/news-scraper.port';
import { ScrapeNewsResultDto, ArticleDto } from '../dtos/scrape-news.dto';
import {
  ArticleAlreadyExistsError,
  ScrapingFailedError,
} from '../../domain/errors/domain-errors';

@Injectable()
export class ScrapeNewsUseCase {
  private readonly logger = new Logger(ScrapeNewsUseCase.name);

  constructor(
    @Inject(ARTICLE_REPOSITORY)
    private readonly articleRepository: ArticleRepository,
    @Inject(NewsScraperPort)
    private readonly newsScraper: NewsScraperPort,
  ) {}

  async execute(): Promise<Result<ScrapeNewsResultDto, Error>> {
    try {
      this.logger.log('Starting news scraping operation');

      const scrapedArticles = await this.newsScraper.scrapeArticles();
      this.logger.log(
        `Scraping completed. Found ${scrapedArticles.length} articles`,
      );

      let savedCount = 0;
      let duplicatesCount = 0;
      const savedArticles: ArticleEntity[] = [];

      for (const scrapedArticle of scrapedArticles) {
        try {
          const articleEntity = ArticleEntity.createFromScraping(
            scrapedArticle.title,
            scrapedArticle.url,
            scrapedArticle.source,
            scrapedArticle.publicationDate,
          );

          const exists = await this.articleRepository.exists(
            articleEntity.url.value,
          );
          if (exists) {
            duplicatesCount++;
            this.logger.debug(
              `Duplicate article skipped: ${articleEntity.title.value}`,
            );
            continue;
          }

          const savedArticle = await this.articleRepository.save(articleEntity);
          savedArticles.push(savedArticle);
          savedCount++;
          this.logger.debug(`Article saved: ${articleEntity.title.value}`);
        } catch (error) {
          if (error instanceof ArticleAlreadyExistsError) {
            duplicatesCount++;
            this.logger.debug(
              `Duplicate article skipped: ${scrapedArticle.title}`,
            );
          } else {
            this.logger.error(
              `Failed to save article: ${scrapedArticle.title}`,
              error,
            );
            throw error;
          }
        }
      }

      this.logger.log(
        `News scraping completed. Saved: ${savedCount}, Duplicates: ${duplicatesCount}`,
      );

      const result: ScrapeNewsResultDto = {
        articles: savedArticles.map((article) => this.mapArticleToDto(article)),
        count: scrapedArticles.length,
        saved: savedCount,
        duplicates: duplicatesCount,
        status: 'success',
        message: `Successfully scraped ${scrapedArticles.length} articles. Saved: ${savedCount}, Duplicates: ${duplicatesCount}`,
      };

      return Result.ok(result);
    } catch (error) {
      this.logger.error('News scraping failed', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const scrapingError = new ScrapingFailedError('BBC News', errorMessage);

      return Result.fail(scrapingError);
    }
  }

  private mapArticleToDto(article: ArticleEntity): ArticleDto {
    return {
      id: article.id,
      title: article.title.value,
      url: article.url.value,
      source: article.source.value,
      publicationDate: article.publicationDate,
    };
  }
}
