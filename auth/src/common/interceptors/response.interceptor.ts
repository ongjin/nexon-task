// src/common/interceptors/response.interceptor.ts
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface ResponseEnvelope<T> {
    code: number;
    message: string;
    data: T;
    timestamp: string;
    path?: string;
}

@Injectable()
export class ResponseInterceptor<T>
    implements NestInterceptor<T, ResponseEnvelope<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<ResponseEnvelope<T>> {
        const ctx = context.switchToHttp();
        const req = ctx.getRequest<Request>();

        return next.handle().pipe(
            map((data) => ({
                code: 200,
                message: 'SUCCESS',
                data,
                timestamp: new Date().toISOString(),
                path: req.url,
            })),
        );
    }
}
