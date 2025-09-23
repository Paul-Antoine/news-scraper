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

  async find(options: IPaginationOptions): Promise<GetArticlesResponseDto> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { rows: articles, count: total } =
      await this.articleModel.findAndCountAll({
        where: {
          publicationDate: {
            [Op.gte]: sevenDaysAgo,
            [Op.not]: null,
          },
        },
        limit,
        offset,
        order: [['publicationDate', 'DESC']], // use index idx_articles_publication_date_desc
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
