import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T> {
  data: T;
  message?: string;
  code?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ResponseFormat<T> | T
> {
  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T> | T> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();

    if (
      response.getHeader &&
      response.getHeader('content-type') === 'text/event-stream'
    ) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          Object.keys(data).length <= 3
        ) {
          return data;
        }

        return {
          data: data ?? null,
          code: 'SUCCESS',
        };
      }),
    );
  }
}
