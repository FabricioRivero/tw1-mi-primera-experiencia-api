import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { UsuarioAutenticado } from '../auth/interfaces/usuario-autenticado.interface.js';
import { Roles } from '../authorization/roles.decorator.js';
import { RolesGuard } from '../authorization/roles.guard.js';
import { ORGANIZATION_ACCESS } from '../common/swagger/role-docs.js';
import {
  OfertaRespuestaDto,
  PostulacionRespuestaDto,
} from '../common/swagger/responses.dto.js';
import { ActualizarOfertaDto, CrearOfertaDto } from '../ofertas/dto/crear-oferta.dto.js';
import { OfertasService } from '../ofertas/ofertas.service.js';
import { CambiarEstadoDto } from '../postulaciones/dto/cambiar-estado.dto.js';
import { PostulacionesService } from '../postulaciones/postulaciones.service.js';

@ApiTags('Organizaciones')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Falta un Bearer token válido o expiró.',
})
export class OrganizacionesController {
  constructor(
    private readonly ofertas: OfertasService,
    private readonly postulaciones: PostulacionesService,
  ) {}

  @Get('organizaciones/me/ofertas')
  @Roles('ORGANIZACION')
  @ApiOperation({
    summary: 'Listar las ofertas propias de la organización',
    description: `${ORGANIZATION_ACCESS}\n\nNo se envía ID de organización: se obtiene del token. Devuelve todas las ofertas propias, incluidas las cerradas o vencidas.`,
  })
  @ApiOkResponse({
    description: 'Arreglo de ofertas propias; puede estar vacío.',
    type: [OfertaRespuestaDto],
  })
  @ApiForbiddenResponse({
    description: 'El rol autenticado no es ORGANIZACION.',
  })
  listarMisOfertas(@CurrentUser() user: UsuarioAutenticado) {
    return this.ofertas.listarPropias(user.sub);
  }

  @Post('ofertas')
  @Roles('ORGANIZACION')
  @ApiOperation({
    summary: 'Publicar una oferta de pasantía',
    description: `${ORGANIZATION_ACCESS}\n\n**Body obligatorio:** titulo, descripcion, categoriaId existente (consulta GET /api/v1/categorias para obtenerlo), modalidad, ubicacion, vacantes y fechaLimite. El ID de organización, estado ABIERTA y fechas de auditoría los define el servidor; no los envíes. La fecha límite debe ser hoy o posterior.`,
  })
  @ApiCreatedResponse({
    description: 'Oferta creada y abierta.',
    type: OfertaRespuestaDto,
  })
  @ApiBadRequestResponse({
    description: 'Body inválido, categoría inexistente o fecha límite pasada.',
  })
  @ApiForbiddenResponse({
    description: 'El rol autenticado no es ORGANIZACION.',
  })
  @ApiNotFoundResponse({
    description: 'No se encontró el perfil de organización.',
  })
  crearOferta(
    @Body() dto: CrearOfertaDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.ofertas.crear(user.sub, dto);
  }

  @Patch('ofertas/:id')
  @Roles('ORGANIZACION')
  @ApiOperation({
    summary: 'Actualizar o cerrar una oferta propia',
    description: `${ORGANIZATION_ACCESS}\n\n**ID:** entero de la oferta. **Body PATCH:** todos los campos son opcionales; envía solo lo que cambias y el body no puede estar vacío. estado admite ABIERTA o CERRADA. Una oferta cerrada es terminal y no se puede volver a editar o abrir. Las vacantes no pueden ser menores que las selecciones o aceptaciones existentes.`,
  })
  @ApiParam({ name: 'id', type: Number, example: 5 })
  @ApiOkResponse({
    description: 'Oferta actualizada.',
    type: OfertaRespuestaDto,
  })
  @ApiBadRequestResponse({
    description: 'ID, campo, categoría o fecha inválidos.',
  })
  @ApiForbiddenResponse({
    description: 'El rol autenticado no es ORGANIZACION.',
  })
  @ApiNotFoundResponse({
    description: 'La oferta no existe o no pertenece a esta organización.',
  })
  @ApiConflictResponse({
    description:
      'La oferta ya está cerrada, las vacantes son insuficientes o hubo un cambio concurrente.',
  })
  actualizarOferta(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarOfertaDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.ofertas.actualizar(user.sub, id, dto);
  }

  @Delete('ofertas/:id')
  @Roles('ORGANIZACION')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar una oferta propia sin postulaciones',
    description: `${ORGANIZATION_ACCESS}\n\n**ID:** entero de la oferta. Solo se elimina si todavía no tiene postulaciones; si ya las tiene, cierra la oferta con PATCH /api/v1/ofertas/{id} para conservar el historial.`,
  })
  @ApiParam({ name: 'id', type: Number, example: 5 })
  @ApiOkResponse({
    description: 'Oferta eliminada.',
    schema: { example: { mensaje: 'Oferta eliminada.', id: 5 } },
  })
  @ApiBadRequestResponse({ description: 'ID inválido.' })
  @ApiForbiddenResponse({
    description: 'El rol autenticado no es ORGANIZACION.',
  })
  @ApiNotFoundResponse({
    description: 'La oferta no existe o no pertenece a esta organización.',
  })
  @ApiConflictResponse({
    description: 'La oferta tiene postulaciones y debe conservarse.',
  })
  eliminarOferta(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.ofertas.eliminar(user.sub, id);
  }

  @Get('ofertas/:ofertaId/postulaciones')
  @Roles('ORGANIZACION')
  @ApiOperation({
    summary: 'Listar candidatos postulados a una oferta propia',
    description: `${ORGANIZATION_ACCESS}\n\n**ofertaId:** entero de una oferta propia. Cada elemento incluye estado, fecha, resumen de oferta y nombres del candidato; no expone email ni datos de otras postulaciones.`,
  })
  @ApiParam({ name: 'ofertaId', type: Number, example: 5 })
  @ApiOkResponse({
    description: 'Arreglo de postulaciones de esa oferta.',
    type: [PostulacionRespuestaDto],
  })
  @ApiBadRequestResponse({ description: 'ID de oferta inválido.' })
  @ApiForbiddenResponse({
    description: 'Solo una organización puede consultar esta ruta.',
  })
  @ApiNotFoundResponse({
    description: 'La oferta no existe o no pertenece a esta organización.',
  })
  listarPostulaciones(
    @Param('ofertaId', ParseIntPipe) ofertaId: number,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.postulaciones.listarPorOferta(user.sub, ofertaId);
  }

  @Patch('postulaciones/:id/estado')
  @Roles('ORGANIZACION')
  @ApiOperation({
    summary: 'Avanzar el estado de una postulación',
    description: `${ORGANIZATION_ACCESS}\n\n**id:** entero de la postulación. **Body obligatorio:** estado = EN_REVISION, SELECCIONADA o NO_SELECCIONADA. Transiciones permitidas: ENVIADA → EN_REVISION/NO_SELECCIONADA; EN_REVISION → SELECCIONADA/NO_SELECCIONADA. La selección está limitada por las vacantes de la oferta. Solo puede modificarla la organización dueña.`,
  })
  @ApiParam({ name: 'id', type: Number, example: 21 })
  @ApiOkResponse({
    description: 'Postulación actualizada.',
    type: PostulacionRespuestaDto,
  })
  @ApiBadRequestResponse({ description: 'ID o estado enviado inválido.' })
  @ApiForbiddenResponse({
    description: 'Solo una organización puede cambiar estados.',
  })
  @ApiNotFoundResponse({
    description: 'La postulación no existe o no pertenece a esta organización.',
  })
  @ApiConflictResponse({
    description: 'Transición inválida, vacantes agotadas o cambio concurrente.',
  })
  cambiarEstadoPostulacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.postulaciones.cambiarEstado(user.sub, id, dto);
  }
}
