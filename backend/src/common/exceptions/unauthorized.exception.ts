import { HttpStatus } from '@nestjs/common';
import { CustomBaseException } from './custom-base.exception';
import { ErrorCode } from './error-codes.enum';

export class UnauthorizedCustomException extends CustomBaseException {
  constructor(message = 'Invalid credentials or unauthorized access') {
    super(message, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
  }
}
