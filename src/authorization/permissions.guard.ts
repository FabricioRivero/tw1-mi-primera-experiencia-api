import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../database/prisma.service.js';
import type { UsuarioAutenticado } from '../auth/interfaces/usuario-autenticado.interface.js';
import { PERMISSIONS_KEY } from './permissions.decorator.js';

type RequestWithUser = Request & {
  user?: UsuarioAutenticado;
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Obtener los permisos declarados en el método o controlador.
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si el endpoint no declara permisos, este guard no agrega una restricción.
    // La autenticación seguirá siendo responsabilidad de JwtAuthGuard.
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 2. Obtener el usuario autenticado por JwtAuthGuard.
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const userId = request.user?.sub;

    if (!userId || !Number.isInteger(userId)) {
      throw new UnauthorizedException(
        'No se pudo identificar al usuario autenticado.',
      );
    }

    // 3. Consultar los permisos actuales desde la base de datos.
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        rol: {
          select: {
            permisos: {
              select: {
                permiso: {
                  select: {
                    codigo: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.rol) {
      throw new ForbiddenException('El usuario no tiene un rol asignado.');
    }

    // 4. Convertir los permisos obtenidos en un conjunto para consultarlos.
    const grantedPermissions = new Set(
      user.rol.permisos.map((rolPermiso) => rolPermiso.permiso.codigo),
    );

    // 5. Todos los permisos declarados deben estar asignados al usuario.
    const hasAllPermissions = requiredPermissions.every((permission) =>
      grantedPermissions.has(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        'No tienes permisos para realizar esta operación.',
      );
    }

    return true;
  }
}
