export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ArticleAlreadyExistsError extends DomainError {
  constructor(url: string) {
    super(`Article with URL '${url}' already exists`);
  }
}

export class InvalidArticleDataError extends DomainError {
  constructor(field: string, reason: string) {
    super(`Invalid article ${field}: ${reason}`);
  }
}

export class ArticleNotFoundError extends DomainError {
  constructor(identifier: string) {
    super(`Article not found: ${identifier}`);
  }
}

export class ScrapingFailedError extends DomainError {
  constructor(source: string, reason: string) {
    super(`Failed to scrape articles from ${source}: ${reason}`);
  }
}
