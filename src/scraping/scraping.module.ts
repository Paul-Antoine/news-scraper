import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ScrapingController } from './scraping.controller';
import { ScrapingService } from './scraping.service';
import { BbcNewsScraperAdapter } from './adapters/bbc-news-scraper.adapter';
import { NewsScraperPort } from './ports/news-scraper.port';
import { Article } from '../database/models/article.model';

@Module({
  imports: [SequelizeModule.forFeature([Article])],
  controllers: [ScrapingController],
  providers: [
    ScrapingService,
    {
      provide: NewsScraperPort,
      useClass: BbcNewsScraperAdapter,
    },
  ],
  exports: [ScrapingService],
})
export class ScrapingModule {}
