import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as winston from 'winston';
import * as chalk from 'chalk';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize({ all: true }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level}: ${message}`;
        }),
    ),
    transports: [new winston.transports.Console()],
});

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, ip, headers, body } = req;
        const userAgent = headers['user-agent'] || '';
        const start = Date.now();

        res.on('finish', () => {
            const { statusCode } = res;
            const duration = Date.now() - start;

            const logMessage = [
                chalk.bold(`${method} ${originalUrl}`),
                chalk.gray(`Status: ${statusCode}`),
                chalk.gray(`Duration: ${duration}ms`),
                chalk.gray(`IP: ${ip}`),
                chalk.gray(`User-Agent: ${userAgent}`),
            ].join(' | ');

            logger.info(logMessage);
        });

        next();
    }
}
