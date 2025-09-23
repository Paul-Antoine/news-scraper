import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScrapingModule } from './scraping/scraping.module';
import { ArticlesModule } from './articles/articles.module';
import { DatabaseModule } from './database/database.module';
import { Article } from './database/models/article.model';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || 'news_scraper_user',
      password: process.env.DB_PASSWORD || 'change_this_password_in_production',
      database: process.env.DB_NAME || 'news_scraper',
      models: [Article],
      autoLoadModels: false,
      synchronize: false,
      logging: process.env.DB_LOGGING === 'true',
    }),
    DatabaseModule,
    ScrapingModule,
    ArticlesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
