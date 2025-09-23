import { Module } from '@nestjs/common';
import { ScrapingController } from './scraping.controller';
import { ScrapingService } from './scraping.service';
import { BbcScraperService } from './bbc-scraper.service';
import { ArticlesModule } from '../articles/articles.module';

@Module({
  imports: [ArticlesModule],
  controllers: [ScrapingController],
  providers: [ScrapingService, BbcScraperService],
  exports: [ScrapingService],
})
export class ScrapingModule {}
