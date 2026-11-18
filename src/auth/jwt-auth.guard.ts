import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { UsuarioAutenticado } from './interfaces/usuario-autenticado.interface.js';

type RequestWithUser = Request & { user?: UsuarioAutenticado };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authorization = request.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Debes enviar un token Bearer válido.');
    }
    const token = authorization.slice('Bearer '.length).trim();
    if (!token) throw new UnauthorizedException('El token Bearer está vacío.');

    try {
      const payload = await this.jwt.verifyAsync<UsuarioAutenticado>(token);
      if (
        !Number.isInteger(payload.sub) ||
        payload.sub <= 0 ||
        typeof payload.email !== 'string' ||
        !['ADMIN', 'CANDIDATO', 'ORGANIZACION'].includes(payload.rol)
      ) {
        throw new UnauthorizedException(
          'El token no contiene una identidad válida.',
        );
      }
      request.user = payload;
      return true;
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('El token es inválido o ha expirado.');
    }
  }
}
