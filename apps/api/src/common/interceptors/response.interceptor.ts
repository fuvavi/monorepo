import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, { data: T; success: boolean }> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ data: T; success: boolean }> {
    return next.handle().pipe(
      map((data) => ({ data, success: true })),
    );
  }
}
