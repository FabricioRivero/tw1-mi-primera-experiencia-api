import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EstadoOferta,
  EstadoPostulacion,
  Modalidad,
} from '../../generated/prisma/enums.js';

export class UsuarioRespuestaDto {
  @ApiProperty({ example: 12 })
  id!: number;

  @ApiProperty({ example: 'ana@ejemplo.com' })
  email!: string;

  @ApiProperty({ enum: ['ADMIN', 'CANDIDATO', 'ORGANIZACION'] })
  rol!: string;

  @ApiPropertyOptional({ example: 'Ana María' })
  nombres?: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  apellidos?: string;

  @ApiPropertyOptional({ example: 'Empresa Ejemplo S.R.L.' })
  nombreOrganizacion?: string;
}

export class LoginRespuestaDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token!: string;

  @ApiProperty({ example: 'Bearer' })
  token_type!: string;

  @ApiProperty({ example: 3600 })
  expires_in!: number;

  @ApiProperty({ type: UsuarioRespuestaDto })
  usuario!: UsuarioRespuestaDto;
}

export class CategoriaRespuestaDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Tecnología' })
  nombre!: string;

  @ApiProperty({ example: '2026-01-10T12:00:00.000Z' })
  createdAt!: string;
}

export class OfertaRespuestaDto {
  @ApiProperty({ example: 5 })
  id!: number;

  @ApiProperty({ example: 'Pasante de desarrollo backend' })
  titulo!: string;

  @ApiProperty({
    example: 'Apoyar al equipo en el desarrollo de servicios web.',
  })
  descripcion!: string;

  @ApiProperty({ example: 1 })
  categoriaId!: number;

  @ApiProperty({ example: 'Tecnología' })
  categoria!: string;

  @ApiProperty({ enum: Modalidad, example: Modalidad.HIBRIDA })
  modalidad!: Modalidad;

  @ApiProperty({ example: 'La Paz' })
  ubicacion!: string;

  @ApiProperty({ example: 2 })
  vacantes!: number;

  @ApiProperty({ example: '2026-12-15T00:00:00.000Z' })
  fechaLimite!: string;

  @ApiProperty({ enum: EstadoOferta, example: EstadoOferta.ABIERTA })
  estado!: EstadoOferta;

  @ApiProperty({ example: 9 })
  organizacionId!: number;

  @ApiProperty({ example: 'Empresa Ejemplo S.R.L.' })
  organizacion!: string;

  @ApiProperty({ example: '2026-10-10T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-10T12:00:00.000Z' })
  updatedAt!: string;
}

export class OfertaResumenRespuestaDto {
  @ApiProperty({ example: 5 })
  id!: number;

  @ApiProperty({ example: 'Pasante de desarrollo backend' })
  titulo!: string;

  @ApiProperty({ example: 'Empresa Ejemplo S.R.L.' })
  organizacion!: string;
}

export class CandidatoResumenRespuestaDto {
  @ApiProperty({ example: 7 })
  id!: number;

  @ApiProperty({ example: 'Ana María' })
  nombres!: string;

  @ApiProperty({ example: 'Pérez Gómez' })
  apellidos!: string;
}

export class PostulacionRespuestaDto {
  @ApiProperty({ example: 21 })
  id!: number;

  @ApiProperty({ example: 5 })
  ofertaId!: number;

  @ApiProperty({ example: 7 })
  candidatoId!: number;

  @ApiProperty({ enum: EstadoPostulacion, example: EstadoPostulacion.ENVIADA })
  estado!: EstadoPostulacion;

  @ApiProperty({ example: '2026-10-10T12:00:00.000Z' })
  fechaPostulacion!: string;

  @ApiProperty({ type: OfertaResumenRespuestaDto })
  oferta!: OfertaResumenRespuestaDto;

  @ApiPropertyOptional({ type: CandidatoResumenRespuestaDto })
  candidato?: CandidatoResumenRespuestaDto;
}
