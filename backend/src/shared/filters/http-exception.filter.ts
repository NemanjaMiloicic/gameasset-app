import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
        exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;

    if (exception instanceof HttpException) {
        const exceptionResponse = exception.getResponse();
        message = typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as any).message;
    } else {
        message = 'Internal server error';
    }

    this.logger.error(`Status ${status} - ${message}`, exception instanceof Error ? exception.stack : undefined);

    response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
    });
  }
}