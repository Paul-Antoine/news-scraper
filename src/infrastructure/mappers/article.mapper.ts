import { Logger } from '@nestjs/common';
import { ArticleEntity, Title, Url, Source } from '../../domain';
import { Article as ArticleModel } from '../../database/models/article.model';

export class ArticleMapper {
  private static readonly logger = new Logger(ArticleMapper.name);

  public static toDomain(model: ArticleModel): ArticleEntity {
    try {
      const cleanTitle = this.sanitizeTitle(model.title);
      const cleanUrl = this.sanitizeUrl(model.url);
      const cleanSource = this.sanitizeSource(model.source);

      return ArticleEntity.create({
        id: model.id,
        title: Title.create(cleanTitle),
        url: Url.create(cleanUrl),
        source: Source.create(cleanSource),
        publicationDate: model.publicationDate || undefined,
      });
    } catch (error) {
      this.logger.error('Error mapping article to domain:', {
        id: model.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return ArticleEntity.create({
        id: model.id,
        title: Title.create('Invalid Article'),
        url: Url.create('https://example.com/invalid-url'),
        source: Source.create('Invalid Source'),
        publicationDate: undefined,
      });
    }
  }

  private static sanitizeTitle(title: string | null | undefined): string {
    if (!title || typeof title !== 'string') {
      return 'Untitled Article';
    }
    const cleaned = title.trim();
    return cleaned.length === 0 ? 'Untitled Article' : cleaned;
  }

  private static sanitizeUrl(url: string | null | undefined): string {
    if (!url || typeof url !== 'string') {
      return 'https://example.com/invalid-url';
    }
    const cleaned = url.trim();
    if (cleaned.length === 0) {
      return 'https://example.com/invalid-url';
    }
    // Vérifier si c'est une URL valide
    try {
      new URL(cleaned);
      return cleaned;
    } catch {
      // Si ce n'est pas une URL complète, essayer de la préfixer
      if (cleaned.startsWith('/')) {
        return `https://www.bbc.com${cleaned}`;
      }
      return 'https://example.com/invalid-url';
    }
  }

  private static sanitizeSource(source: string | null | undefined): string {
    if (!source || typeof source !== 'string') {
      return 'Unknown Source';
    }
    const cleaned = source.trim();
    return cleaned.length === 0 ? 'Unknown Source' : cleaned;
  }

  public static toPersistence(entity: ArticleEntity): Partial<ArticleModel> {
    return {
      id: entity.id,
      title: entity.title.value,
      url: entity.url.value,
      source: entity.source.value,
      publicationDate: entity.publicationDate || null,
    };
  }

  public static toPartialPersistence(entity: ArticleEntity) {
    return {
      title: entity.title.value,
      url: entity.url.value,
      source: entity.source.value,
      publicationDate: entity.publicationDate || null,
    };
  }
}
