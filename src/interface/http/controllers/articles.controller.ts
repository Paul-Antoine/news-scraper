import {
  Controller,
  Get,
  Query,
  UseFilters,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { GetArticlesUseCase } from '../../../application/use-cases/get-articles.use-case';
import { GetArticlesQueryDto } from '../dtos/get-articles-query.dto';
import { GetArticlesResponseDto } from '../dtos/article-response.dto';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';

@Controller('articles')
@UseFilters(DomainExceptionFilter)
export class ArticlesController {
  private readonly logger = new Logger(ArticlesController.name);

  constructor(private readonly getArticlesUseCase: GetArticlesUseCase) {}

  @Get()
  async getArticles(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: GetArticlesQueryDto,
  ): Promise<GetArticlesResponseDto> {
    this.logger.log(`GET /articles - Query: ${JSON.stringify(query)}`);

    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '10', 10), 100);

    const useCaseQuery = {
      page,
      limit,
      source: query.source,
    };

    const result = await this.getArticlesUseCase.execute(useCaseQuery);

    return result.match(
      (data) => {
        this.logger.log(
          `Successfully fetched ${data.articles.length} articles`,
        );
        return plainToClass(GetArticlesResponseDto, data, {
          excludeExtraneousValues: true,
        });
      },
      (error) => {
        this.logger.error(`Failed to fetch articles: ${error.message}`);
        throw error;
      },
    );
  }
}
