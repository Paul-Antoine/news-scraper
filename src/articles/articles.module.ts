import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ArticlesController } from '../interface/http/controllers/articles.controller';
import { GetArticlesUseCase } from '../application/use-cases/get-articles.use-case';
import { ARTICLE_REPOSITORY } from '../domain/repositories/article.repository.interface';
import { SequelizeArticleRepository } from '../infrastructure/repositories/sequelize-article.repository';
import { Article } from '../database/models/article.model';

@Module({
  imports: [SequelizeModule.forFeature([Article])],
  controllers: [ArticlesController],
  providers: [
    GetArticlesUseCase,
    {
      provide: ARTICLE_REPOSITORY,
      useClass: SequelizeArticleRepository,
    },
  ],
  exports: [GetArticlesUseCase, ARTICLE_REPOSITORY],
})
export class ArticlesModule {}
