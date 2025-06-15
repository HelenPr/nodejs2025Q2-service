import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggingService } from './logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, query, body } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const endTime = Date.now();
          const duration = endTime - startTime;

          this.loggingService.log(
            JSON.stringify({
              method,
              url,
              query,
              body,
              statusCode: response.statusCode,
              duration: `${duration}ms`,
            }),
            'Request',
          );
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          this.loggingService.error(
            JSON.stringify({
              method,
              url,
              query,
              body,
              error: error.message,
              duration: `${duration}ms`,
            }),
            error.stack,
            'Request',
          );
        },
      }),
    );
  }
}
