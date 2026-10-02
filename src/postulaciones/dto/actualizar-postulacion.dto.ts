import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstadoPostulacion } from '../enums/estado-postulacion.enum';

export class ActualizarPostulacionDto {
  @IsEnum(EstadoPostulacion) @IsNotEmpty() estado: EstadoPostulacion;
}