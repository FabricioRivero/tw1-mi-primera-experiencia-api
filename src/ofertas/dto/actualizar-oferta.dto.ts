import { PartialType } from '@nestjs/mapped-types';
import { CrearOfertaDto } from './crear-oferta.dto';

export class ActualizarOfertaDto extends PartialType(CrearOfertaDto) {}
