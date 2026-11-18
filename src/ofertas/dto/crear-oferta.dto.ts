import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Matches,
  Min,
  MinLength,
} from 'class-validator';
import { EstadoOferta, Modalidad } from '../../generated/prisma/enums.js';

export class CrearOfertaDto {
  @ApiProperty({
    example: 'Pasante de desarrollo backend',
    minLength: 3,
    maxLength: 120,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  titulo!: string;

  @ApiProperty({
    example: 'Apoyar al equipo en el desarrollo de servicios web.',
    minLength: 10,
    maxLength: 2000,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  descripcion!: string;

  @ApiProperty({
    example: 1,
    minimum: 1,
    description: 'ID existente de GET /api/v1/categorias.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoriaId!: number;

  @ApiProperty({ enum: Modalidad, example: Modalidad.HIBRIDA })
  @IsEnum(Modalidad)
  modalidad!: Modalidad;

  @ApiProperty({ example: 'La Paz', maxLength: 160 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  ubicacion!: string;

  @ApiProperty({ example: 2, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  vacantes!: number;

  @ApiProperty({
    example: '2026-12-15',
    description:
      'Fecha límite inclusive, en formato YYYY-MM-DD. Debe ser hoy o una fecha posterior.',
  })
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaLimite!: string;
}

export class ActualizarOfertaDto extends PartialType(CrearOfertaDto) {
  @ApiPropertyOptional({ enum: EstadoOferta, example: EstadoOferta.CERRADA })
  @IsOptional()
  @IsEnum(EstadoOferta)
  estado?: EstadoOferta;
}
