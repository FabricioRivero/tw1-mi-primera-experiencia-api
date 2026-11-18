import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { UsuarioAutenticado } from '../auth/interfaces/usuario-autenticado.interface.js';
import { ROLES_KEY, type AppRole } from './roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: UsuarioAutenticado }>();
    if (!request.user) {
      throw new UnauthorizedException('Debes iniciar sesión.');
    }
    if (!roles.includes(request.user.rol)) {
      throw new ForbiddenException('Tu rol no tiene acceso a esta operación.');
    }
    return true;
  }
}
