import { Module } from '@nestjs/common';
import { ScrapingController } from './scraping.controller';
import { ScrapingService } from './scraping.service';
import { BbcNewsScraperAdapter } from './adapters/bbc-news-scraper.adapter';
import { NewsScraperPort } from './ports/news-scraper.port';

@Module({
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
