import { Injectable, Inject, Logger } from '@nestjs/common';
import { Result } from '../common/result';
import { ArticleEntity, ARTICLE_REPOSITORY } from '../../domain';
import type { ArticleRepository } from '../../domain';
import {
  GetArticlesQueryDto,
  GetArticlesResultDto,
  GetArticlesArticleDto,
} from '../dtos/get-articles.dto';

@Injectable()
export class GetArticlesUseCase {
  private readonly logger = new Logger(GetArticlesUseCase.name);

  constructor(
    @Inject(ARTICLE_REPOSITORY)
    private readonly articleRepository: ArticleRepository,
  ) {}

  async execute(
    query: GetArticlesQueryDto,
  ): Promise<Result<GetArticlesResultDto, Error>> {
    try {
      this.logger.log(`Fetching articles with query: ${JSON.stringify(query)}`);

      const { articles, total } = await this.articleRepository.findAll({
        page: query.page,
        limit: query.limit,
        source: query.source,
      });

      const pages = Math.ceil(total / query.limit);

      const result: GetArticlesResultDto = {
        articles: articles.map((article) => this.mapArticleToDto(article)),
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          pages,
        },
      };

      this.logger.log(`Successfully fetched ${articles.length} articles`);

      return Result.ok(result);
    } catch (error) {
      this.logger.error('Failed to fetch articles', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      return Result.fail(
        new Error(`Failed to fetch articles: ${errorMessage}`),
      );
    }
  }

  private mapArticleToDto(article: ArticleEntity): GetArticlesArticleDto {
    return {
      id: article.id,
      title: article.title.value,
      url: article.url.value,
      source: article.source.value,
      publicationDate: article.publicationDate,
    };
  }
}
