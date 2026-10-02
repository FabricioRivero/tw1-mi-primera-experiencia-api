import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CrearAdministradorDto {
  @IsString() @IsNotEmpty() nombre: string;
  @IsString() @IsNotEmpty() usuario: string;
  @IsEmail() correo: string;
}