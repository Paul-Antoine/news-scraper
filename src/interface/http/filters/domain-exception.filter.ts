import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  DomainError,
  ArticleAlreadyExistsError,
  InvalidArticleDataError,
  ArticleNotFoundError,
  ScrapingFailedError,
} from '../../../domain/errors/domain-errors';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.getHttpStatus(exception);
    const message = exception.message;

    this.logger.error(
      `Domain exception caught: ${exception.constructor.name} - ${message}`,
      exception.stack,
    );

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error: exception.constructor.name,
    };

    response.status(status).json(errorResponse);
  }

  private getHttpStatus(exception: DomainError): number {
    if (exception instanceof ArticleAlreadyExistsError) {
      return HttpStatus.CONFLICT;
    }

    if (exception instanceof InvalidArticleDataError) {
      return HttpStatus.BAD_REQUEST;
    }

    if (exception instanceof ArticleNotFoundError) {
      return HttpStatus.NOT_FOUND;
    }

    if (exception instanceof ScrapingFailedError) {
      return HttpStatus.BAD_GATEWAY;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
