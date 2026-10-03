import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CrearEmpresaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  nit: string;

  @IsString()
  @IsNotEmpty()
  rubro: string;

  @IsString()
  @IsNotEmpty()
  direccion: string;

  @IsEmail()
  correo: string;

  @IsString()
  @Length(7, 15)
  telefono: string;
}
