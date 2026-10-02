import { PartialType } from '@nestjs/mapped-types';
import { CreateOfertaDto } from './crear-oferta.dto';

export class UpdateOfertaDto extends PartialType(CreateOfertaDto) {}
