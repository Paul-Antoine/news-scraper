import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ScrapingController } from '../interface/http/controllers/scraping.controller';
import { ScrapeNewsUseCase } from '../application/use-cases/scrape-news.use-case';
import { BbcNewsScraperAdapter } from './adapters/bbc-news-scraper.adapter';
import { NewsScraperPort } from './ports/news-scraper.port';
import { ARTICLE_REPOSITORY } from '../domain/repositories/article.repository.interface';
import { SequelizeArticleRepository } from '../infrastructure/repositories/sequelize-article.repository';
import { Article } from '../database/models/article.model';

@Module({
  imports: [SequelizeModule.forFeature([Article])],
  controllers: [ScrapingController],
  providers: [
    ScrapeNewsUseCase,
    {
      provide: NewsScraperPort,
      useClass: BbcNewsScraperAdapter,
    },
    {
      provide: ARTICLE_REPOSITORY,
      useClass: SequelizeArticleRepository,
    },
  ],
  exports: [ScrapeNewsUseCase, ARTICLE_REPOSITORY],
})
export class ScrapingModule {}
