import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../enums/user-role.enum";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly _reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this._reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if(!requiredRoles)
            return true;

        const { user } = context.switchToHttp().getRequest();

        if(!requiredRoles.includes(user.userRole)) 
            throw new ForbiddenException('Need permission to perform this action');

        return true;
    }
}