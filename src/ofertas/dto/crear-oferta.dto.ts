import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { TipoOferta } from '../enums/tipo-oferta.enum';
import { Modalidad } from '../enums/modalidad.enum';

export class CrearOfertaDto {
  @IsUUID()
  empresaId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  area: string;

  @IsEnum(TipoOferta)
  tipo: TipoOferta;

  @IsEnum(Modalidad)
  modalidad: Modalidad;

  @IsArray()
  @IsString({ each: true })
  requisitos: string[];

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
