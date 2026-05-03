import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

// ─── JWT Guard ───────────────────────────────────────────────────────────────
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// ─── Roles Decorator ─────────────────────────────────────────────────────────
import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// ─── Roles Guard ─────────────────────────────────────────────────────────────
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('No autenticado');
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(`Acceso denegado. Roles requeridos: ${requiredRoles.join(', ')}`);
    }
    return true;
  }
}

// ─── CurrentUser Decorator ────────────────────────────────────────────────────
import { createParamDecorator } from '@nestjs/common';
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
