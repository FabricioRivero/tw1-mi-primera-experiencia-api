import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoOferta } from '../enums/tipo-oferta.enum';
import { Modalidad } from '../enums/modalidad.enum';

// Parámetros de consulta: GET /ofertas?tipo=&area=&modalidad=
export class FiltrarOfertasDto {
  @IsOptional()
  @IsEnum(TipoOferta)
  tipo?: TipoOferta;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsEnum(Modalidad)
  modalidad?: Modalidad;
}
