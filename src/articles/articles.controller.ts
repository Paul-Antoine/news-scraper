import { Controller, Get, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { GetArticlesQueryDto } from './dto/get-articles-query.dto';
import { GetArticlesResponseDto } from './dto/article-response.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  async getArticles(
    @Query() query: GetArticlesQueryDto,
  ): Promise<GetArticlesResponseDto> {
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '10', 10), 100);

    return this.articlesService.find({ page, limit });
  }
}
