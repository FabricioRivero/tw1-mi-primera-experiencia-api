import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpresaDto } from './crear-empresa.dto';

export class UpdateEmpresaDto extends PartialType(CreateEmpresaDto) {}
