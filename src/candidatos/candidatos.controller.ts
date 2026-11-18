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
import { CANDIDATE_ACCESS } from '../common/swagger/role-docs.js';
import { PostulacionRespuestaDto } from '../common/swagger/responses.dto.js';
import { ResponderSeleccionDto } from '../postulaciones/dto/responder-seleccion.dto.js';
import { PostulacionesService } from '../postulaciones/postulaciones.service.js';

@ApiTags('Candidatos')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Falta un Bearer token válido o expiró.',
})
export class CandidatosController {
  constructor(private readonly postulaciones: PostulacionesService) {}

  @Post('ofertas/:ofertaId/postulaciones')
  @Roles('CANDIDATO')
  @ApiOperation({
    summary: 'Postular a una oferta vigente',
    description: `${CANDIDATE_ACCESS}\n\n**ofertaId:** entero de la oferta. No requiere body. Se permite una sola postulación histórica por candidato y oferta; no se puede volver a postular después de retirar o recibir una respuesta final.`,
  })
  @ApiCreatedResponse({
    description: 'Postulación creada en estado ENVIADA.',
    type: PostulacionRespuestaDto,
  })
  @ApiBadRequestResponse({ description: 'El ID de oferta no es válido.' })
  @ApiForbiddenResponse({ description: 'Solo un candidato puede postular.' })
  @ApiNotFoundResponse({
    description: 'Oferta cerrada, vencida o perfil de candidato inexistente.',
  })
  @ApiConflictResponse({
    description: 'Ya existe una postulación histórica para esa oferta.',
  })
  crearPostulacion(
    @Param('ofertaId', ParseIntPipe) ofertaId: number,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.postulaciones.crear(user.sub, ofertaId);
  }

  @Get('postulaciones/me')
  @Roles('CANDIDATO')
  @ApiOperation({
    summary: 'Listar mis postulaciones',
    description: `${CANDIDATE_ACCESS}\n\nNo se envía ID de candidato. Devuelve todas las postulaciones del usuario, incluidas las retiradas y las ofertas vencidas/cerradas.`,
  })
  @ApiOkResponse({
    description: 'Arreglo de postulaciones propias; puede estar vacío.',
    type: [PostulacionRespuestaDto],
  })
  @ApiForbiddenResponse({
    description: 'Solo un candidato puede consultar esta ruta.',
  })
  listarMisPostulaciones(@CurrentUser() user: UsuarioAutenticado) {
    return this.postulaciones.listarMias(user.sub);
  }

  @Patch('postulaciones/:id/respuesta')
  @Roles('CANDIDATO')
  @ApiOperation({
    summary: 'Aceptar o rechazar una selección',
    description: `${CANDIDATE_ACCESS}\n\n**id:** entero de una postulación propia. **Body obligatorio:** respuesta = ACEPTADA o RECHAZO_LA_OFERTA. Solo se puede responder una postulación en estado SELECCIONADA; cada postulación admite una sola respuesta.`,
  })
  @ApiParam({ name: 'id', type: Number, example: 21 })
  @ApiOkResponse({
    description: 'Respuesta del candidato guardada.',
    type: PostulacionRespuestaDto,
  })
  @ApiBadRequestResponse({ description: 'ID o respuesta enviados inválidos.' })
  @ApiForbiddenResponse({
    description: 'Solo el candidato dueño puede responder.',
  })
  @ApiNotFoundResponse({
    description: 'La postulación no existe o no es propia.',
  })
  @ApiConflictResponse({ description: 'La postulación no está SELECCIONADA.' })
  responderSeleccion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResponderSeleccionDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.postulaciones.responderSeleccion(user.sub, id, dto);
  }

  @Delete('postulaciones/:id')
  @Roles('CANDIDATO')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retirar una postulación sin borrarla',
    description: `${CANDIDATE_ACCESS}\n\n**id:** entero de una postulación propia. Solo se puede retirar en ENVIADA o EN_REVISION. La fila se conserva con estado RETIRADA y sigue bloqueando una segunda postulación histórica a la misma oferta.`,
  })
  @ApiParam({ name: 'id', type: Number, example: 21 })
  @ApiOkResponse({
    description: 'Postulación conservada como RETIRADA.',
    type: PostulacionRespuestaDto,
  })
  @ApiBadRequestResponse({ description: 'ID inválido.' })
  @ApiForbiddenResponse({
    description: 'Solo el candidato dueño puede retirarla.',
  })
  @ApiNotFoundResponse({
    description: 'La postulación no existe o no es propia.',
  })
  @ApiConflictResponse({
    description: 'El estado actual no permite retirar la postulación.',
  })
  retirarPostulacion(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.postulaciones.retirar(user.sub, id);
  }
}
