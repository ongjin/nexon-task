import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { getMongoDuplicateKeyMessage } from '../utils/mongo-error.util';

interface ErrorEnvelope {
    code: number;
    message: string;
    timestamp: string;
    path?: string;
    error?: any;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        console.error('🔥 Exception caught:', exception);
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest<Request>();
        let status: number;
        let message: string;
        let error: any = undefined;

        // Mongo Duplicate Key
        if (exception?.code === 11000) {
            status = HttpStatus.CONFLICT;
            message = getMongoDuplicateKeyMessage(exception?.keyValue);
        } else if (exception instanceof HttpException) {
            status = exception.getStatus();
            const resBody = exception.getResponse();
            // HttpException.getResponse()는 string | object
            if (typeof resBody === 'string') {
                message = resBody;
            } else {
                message = (resBody as any).message || (resBody as any).error || '';
                error = resBody;
            }
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            error = exception;
        }

        const responseBody: ErrorEnvelope = {
            code: status,
            message,
            timestamp: new Date().toISOString(),
            path: req.url,
        };
        if (error) responseBody.error = error;

        res.status(status).json(responseBody);
    }
}
