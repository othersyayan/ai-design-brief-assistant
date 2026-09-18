import { HttpStatus } from '@nestjs/common';
import { CustomBaseException } from './custom-base.exception';
import { ErrorCode } from './error-codes.enum';

export class BadRequestCustomException extends CustomBaseException {
  constructor(message = 'Bad request', errors?: Record<string, string[]>) {
    super(message, HttpStatus.BAD_REQUEST, ErrorCode.BAD_REQUEST, errors);
  }
}
