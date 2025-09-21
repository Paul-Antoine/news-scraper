import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ScrapingService } from './scraping.service';
import { ScrapeResponseDto } from './dto/scrape-response.dto';

@Controller('scrape')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async scrapeNews(): Promise<ScrapeResponseDto> {
    return this.scrapingService.scrapeNews();
  }
}
