import { PartialType } from '@nestjs/mapped-types';
import { CrearCategoriaDto } from './crear-categoria.dto.js';

/** Hace opcionales las propiedades de creación para permitir PATCH. */
export class ActualizarCategoriaDto extends PartialType(CrearCategoriaDto) {}
