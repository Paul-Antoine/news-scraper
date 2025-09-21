import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Article } from '../database/models/article.model';
import { GetArticlesResponseDto, ArticleResponseDto } from './dto/article-response.dto';
import { IPaginationOptions } from '../common/interfaces/article.interface';

interface CreateArticleData {
  title: string;
  url: string;
  source: string;
  publicationDate?: Date | null;
}

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article)
    private readonly articleModel: typeof Article,
  ) {}

  async findAll(options: IPaginationOptions): Promise<GetArticlesResponseDto> {
    const { page, limit, source } = options;
    const offset = (page - 1) * limit;

    const whereClause = source ? { source: { [Op.eq]: source } } : {};

    const { rows: articles, count: total } =
      await this.articleModel.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['id', 'DESC']],
      });

    const pages = Math.ceil(total / limit);

    return {
      articles,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  async create(articleData: CreateArticleData): Promise<ArticleResponseDto> {
    const article = await this.articleModel.create(articleData as any);
    return article.toJSON();
  }
}
