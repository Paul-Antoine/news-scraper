import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Article } from './models/article.model';

@Module({
  imports: [SequelizeModule.forFeature([Article])],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
