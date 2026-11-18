import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto.js';
import { ResponderSeleccionDto } from './dto/responder-seleccion.dto.js';

function inicioDelDiaUtc(): Date {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
}

@Injectable()
export class PostulacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(usuarioId: number, ofertaId: number) {
    const candidato = await this.obtenerCandidato(usuarioId);
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const offer = await transaction.oferta.findFirst({
            where: {
              id: ofertaId,
              estado: 'ABIERTA',
              fechaLimite: { gte: inicioDelDiaUtc() },
            },
          });
          if (!offer) {
            throw new NotFoundException(
              'La oferta no existe, está cerrada o venció.',
            );
          }
          const application = await transaction.aplicacion.create({
            data: { candidatoId: candidato.id, ofertaId: offer.id },
            include: {
              oferta: {
                select: {
                  id: true,
                  titulo: true,
                  organizacion: { select: { nombre: true } },
                },
              },
            },
          });
          return this.serializar(application);
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (error: unknown) {
      if (this.isPrismaCode(error, 'P2002')) {
        throw new ConflictException(
          'Ya existe una postulación histórica para este candidato y esta oferta.',
        );
      }
      if (this.isPrismaCode(error, 'P2034')) {
        throw new ConflictException(
          'La oferta cambió en paralelo; vuelve a consultarla e intenta otra vez.',
        );
      }
      throw error;
    }
  }

  async listarMias(usuarioId: number) {
    const candidate = await this.obtenerCandidato(usuarioId);
    const applications = await this.prisma.aplicacion.findMany({
      where: { candidatoId: candidate.id },
      include: {
        oferta: {
          select: {
            id: true,
            titulo: true,
            organizacion: { select: { nombre: true } },
          },
        },
      },
      orderBy: { fechaPostulacion: 'desc' },
    });
    return applications.map((application) => this.serializar(application));
  }

  async listarPorOferta(usuarioId: number, ofertaId: number) {
    const organization = await this.obtenerOrganizacion(usuarioId);
    const offer = await this.prisma.oferta.findFirst({
      where: { id: ofertaId, organizacionId: organization.id },
      select: { id: true },
    });
    if (!offer) {
      throw new NotFoundException(
        'La oferta no existe o no pertenece a esta organización.',
      );
    }
    const applications = await this.prisma.aplicacion.findMany({
      where: { ofertaId: offer.id },
      include: {
        candidato: {
          select: { id: true, nombres: true, apellidos: true },
        },
        oferta: {
          select: {
            id: true,
            titulo: true,
            organizacion: { select: { nombre: true } },
          },
        },
      },
      orderBy: { fechaPostulacion: 'asc' },
    });
    return applications.map((application) =>
      this.serializar(application, true),
    );
  }

  async cambiarEstado(
    usuarioId: number,
    postulacionId: number,
    dto: CambiarEstadoDto,
  ) {
    const organization = await this.obtenerOrganizacion(usuarioId);
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          const current = await transaction.aplicacion.findFirst({
            where: {
              id: postulacionId,
              oferta: { organizacionId: organization.id },
            },
            include: { oferta: true },
          });
          if (!current) {
            throw new NotFoundException(
              'La postulación no existe o no pertenece a esta organización.',
            );
          }
          const allowed =
            (current.estado === 'ENVIADA' &&
              ['EN_REVISION', 'NO_SELECCIONADA'].includes(dto.estado)) ||
            (current.estado === 'EN_REVISION' &&
              ['SELECCIONADA', 'NO_SELECCIONADA'].includes(dto.estado));
          if (!allowed) {
            throw new ConflictException(
              `No se puede cambiar de ${current.estado} a ${dto.estado}.`,
            );
          }

          if (dto.estado === 'SELECCIONADA') {
            const selectedCount = await transaction.aplicacion.count({
              where: {
                ofertaId: current.ofertaId,
                estado: { in: ['SELECCIONADA', 'ACEPTADA'] },
              },
            });
            if (selectedCount >= current.oferta.vacantes) {
              throw new ConflictException(
                'La oferta ya alcanzó el número de vacantes seleccionadas.',
              );
            }
          }

          const updated = await transaction.aplicacion.update({
            where: { id: current.id },
            data: { estado: dto.estado },
            include: {
              candidato: {
                select: { id: true, nombres: true, apellidos: true },
              },
              oferta: {
                select: {
                  id: true,
                  titulo: true,
                  organizacion: { select: { nombre: true } },
                },
              },
            },
          });
          return this.serializar(updated, true);
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (error: unknown) {
      if (this.isPrismaCode(error, 'P2034')) {
        throw new ConflictException(
          'La postulación cambió en paralelo; vuelve a consultar e intenta otra vez.',
        );
      }
      throw error;
    }
  }

  async responderSeleccion(
    usuarioId: number,
    postulacionId: number,
    dto: ResponderSeleccionDto,
  ) {
    const candidate = await this.obtenerCandidato(usuarioId);
    const application = await this.prisma.aplicacion.findFirst({
      where: { id: postulacionId, candidatoId: candidate.id },
    });
    if (!application) {
      throw new NotFoundException(
        'No existe una postulación propia con ese ID.',
      );
    }
    if (application.estado !== 'SELECCIONADA') {
      throw new ConflictException(
        'Solo puedes responder una postulación que esté SELECCIONADA.',
      );
    }
    const changed = await this.prisma.aplicacion.updateMany({
      where: {
        id: application.id,
        candidatoId: candidate.id,
        estado: 'SELECCIONADA',
      },
      data: { estado: dto.respuesta },
    });
    if (changed.count !== 1) {
      throw new ConflictException(
        'La postulación ya recibió una respuesta; vuelve a consultar su estado.',
      );
    }
    const updated = await this.prisma.aplicacion.findUniqueOrThrow({
      where: { id: application.id },
      include: {
        oferta: {
          select: {
            id: true,
            titulo: true,
            organizacion: { select: { nombre: true } },
          },
        },
      },
    });
    return this.serializar(updated);
  }

  async retirar(usuarioId: number, postulacionId: number) {
    const candidate = await this.obtenerCandidato(usuarioId);
    const application = await this.prisma.aplicacion.findFirst({
      where: { id: postulacionId, candidatoId: candidate.id },
    });
    if (!application) {
      throw new NotFoundException(
        'No existe una postulación propia con ese ID.',
      );
    }
    if (!['ENVIADA', 'EN_REVISION'].includes(application.estado)) {
      throw new ConflictException(
        `No se puede retirar una postulación en estado ${application.estado}.`,
      );
    }
    const changed = await this.prisma.aplicacion.updateMany({
      where: {
        id: application.id,
        candidatoId: candidate.id,
        estado: { in: ['ENVIADA', 'EN_REVISION'] },
      },
      data: { estado: 'RETIRADA' },
    });
    if (changed.count !== 1) {
      throw new ConflictException(
        'La postulación cambió de estado; vuelve a consultar e intenta otra vez.',
      );
    }
    const updated = await this.prisma.aplicacion.findUniqueOrThrow({
      where: { id: application.id },
      include: {
        oferta: {
          select: {
            id: true,
            titulo: true,
            organizacion: { select: { nombre: true } },
          },
        },
      },
    });
    return this.serializar(updated);
  }

  private async obtenerCandidato(usuarioId: number) {
    const candidate = await this.prisma.candidato.findUnique({
      where: { usuarioId },
    });
    if (!candidate) {
      throw new NotFoundException('No se encontró el perfil de candidato.');
    }
    return candidate;
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

  private serializar<
    T extends {
      id: number;
      candidatoId: number;
      ofertaId: number;
      estado: string;
      fechaPostulacion: Date;
      oferta: {
        id: number;
        titulo: string;
        organizacion: { nombre: string };
      };
      candidato?: { id: number; nombres: string; apellidos: string };
    },
  >(application: T, includeCandidate = false) {
    return {
      id: application.id,
      ofertaId: application.ofertaId,
      candidatoId: application.candidatoId,
      estado: application.estado,
      fechaPostulacion: application.fechaPostulacion,
      oferta: {
        id: application.oferta.id,
        titulo: application.oferta.titulo,
        organizacion: application.oferta.organizacion.nombre,
      },
      ...(includeCandidate && application.candidato
        ? {
            candidato: {
              id: application.candidato.id,
              nombres: application.candidato.nombres,
              apellidos: application.candidato.apellidos,
            },
          }
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
