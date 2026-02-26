import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { DrizzleQueryError } from 'drizzle-orm';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    // Postgres errors
    if (exception instanceof DrizzleQueryError) {
      const errorCode = (exception.cause as any)?.code;
      
      this.logger.error(
        `Database error: ${errorCode} - ${exception.message}`,
        exception.stack,
      );

      switch (errorCode) {
        case '23505':
          status = HttpStatus.CONFLICT;
          message = 'Resource already exists';
          error = 'Conflict';
          break;

        case '23502':
        case '23503':
        case '23514':
        case '22001':
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid or missing data';
          error = 'Bad Request';
          break;

        case '08006':
        case '08001':
          status = HttpStatus.SERVICE_UNAVAILABLE;
          message = 'Database connection error';
          error = 'Service Unavailable';
          break;
      }
    }

    // Nest HTTP exceptions
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseError = exception.getResponse();

      if (typeof responseError === 'string') {
        message = responseError;
      } else if (typeof responseError === 'object' && responseError !== null) {
        message = (responseError as any).message ?? message;
        error = (responseError as any).error ?? error;
      }
    }

    // Unknown errors
    else {
      this.logger.error('Unhandled exception', (exception as any)?.stack);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
      error,
    });
  }
}