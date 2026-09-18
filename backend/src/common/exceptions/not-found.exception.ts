import { HttpStatus } from '@nestjs/common';
import { CustomBaseException } from './custom-base.exception';
import { ErrorCode } from './error-codes.enum';

export class NotFoundCustomException extends CustomBaseException {
  constructor(message = 'Resource not found') {
    super(message, HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
  }
}
