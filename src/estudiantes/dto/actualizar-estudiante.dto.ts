import { PartialType } from '@nestjs/mapped-types';
import { CrearEstudianteDto } from './crear-estudiante.dto.js';

export class ActualizarEstudianteDto extends PartialType(CrearEstudianteDto) {}
