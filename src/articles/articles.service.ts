import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Article } from '../database/models/article.model';
import { GetArticlesResponse } from './articles.controller';

export interface FindAllOptions {
  page: number;
  limit: number;
  source?: string;
}

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article)
    private readonly articleModel: typeof Article,
  ) {}

  async findAll(options: FindAllOptions): Promise<GetArticlesResponse> {
    const { page, limit, source } = options;
    const offset = (page - 1) * limit;

    const whereClause = source ? { source: { [Op.eq]: source } } : {};

    const { rows: articles, count: total } = await this.articleModel.findAndCountAll({
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
}