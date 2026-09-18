import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes.enum';

export class CustomBaseException extends HttpException {
  public readonly code: ErrorCode;
  public readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    errors?: Record<string, string[]>,
  ) {
    super({ message, code, errors }, statusCode);
    this.code = code;
    this.errors = errors;
  }
}
