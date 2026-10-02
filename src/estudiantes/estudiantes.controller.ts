import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstudiantesService } from './estudiantes.service';
import { CrearEstudianteDto } from './dto/crear-estudiante.dto';
import { ActualizarEstudianteDto } from './dto/actualizar-estudiante.dto';

@Controller('estudiantes')
export class EstudiantesController {
  constructor(private readonly service: EstudiantesService) {}

  @Post() create(@Body() dto: CrearEstudianteDto) { return this.service.create(dto); }
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: ActualizarEstudianteDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}