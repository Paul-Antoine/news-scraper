import { Url } from '../value-objects/url.vo';
import { Title } from '../value-objects/title.vo';
import { Source } from '../value-objects/source.vo';

export interface ArticleProps {
  id?: number;
  title: Title;
  url: Url;
  source: Source;
  publicationDate?: Date;
}

export class ArticleEntity {
  private readonly _id?: number;
  private readonly _title: Title;
  private readonly _url: Url;
  private readonly _source: Source;
  private readonly _publicationDate?: Date;

  private constructor(props: ArticleProps) {
    this._id = props.id;
    this._title = props.title;
    this._url = props.url;
    this._source = props.source;
    this._publicationDate = props.publicationDate;
  }

  public static create(props: ArticleProps): ArticleEntity {
    return new ArticleEntity(props);
  }

  public static createFromScraping(
    title: string,
    url: string,
    source: string,
    publicationDate?: Date,
  ): ArticleEntity {
    return new ArticleEntity({
      title: Title.create(title),
      url: Url.create(url),
      source: Source.create(source),
      publicationDate,
    });
  }

  public get id(): number | undefined {
    return this._id;
  }

  public get title(): Title {
    return this._title;
  }

  public get url(): Url {
    return this._url;
  }

  public get source(): Source {
    return this._source;
  }

  public get publicationDate(): Date | undefined {
    return this._publicationDate;
  }

  public equals(other: ArticleEntity): boolean {
    return this._url.equals(other._url);
  }

  public toPlainObject() {
    return {
      id: this._id,
      title: this._title.value,
      url: this._url.value,
      source: this._source.value,
      publicationDate: this._publicationDate,
    };
  }
}
