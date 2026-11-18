import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Permissions } from '../authorization/permissions.decorator.js';
import { PermissionsGuard } from '../authorization/permissions.guard.js';
import { ADMIN_ACCESS } from '../common/swagger/role-docs.js';
import { CategoriaRespuestaDto } from '../common/swagger/responses.dto.js';
import { CategoriasService } from '../categorias/categorias.service.js';
import { ActualizarCategoriaDto } from '../categorias/dto/actualizar-categoria.dto.js';
import { CrearCategoriaDto } from '../categorias/dto/crear-categoria.dto.js';

@ApiTags('Administración')
@Controller('categorias')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Falta un Bearer token válido.' })
@ApiForbiddenResponse({
  description:
    'Solo el administrador tiene el permiso categorias:administrar.',
})
export class AdministracionController {
  constructor(private readonly categorias: CategoriasService) {}

  @Post()
  @Permissions('categorias:administrar')
  @ApiOperation({
    summary: 'Crear un área de pasantías',
    description: `${ADMIN_ACCESS}\n\n**Body obligatorio:** nombre (1–60 caracteres). No envíes id ni fechas; se generan en el servidor.`,
  })
  @ApiCreatedResponse({
    description: 'Categoría creada.',
    type: CategoriaRespuestaDto,
  })
  @ApiBadRequestResponse({
    description: 'Nombre inválido o campos adicionales.',
  })
  @ApiConflictResponse({
    description: 'Ya existe una categoría con ese nombre.',
  })
  crearCategoria(@Body() datos: CrearCategoriaDto) {
    return this.categorias.crear(datos);
  }

  @Patch(':id')
  @Permissions('categorias:administrar')
  @ApiOperation({
    summary: 'Actualizar parcialmente un área',
    description: `${ADMIN_ACCESS}\n\n**ID:** entero de la categoría. **Body PATCH:** envía solo nombre si deseas cambiarlo; nombre es opcional, pero el body no puede estar vacío.`,
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Categoría actualizada.',
    type: CategoriaRespuestaDto,
  })
  @ApiBadRequestResponse({
    description: 'ID o body inválido, vacío o con propiedades extra.',
  })
  @ApiNotFoundResponse({ description: 'No existe una categoría con ese ID.' })
  @ApiConflictResponse({
    description: 'Ya existe otra categoría con ese nombre.',
  })
  actualizarCategoria(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarCategoriaDto,
  ) {
    return this.categorias.actualizar(id, datos);
  }

  @Delete(':id')
  @Permissions('categorias:administrar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar un área sin ofertas relacionadas',
    description: `${ADMIN_ACCESS}\n\n**ID:** entero de la categoría. Solo se puede eliminar si ninguna oferta la usa; no se borran ofertas al eliminar categorías.`,
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Categoría eliminada.',
    schema: {
      example: {
        id: 1,
        nombre: 'Tecnología',
        createdAt: '2026-01-10T12:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'ID inválido.' })
  @ApiNotFoundResponse({ description: 'No existe una categoría con ese ID.' })
  @ApiConflictResponse({
    description: 'No se puede eliminar porque hay ofertas relacionadas.',
  })
  eliminarCategoria(@Param('id', ParseIntPipe) id: number) {
    return this.categorias.eliminar(id);
  }
}
