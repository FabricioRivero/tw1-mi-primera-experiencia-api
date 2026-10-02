import { PartialType } from '@nestjs/mapped-types';
import { CrearEstudianteDto } from './crear-estudiante.dto';

export class ActualizarEstudianteDto extends PartialType(CrearEstudianteDto) {}