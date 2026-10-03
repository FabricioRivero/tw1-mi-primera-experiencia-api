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
import { EstudiantesService } from './estudiantes.service.js';
import { CrearEstudianteDto } from './dto/crear-estudiante.dto.js';
import { ActualizarEstudianteDto } from './dto/actualizar-estudiante.dto.js';
import { ReemplazarEstudianteDto } from './dto/reemplazar-estudiante.dto.js';

@Controller('estudiantes')
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesService) {}

  @Get()
  obtenerTodos() {
    return this.estudiantesService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.estudiantesService.obtenerPorId(id);
  }

  @Post()
  crear(@Body() datos: CrearEstudianteDto) {
    return this.estudiantesService.crear(datos);
  }

  @Put(':id')
  reemplazar(
    @Param('id') id: string,
    @Body() datos: ReemplazarEstudianteDto,
  ) {
    return this.estudiantesService.reemplazar(id, datos);
  }

  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body() datos: ActualizarEstudianteDto,
  ) {
    return this.estudiantesService.actualizar(id, datos);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id') id: string) {
    this.estudiantesService.eliminar(id);
  }
}
