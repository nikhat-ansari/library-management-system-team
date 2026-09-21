import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { SystemHealthService } from '../../modules/system-health/system-health.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly health?: SystemHealthService) {}
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : undefined;
    const message = typeof exceptionResponse === 'string'
      ? exceptionResponse
      : exceptionResponse && typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? (exceptionResponse as { message: unknown }).message
        : 'Internal server error';
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) void this.health?.recordEvent('API_ERROR', 'user-service', status).catch(() => undefined);
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
