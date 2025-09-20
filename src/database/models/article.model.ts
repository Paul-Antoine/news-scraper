import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

@Table({
  tableName: 'articles',
  timestamps: false,
})
export class Article extends Model<Article> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.STRING(700),
    allowNull: false,
    unique: true,
  })
  url: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'publication_date',
  })
  publicationDate: Date | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  source: string;
}