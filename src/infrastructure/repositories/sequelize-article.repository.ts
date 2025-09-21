import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import {
  ArticleRepository,
  ArticleEntity,
  FindArticlesOptions,
  FindArticlesResult,
} from '../../domain';
import { Article as ArticleModel } from '../../database/models/article.model';
import { ArticleMapper } from '../mappers/article.mapper';
import { ArticleAlreadyExistsError } from '../../domain/errors/domain-errors';

@Injectable()
export class SequelizeArticleRepository implements ArticleRepository {
  private readonly logger = new Logger(SequelizeArticleRepository.name);

  constructor(
    @InjectModel(ArticleModel)
    private readonly articleModel: typeof ArticleModel,
  ) {}

  async save(article: ArticleEntity): Promise<ArticleEntity> {
    try {
      const persistenceData = ArticleMapper.toPartialPersistence(article);

      const savedModel = await this.articleModel.create(persistenceData as any);

      this.logger.debug(`Article saved with ID: ${savedModel.id}`);

      return ArticleMapper.toDomain(savedModel);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'name' in error &&
        error.name === 'SequelizeUniqueConstraintError'
      ) {
        throw new ArticleAlreadyExistsError(article.url.value);
      }

      this.logger.error('Failed to save article', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to save article: ${errorMessage}`);
    }
  }

  async findByUrl(url: string): Promise<ArticleEntity | null> {
    try {
      const model = await this.articleModel.findOne({
        where: { url },
      });

      if (!model) {
        return null;
      }

      return ArticleMapper.toDomain(model);
    } catch (error: unknown) {
      this.logger.error(`Failed to find article by URL: ${url}`, error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to find article by URL: ${errorMessage}`);
    }
  }

  async findAll(options: FindArticlesOptions): Promise<FindArticlesResult> {
    try {
      const { page, limit, source } = options;
      const offset = (page - 1) * limit;

      const whereClause = source ? { source: { [Op.eq]: source } } : {};

      const { rows: models, count: total } =
        await this.articleModel.findAndCountAll({
          where: whereClause,
          limit,
          offset,
          order: [['id', 'DESC']],
        });

      const articles = models.map((model) => ArticleMapper.toDomain(model));

      return {
        articles,
        total,
      };
    } catch (error: unknown) {
      this.logger.error('Failed to find articles', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to find articles: ${errorMessage}`);
    }
  }

  async exists(url: string): Promise<boolean> {
    try {
      const count = await this.articleModel.count({
        where: { url },
      });

      return count > 0;
    } catch (error: unknown) {
      this.logger.error(`Failed to check if article exists: ${url}`, error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to check if article exists: ${errorMessage}`);
    }
  }
}
