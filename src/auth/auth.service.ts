import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegistroCandidatoDto } from './dto/registro-candidato.dto.js';
import { RegistroOrganizacionDto } from './dto/registro-organizacion.dto.js';
import { PasswordService } from './password.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly jwt: JwtService,
  ) {}

  async registrarCandidato(dto: RegistroCandidatoDto) {
    const email = dto.email.trim().toLowerCase();
    const passwordHash = await this.passwords.hash(dto.password);
    try {
      const usuario = await this.prisma.usuario.create({
        data: {
          email,
          passwordHash,
          rol: { connect: { nombre: 'CANDIDATO' } },
          candidato: {
            create: {
              nombres: dto.nombres.trim(),
              apellidos: dto.apellidos.trim(),
            },
          },
        },
        select: {
          id: true,
          email: true,
          rol: { select: { nombre: true } },
          candidato: { select: { nombres: true, apellidos: true } },
        },
      });
      return {
        mensaje: 'Cuenta creada correctamente.',
        usuario: {
          id: usuario.id,
          email: usuario.email,
          rol: usuario.rol.nombre,
          nombres: usuario.candidato?.nombres,
          apellidos: usuario.candidato?.apellidos,
        },
      };
    } catch (error: unknown) {
      if (this.isPrismaCode(error, 'P2002')) {
        throw new ConflictException('Ya existe una cuenta con ese correo.');
      }
      if (this.isPrismaCode(error, 'P2025')) {
        throw new InternalServerErrorException(
          'No se encontró el rol CANDIDATO. Ejecuta el seed de la base de datos.',
        );
      }
      throw error;
    }
  }

  async registrarOrganizacion(dto: RegistroOrganizacionDto) {
    const email = dto.email.trim().toLowerCase();
    const passwordHash = await this.passwords.hash(dto.password);
    try {
      const usuario = await this.prisma.usuario.create({
        data: {
          email,
          passwordHash,
          rol: { connect: { nombre: 'ORGANIZACION' } },
          organizacion: { create: { nombre: dto.nombre.trim() } },
        },
        select: {
          id: true,
          email: true,
          rol: { select: { nombre: true } },
          organizacion: { select: { nombre: true } },
        },
      });
      return {
        mensaje: 'Cuenta creada correctamente.',
        usuario: {
          id: usuario.id,
          email: usuario.email,
          rol: usuario.rol.nombre,
          nombreOrganizacion: usuario.organizacion?.nombre,
        },
      };
    } catch (error: unknown) {
      if (this.isPrismaCode(error, 'P2002')) {
        throw new ConflictException('Ya existe una cuenta con ese correo.');
      }
      if (this.isPrismaCode(error, 'P2025')) {
        throw new InternalServerErrorException(
          'No se encontró el rol ORGANIZACION. Ejecuta el seed de la base de datos.',
        );
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        rol: true,
        candidato: true,
        organizacion: true,
      },
    });
    const valido = usuario
      ? await this.passwords.verify(dto.password, usuario.passwordHash)
      : false;
    if (!usuario || !valido) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    const accessToken = await this.jwt.signAsync({
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol.nombre,
    });
    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      usuario: this.serializarUsuario(usuario),
    };
  }

  async me(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: { rol: true, candidato: true, organizacion: true },
    });
    if (!usuario) {
      throw new UnauthorizedException('La cuenta del token ya no existe.');
    }
    return this.serializarUsuario(usuario);
  }

  private serializarUsuario(usuario: {
    id: number;
    email: string;
    rol: { nombre: string };
    candidato: { nombres: string; apellidos: string } | null;
    organizacion: { nombre: string } | null;
  }) {
    return {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol.nombre,
      ...(usuario.candidato
        ? {
            nombres: usuario.candidato.nombres,
            apellidos: usuario.candidato.apellidos,
          }
        : {}),
      ...(usuario.organizacion
        ? { nombreOrganizacion: usuario.organizacion.nombre }
        : {}),
    };
  }

  private isPrismaCode(error: unknown, code: string): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === code
    );
  }
}
