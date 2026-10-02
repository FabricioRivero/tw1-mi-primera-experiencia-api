import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CrearEstudianteDto {
  @IsString() @IsNotEmpty() nombre: string;
  @IsString() @IsNotEmpty() universidad: string;
  @IsString() @IsNotEmpty() carrera: string;
  @IsString() @IsNotEmpty() semestreEgreso: string;
  @IsEmail() correo: string;
  @IsString() @IsNotEmpty() telefono: string;
}