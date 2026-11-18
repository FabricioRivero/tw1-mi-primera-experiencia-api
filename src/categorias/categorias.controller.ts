import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PUBLIC_ACCESS } from '../common/swagger/role-docs.js';
import { CategoriaRespuestaDto } from '../common/swagger/responses.dto.js';
import { CategoriasService } from './categorias.service.js';

@ApiTags('Categorías')
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar las áreas de pasantías',
    description: `${PUBLIC_ACCESS}\n\nNo requiere parámetros. Devuelve un arreglo ordenado por nombre; cada elemento incluye id, nombre y createdAt.`,
  })
  @ApiOkResponse({
    description: 'Lista de categorías; puede estar vacía.',
    type: [CategoriaRespuestaDto],
  })
  listar() {
    return this.categoriasService.listar();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consultar un área por ID',
    description: `${PUBLIC_ACCESS}\n\n**ID:** entero positivo de la categoría. Devuelve id, nombre y createdAt.`,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID entero de la categoría.',
  })
  @ApiOkResponse({
    description: 'Categoría encontrada.',
    type: CategoriaRespuestaDto,
  })
  @ApiBadRequestResponse({ description: 'El ID no es un entero válido.' })
  @ApiNotFoundResponse({ description: 'No existe una categoría con ese ID.' })
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.obtenerPorId(id);
  }
}
