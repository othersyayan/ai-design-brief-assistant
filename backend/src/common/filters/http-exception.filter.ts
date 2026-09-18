import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CustomBaseException } from '../exceptions/custom-base.exception';
import { ErrorCode } from '../exceptions/error-codes.enum';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  public catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR;
    let errors: Record<string, string[]> | undefined = undefined;

    if (exception instanceof CustomBaseException) {
      statusCode = exception.getStatus();
      message = exception.message;
      code = exception.code;
      errors = exception.errors;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse() as any;

      message =
        typeof res === 'string' ? res : res.message || exception.message;
      code = res.code || ErrorCode.BAD_REQUEST;

      if (Array.isArray(res.message)) {
        message = 'Validation failed';
        code = ErrorCode.VALIDATION_ERROR;
        errors = { validation: res.message };
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    }

    this.logger.warn(
      `[${request.method}] ${request.url} - Status: ${statusCode} - ErrorCode: ${code}`,
    );

    reply.status(statusCode).send({
      message,
      code,
      ...(errors && { errors }),
    });
  }
}
