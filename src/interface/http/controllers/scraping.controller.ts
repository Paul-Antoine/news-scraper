import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseFilters,
  Logger,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ScrapeNewsUseCase } from '../../../application/use-cases/scrape-news.use-case';
import { ScrapeNewsResponseDto } from '../dtos/article-response.dto';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';

@Controller('scrape')
@UseFilters(DomainExceptionFilter)
export class ScrapingController {
  private readonly logger = new Logger(ScrapingController.name);

  constructor(private readonly scrapeNewsUseCase: ScrapeNewsUseCase) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async scrapeNews(): Promise<ScrapeNewsResponseDto> {
    this.logger.log('POST /scrape - Starting news scraping');

    const result = await this.scrapeNewsUseCase.execute();

    return result.match(
      (data) => {
        this.logger.log(
          `Scraping completed successfully: ${data.saved} articles saved`,
        );
        return plainToClass(ScrapeNewsResponseDto, data, {
          excludeExtraneousValues: true,
        });
      },
      (error) => {
        this.logger.error(`Scraping failed: ${error.message}`);
        throw error;
      },
    );
  }
}
