import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export const ESTADOS_ORGANIZACION = [
  'EN_REVISION',
  'SELECCIONADA',
  'NO_SELECCIONADA',
] as const;

export class CambiarEstadoDto {
  @ApiProperty({
    enum: ESTADOS_ORGANIZACION,
    example: 'EN_REVISION',
    description:
      'La organización no puede asignar estados de respuesta del candidato.',
  })
  @IsIn(ESTADOS_ORGANIZACION)
  estado!: (typeof ESTADOS_ORGANIZACION)[number];
}
