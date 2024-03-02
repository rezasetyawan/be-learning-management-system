import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, catchError } from 'rxjs';

@Injectable()
export class GlobalHeaderInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();

    // Set CORS headers
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Origin', '*');
    // Uncomment the following line if you want to allow specific origins based on request headers:
    // response.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    response.setHeader(
      'Access-Control-Allow-Methods',
      'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    );
    response.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
    );

    if (context.switchToHttp().getRequest().method === 'OPTIONS') {
      return response.status(200).end();
    }

    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof HttpException) {
          // Ensure CORS headers are also set for error responses
          response.setHeader('Access-Control-Allow-Credentials', 'true');
          response.setHeader('Access-Control-Allow-Origin', '*');
          response.setHeader(
            'Access-Control-Allow-Methods',
            'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          );
          response.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          );
        }
        throw error;
      }),
    );
  }
}
