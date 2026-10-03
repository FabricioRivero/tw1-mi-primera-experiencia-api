import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CrearPostulacionDto {
  @IsUUID()
  @IsNotEmpty()
  idEstudiante: string;

  @IsString()
  @IsNotEmpty()
  idOferta: string;
}
