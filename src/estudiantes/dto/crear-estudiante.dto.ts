import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CrearEstudianteDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  universidad: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  carrera: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  semestreEgreso: string;

  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  @MaxLength(20)
  telefono: string;
}
