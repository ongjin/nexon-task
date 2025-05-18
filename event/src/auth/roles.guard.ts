import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!required) return true;

        const { user } = context.switchToHttp().getRequest();
        return Array.isArray(user?.roles) && required.some(r => user.roles.includes(r));
    }
}
