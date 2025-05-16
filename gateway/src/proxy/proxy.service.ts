import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import axios from 'axios';

@Injectable()
export class ProxyService {
    constructor(private readonly config: ConfigService) { }

    async forwardRequest(req: Request, res: Response, service: 'auth' | 'event') {
        const baseUrlMap = {
            auth: this.config.get<string>('AUTH_URL'),
            event: this.config.get<string>('EVENT_URL'),
        };

        try {
            const url = `${baseUrlMap[service]}${req.originalUrl}`;

            const filteredHeaders = { ...req.headers };
            delete filteredHeaders['content-length'];
            delete filteredHeaders['host'];

            const result = await axios({
                method: req.method as any,
                url,
                data: req.body,
                headers: filteredHeaders,
                params: req.query,
                timeout: 5000,
            });

            res.status(result.status).send(result.data);
        } catch (err) {
            res.status(err.response?.status || 500).send(err.response?.data || { message: 'Gateway error' });
        }
    }
}
