import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

/** Define las propiedades permitidas al crear una categoría. */
export class CrearCategoriaDto {
  @ApiProperty({ example: 'Estudio', maxLength: 60 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nombre!: string;
}
