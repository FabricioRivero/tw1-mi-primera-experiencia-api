import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PUBLIC_ACCESS } from '../common/swagger/role-docs.js';
import { OfertaRespuestaDto } from '../common/swagger/responses.dto.js';
import { ListarOfertasDto } from './dto/listar-ofertas.dto.js';
import { OfertasService } from './ofertas.service.js';

@ApiTags('Ofertas')
@Controller('ofertas')
export class OfertasController {
  constructor(private readonly ofertas: OfertasService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar ofertas públicas vigentes',
    description: `${PUBLIC_ACCESS}\n\n**Query opcional:** q busca texto en título/descripción; categoriaId filtra por área; page inicia en 1 y size admite 1–100 (por defecto 20). Solo devuelve ofertas ABIERTA cuya fecha límite es hoy o posterior. Respuesta: items, page, size, total y totalPages.`,
  })
  @ApiOkResponse({
    description: 'Página de ofertas públicas.',
    schema: {
      example: {
        items: [
          {
            id: 5,
            titulo: 'Pasante de desarrollo backend',
            descripcion: 'Apoyar al equipo en servicios web.',
            categoriaId: 1,
            categoria: 'Tecnología',
            modalidad: 'HIBRIDA',
            ubicacion: 'La Paz',
            vacantes: 2,
            fechaLimite: '2026-12-15T00:00:00.000Z',
            estado: 'ABIERTA',
            organizacionId: 9,
            organizacion: 'Empresa Ejemplo S.R.L.',
            createdAt: '2026-10-10T12:00:00.000Z',
            updatedAt: '2026-10-10T12:00:00.000Z',
          },
        ],
        page: 1,
        size: 20,
        total: 1,
        totalPages: 1,
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Parámetro de búsqueda, ID de categoría o paginación inválidos.',
  })
  listar(@Query() query: ListarOfertasDto) {
    return this.ofertas.listarPublicas(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consultar una oferta pública por ID',
    description: `${PUBLIC_ACCESS}\n\n**ID:** entero de la oferta. Devuelve sus campos y los nombres de categoría y organización. Una oferta cerrada o vencida responde 404.`,
  })
  @ApiParam({ name: 'id', type: Number, example: 5 })
  @ApiOkResponse({ description: 'Oferta vigente.', type: OfertaRespuestaDto })
  @ApiBadRequestResponse({ description: 'ID inválido.' })
  @ApiNotFoundResponse({
    description: 'La oferta no existe, está cerrada o venció.',
  })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.ofertas.obtenerPublica(id);
  }
}
