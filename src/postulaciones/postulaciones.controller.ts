import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { PostulacionesService } from './postulaciones.service.js';
import { CrearPostulacionDto } from './dto/crear-postulacion.dto.js';
import { ActualizarPostulacionDto } from './dto/actualizar-postulacion.dto.js';
import { ReemplazarPostulacionDto } from './dto/reemplazar-postulacion.dto.js';

@Controller('postulaciones')
export class PostulacionesController {
  constructor(private readonly postulacionesService: PostulacionesService) {}

  @Get()
  obtenerTodos() {
    return this.postulacionesService.obtenerTodos();
  }

  @Get('estudiante/:idEstudiante')
  obtenerPorEstudiante(@Param('idEstudiante') idEstudiante: string) {
    return this.postulacionesService.obtenerPorEstudiante(idEstudiante);
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.postulacionesService.obtenerPorId(id);
  }

  @Post()
  crear(@Body() datos: CrearPostulacionDto) {
    return this.postulacionesService.crear(datos);
  }

  @Put(':id')
  reemplazar(
    @Param('id') id: string,
    @Body() datos: ReemplazarPostulacionDto,
  ) {
    return this.postulacionesService.reemplazar(id, datos);
  }

  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body() datos: ActualizarPostulacionDto,
  ) {
    return this.postulacionesService.actualizar(id, datos);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id') id: string) {
    this.postulacionesService.eliminar(id);
  }
}
