import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { EstadoPostulacion } from '../enums/estado-postulacion.enum.js';

export class ReemplazarPostulacionDto {
  @IsUUID()
  @IsNotEmpty()
  idEstudiante: string;

  @IsString()
  @IsNotEmpty()
  idOferta: string;

  @IsEnum(EstadoPostulacion)
  @IsNotEmpty()
  estado: EstadoPostulacion;
}
