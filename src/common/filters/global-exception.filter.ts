import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = this.getErrorDetails(exception);

    this.logger.error(`${request.method} ${request.url} - ${status}: ${message}`);

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getErrorDetails(exception: unknown) {
    if (exception instanceof HttpException) {
      return {
        status: exception.getStatus(),
        message: exception.message,
      };
    }

    if (exception instanceof Error) {
      const errorMessage = exception.message;

      if (errorMessage.includes('SequelizeUniqueConstraintError')) {
        return { status: HttpStatus.CONFLICT, message: 'Resource already exists' };
      }

      if (errorMessage.includes('Failed to scrape')) {
        return { status: HttpStatus.BAD_GATEWAY, message: 'Scraping service unavailable' };
      }

      return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: errorMessage };
    }

    return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error' };
  }
}
