import { IsNotEmpty, IsString } from 'class-validator';

export class CrearPostulacionDto {
  @IsString() @IsNotEmpty() idEstudiante: string;
  @IsString() @IsNotEmpty() idOferta: string;
}