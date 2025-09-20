import { Controller, Get, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from '../database/models/article.model';

export interface GetArticlesQuery {
  page?: string;
  limit?: string;
  source?: string;
}

export interface GetArticlesResponse {
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  async getArticles(@Query() query: GetArticlesQuery): Promise<GetArticlesResponse> {
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '10', 10), 100);
    const source = query.source;

    return this.articlesService.findAll({ page, limit, source });
  }
}