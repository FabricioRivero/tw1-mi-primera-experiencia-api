import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { ActualizarOfertaDto, CrearOfertaDto } from './dto/crear-oferta.dto.js';
import { ListarOfertasDto } from './dto/listar-ofertas.dto.js';

function inicioDelDiaUtc(): Date {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
}

@Injectable()
export class OfertasService {
  constructor(private readonly prisma: PrismaService) {}

  async listarPublicas(query: ListarOfertasDto) {
    const where = {
      estado: 'ABIERTA' as const,
      fechaLimite: { gte: inicioDelDiaUtc() },
      ...(query.categoriaId ? { categoriaId: query.categoriaId } : {}),
      ...(query.q
        ? {
            OR: [
              { titulo: { contains: query.q, mode: 'insensitive' as const } },
              {
                descripcion: {
                  contains: query.q,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };
    const [offers, total] = await this.prisma.$transaction([
      this.prisma.oferta.findMany({
        where,
        include: {
          categoria: { select: { nombre: true } },
          organizacion: { select: { id: true, nombre: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.size,
        take: query.size,
      }),
      this.prisma.oferta.count({ where }),
    ]);
    return {
      items: offers.map((offer) => this.serializarOferta(offer)),
      page: query.page,
      size: query.size,
      total,
      totalPages: Math.ceil(total / query.size),
    };
  }

  async obtenerPublica(id: number) {
    const offer = await this.prisma.oferta.findFirst({
      where: {
        id,
        estado: 'ABIERTA',
        fechaLimite: { gte: inicioDelDiaUtc() },
      },
      include: {
        categoria: { select: { nombre: true } },
        organizacion: { select: { id: true, nombre: true } },
      },
    });
    if (!offer) {
      throw new NotFoundException(
        'La oferta no existe o ya no está disponible.',
      );
    }
    return this.serializarOferta(offer);
  }

  async listarPropias(usuarioId: number) {
    const organization = await this.obtenerOrganizacion(usuarioId);
    const offers = await this.prisma.oferta.findMany({
      where: { organizacionId: organization.id },
      include: {
        categoria: { select: { nombre: true } },
        organizacion: { select: { id: true, nombre: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return offers.map((offer) => this.serializarOferta(offer));
  }

  async crear(usuarioId: number, dto: CrearOfertaDto) {
    const organization = await this.obtenerOrganizacion(usuarioId);
    this.validarFechaLimite(dto.fechaLimite);
    await this.validarCategoria(dto.categoriaId);
    const offer = await this.prisma.oferta.create({
      data: {
        titulo: dto.titulo.trim(),
        descripcion: dto.descripcion.trim(),
        categoriaId: dto.categoriaId,
        modalidad: dto.modalidad,
        ubicacion: dto.ubicacion.trim(),
        vacantes: dto.vacantes,
        fechaLimite: new Date(dto.fechaLimite),
        organizacionId: organization.id,
      },
      include: {
        categoria: { select: { nombre: true } },
        organizacion: { select: { id: true, nombre: true } },
      },
    });
    return this.serializarOferta(offer);
  }

  async actualizar(usuarioId: number, id: number, dto: ActualizarOfertaDto) {
    if (!Object.values(dto).some((value) => value !== undefined)) {
      throw new BadRequestException('Envía al menos un campo para actualizar.');
    }
    if (dto.fechaLimite !== undefined) this.validarFechaLimite(dto.fechaLimite);
    if (dto.categoriaId !== undefined) {
      await this.validarCategoria(dto.categoriaId);
    }
    const organization = await this.obtenerOrganizacion(usuarioId);
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const offer = await transaction.oferta.findFirst({
            where: { id, organizacionId: organization.id },
          });
          if (!offer) {
            throw new NotFoundException(
              'La oferta no existe o no pertenece a esta organización.',
            );
          }
          if (offer.estado === 'CERRADA') {
            throw new ConflictException(
              'Una oferta cerrada no se puede volver a editar ni abrir.',
            );
          }
          if (dto.vacantes !== undefined) {
            const selectedCount = await transaction.aplicacion.count({
              where: {
                ofertaId: offer.id,
                estado: { in: ['SELECCIONADA', 'ACEPTADA'] },
              },
            });
            if (dto.vacantes < selectedCount) {
              throw new ConflictException(
                'Las vacantes no pueden ser menores que las postulaciones seleccionadas o aceptadas.',
              );
            }
          }

          const updated = await transaction.oferta.update({
            where: { id },
            data: {
              ...(dto.titulo !== undefined
                ? { titulo: dto.titulo.trim() }
                : {}),
              ...(dto.descripcion !== undefined
                ? { descripcion: dto.descripcion.trim() }
                : {}),
              ...(dto.categoriaId !== undefined
                ? { categoriaId: dto.categoriaId }
                : {}),
              ...(dto.modalidad !== undefined
                ? { modalidad: dto.modalidad }
                : {}),
              ...(dto.ubicacion !== undefined
                ? { ubicacion: dto.ubicacion.trim() }
                : {}),
              ...(dto.vacantes !== undefined ? { vacantes: dto.vacantes } : {}),
              ...(dto.fechaLimite !== undefined
                ? { fechaLimite: new Date(dto.fechaLimite) }
                : {}),
              ...(dto.estado !== undefined ? { estado: dto.estado } : {}),
            },
            include: {
              categoria: { select: { nombre: true } },
              organizacion: { select: { id: true, nombre: true } },
            },
          });
          return this.serializarOferta(updated);
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (error: unknown) {
      if (this.isPrismaCode(error, 'P2034')) {
        throw new ConflictException(
          'La oferta o sus postulaciones cambiaron en paralelo; vuelve a consultar e intenta otra vez.',
        );
      }
      if (this.isPrismaCode(error, 'P2003')) {
        throw new BadRequestException('La categoría indicada ya no existe.');
      }
      throw error;
    }
  }

  async eliminar(usuarioId: number, id: number) {
    const offer = await this.obtenerPropia(usuarioId, id);
    const applications = await this.prisma.aplicacion.count({
      where: { ofertaId: offer.id },
    });
    if (applications > 0) {
      throw new ConflictException(
        'No se puede eliminar una oferta que ya tiene postulaciones.',
      );
    }
    try {
      const deleted = await this.prisma.oferta.delete({
        where: { id: offer.id },
      });
      return { mensaje: 'Oferta eliminada.', id: deleted.id };
    } catch (error: unknown) {
      if (this.isPrismaCode(error, 'P2003')) {
        throw new ConflictException(
          'No se puede eliminar una oferta que ya tiene postulaciones.',
        );
      }
      throw error;
    }
  }

  private async obtenerOrganizacion(usuarioId: number) {
    const organization = await this.prisma.organizacion.findUnique({
      where: { usuarioId },
    });
    if (!organization) {
      throw new NotFoundException('No se encontró el perfil de organización.');
    }
    return organization;
  }

  private async obtenerPropia(usuarioId: number, id: number) {
    const offer = await this.prisma.oferta.findFirst({
      where: { id, organizacion: { usuarioId } },
    });
    if (!offer) {
      throw new NotFoundException(
        'La oferta no existe o no pertenece a esta organización.',
      );
    }
    return offer;
  }

  private async validarCategoria(categoriaId: number): Promise<void> {
    const category = await this.prisma.categoria.findUnique({
      where: { id: categoriaId },
      select: { id: true },
    });
    if (!category) throw new BadRequestException('La categoría no existe.');
  }

  private validarFechaLimite(value: string): void {
    const deadline = new Date(value);
    if (Number.isNaN(deadline.getTime()) || deadline < inicioDelDiaUtc()) {
      throw new BadRequestException(
        'La fecha límite debe ser hoy o una fecha posterior.',
      );
    }
  }

  private serializarOferta<
    T extends {
      categoria: { nombre: string };
      organizacion: { id: number; nombre: string };
    },
  >(offer: T) {
    const { categoria, organizacion, ...fields } = offer;
    return {
      ...fields,
      categoria: categoria.nombre,
      organizacionId: organizacion.id,
      organizacion: organizacion.nombre,
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
