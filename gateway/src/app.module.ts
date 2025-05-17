import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ProxyModule } from './proxy/proxy.module';
import { JwtStrategy } from './auth/jwt.strategy';
import { AuthController } from './controllers/auth.controller';
import { EventController } from './controllers/event.controller';
import { APP_GUARD } from '@nestjs/core';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { RewardController } from './controllers/reward.controller';
import { AdminRewardRequestController } from './controllers/admin-reward-request.controller';
import { InventoryController } from './controllers/inventory.controller';
import { RewardRequestController } from './controllers/reward-request.controller';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }), // ✅ .env 자동 로드
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get('JWT_SECRET'),
                signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') },
            }),
        }),
        ProxyModule,
    ],
    controllers: [AuthController, EventController, RewardController, AdminRewardRequestController, InventoryController, RewardRequestController],
    providers: [
        JwtStrategy,
    ],
})

export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware)
            .forRoutes('*')
    }
}

