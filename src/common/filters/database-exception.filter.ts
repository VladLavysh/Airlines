import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { DatabaseError } from 'pg';

@Catch(DatabaseError)
export class PostgresExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PostgresExceptionFilter.name);

  catch(exception: DatabaseError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    this.logger.error(`Database error caught: ${exception.code} - ${exception.message}`);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    switch (exception.code) {
      case '23505': // unique_violation
        status = HttpStatus.CONFLICT;
        message = 'Resource already exists';
        error = 'Conflict';
        break;
      case '23502': // not_null_violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Missing required field';
        error = 'Bad Request';
        break;
      case '23503': // foreign_key_violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Referenced resource does not exist';
        error = 'Bad Request';
        break;
      case '23514': // check_violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid data provided';
        error = 'Bad Request';
        break;
      case '22001': // string_data_right_truncation
        status = HttpStatus.BAD_REQUEST;
        message = 'Data too long for field';
        error = 'Bad Request';
        break;
      case '08006': // connection_failure
      case '08001': // sqlclient_unable_to_establish_sqlconnection
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Database connection error';
        error = 'Service Unavailable';
        break;
      default:
        this.logger.error(`Unhandled database error: ${exception.code}`, exception.stack);
        break;
    }

    response
      .status(status)
      .json({
        statusCode: status,
        error,
        message,
        timestamp: new Date().toISOString(),
      });
  }
}