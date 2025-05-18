import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // 핸들러(@Get, @Post 등)에 붙은 @Roles() 메타 가져오기
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            // @Roles() 데코레이터가 없으면 모든 접근 허용
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        console.log('user', user);

        // user.roles 에서 하나라도 겹치면 true
        return requiredRoles.some((role) => user.roles.includes(role));
    }
}
