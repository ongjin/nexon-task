import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';

@Module({
    providers: [ProxyService],
    exports: [ProxyService], // 다른 모듈에서도 사용할 수 있도록 export
})
export class ProxyModule { }
