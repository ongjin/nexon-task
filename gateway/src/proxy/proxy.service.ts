import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import axios from 'axios';

// 서비스 키 타입 정의
export type ServiceKey =
    | 'auth'
    | 'event'
    | 'reward'
    | 'reward-request'
    | 'inventory';

@Injectable()
export class ProxyService {
    constructor(private readonly config: ConfigService) { }

    /**
     * Gateway에서 각 마이크로서비스로 요청을 포워딩합니다.
     * - 'auth', 'event', 'reward', 'reward-request', 'inventory' 서비스 지원
     * - admin/reward-requests 경로는 '/admin'을 제거하여 실제 서비스 경로에 매핑
     */
    async forwardRequest(
        req: Request,
        res: Response,
        service: ServiceKey,
    ): Promise<void> {
        // 서비스별 베이스 URL 매핑
        const baseUrlMap: Record<ServiceKey, string> = {
            auth: this.config.get<string>('AUTH_URL')!,
            event: this.config.get<string>('EVENT_URL')!,
            reward: this.config.get<string>('EVENT_URL')!,
            'reward-request': this.config.get<string>('EVENT_URL')!,
            inventory: this.config.get<string>('EVENT_URL')!,
        };

        // 요청 경로 리라이트 (admin prefix 제거)
        let path = req.originalUrl;
        if (service === 'reward-request') {
            // Admin 전용 경로 '/admin/reward-requests'는 '/reward-requests'로 매핑
            path = path.replace(/^\/admin/, '');
        }

        try {
            const url = `${baseUrlMap[service]}${path}`;

            // 호스트, Content-Length 헤더 제거
            const filteredHeaders = { ...req.headers } as Record<string, any>;
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
        } catch (err: any) {
            const status = err.response?.status || 500;
            const data = err.response?.data || { message: 'Gateway error' };
            res.status(status).send(data);
        }
    }
}
