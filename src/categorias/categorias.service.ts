import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { CrearCategoriaDto } from './dto/crear-categoria.dto.js';
import { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto.js';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
  }

  async obtenerPorId(id: number) {
    const categoria = await this.prisma.categoria.findUnique({ where: { id } });
    if (!categoria) throw new NotFoundException('No existe esa categoría.');
    return categoria;
  }

  async crear(datos: CrearCategoriaDto) {
    try {
      return await this.prisma.categoria.create({
        data: { nombre: datos.nombre.trim() },
      });
    } catch (error: unknown) {
      if (this.isPrismaCode(error, 'P2002')) {
        throw new ConflictException('Ya existe una categoría con ese nombre.');
      }
      throw error;
    }
  }

  async actualizar(id: number, datos: ActualizarCategoriaDto) {
    if (datos.nombre === undefined) {
      throw new BadRequestException('Envía al menos un campo para actualizar.');
    }
    try {
      return await this.prisma.categoria.update({
        where: { id },
        data: { nombre: datos.nombre.trim() },
      });
    } catch (error: unknown) {
      this.translateWriteError(error);
      throw error;
    }
  }

  async eliminar(id: number) {
    try {
      return await this.prisma.categoria.delete({ where: { id } });
    } catch (error: unknown) {
      if (this.isPrismaCode(error, 'P2025')) {
        throw new NotFoundException('No existe esa categoría.');
      }
      if (this.isPrismaCode(error, 'P2003')) {
        throw new ConflictException(
          'No se puede eliminar una categoría que está asociada a ofertas.',
        );
      }
      throw error;
    }
  }

  private translateWriteError(error: unknown): void {
    if (this.isPrismaCode(error, 'P2025')) {
      throw new NotFoundException('No existe esa categoría.');
    }
    if (this.isPrismaCode(error, 'P2002')) {
      throw new ConflictException('Ya existe una categoría con ese nombre.');
    }
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
