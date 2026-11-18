import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export const RESPUESTAS_CANDIDATO = ['ACEPTADA', 'RECHAZO_LA_OFERTA'] as const;

export class ResponderSeleccionDto {
  @ApiProperty({
    enum: RESPUESTAS_CANDIDATO,
    example: 'ACEPTADA',
    description: 'Solo se responde cuando el estado actual es SELECCIONADA.',
  })
  @IsIn(RESPUESTAS_CANDIDATO)
  respuesta!: (typeof RESPUESTAS_CANDIDATO)[number];
}
