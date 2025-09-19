import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ScrapingService, ScrapeResult } from './scraping.service';

@Controller('scrape')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async scrapeNews(): Promise<ScrapeResult> {
    return this.scrapingService.scrapeNews();
  }
}
