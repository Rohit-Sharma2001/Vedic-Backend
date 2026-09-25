import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  @Injectable()
  export class Base64Interceptor implements NestInterceptor {
    // Encode data to Base64 (for responses)
    private encode(data: any): string {
      // If controller already handled the response (e.g., redirect), data may be undefined
      if (data === undefined || data === null) {
        return JSON.stringify({ status: true });
      }
      const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
      return Buffer.from(jsonString).toString('base64');
    }
  
    // Decode data from Base64 (for requests)
    private decode(data: string): any {
      const jsonString = Buffer.from(data, 'base64').toString('utf-8');
      return JSON.parse(jsonString);
    }
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
  
      // Decode the request body if it's a Base64-encoded string
      if (request.body && typeof request.body === 'string') {
        try {
          request.body = this.decode(request.body);
        } catch (error) {
          console.error('Failed to decode Base64 request data:', error.message);
        }
      }
  
      // Intercept and encode the response data
      return next.handle().pipe(
        map(data => this.encode(data)),
      );
    }
  }
  