import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostulacionesService } from './postulaciones.service';
import { CrearPostulacionDto } from './dto/crear-postulacion.dto';
import { ActualizarPostulacionDto } from './dto/actualizar-postulacion.dto';

@Controller('postulaciones')
export class PostulacionesController {
  constructor(private readonly service: PostulacionesService) {}

  @Post() create(@Body() dto: CrearPostulacionDto) { return this.service.create(dto); }
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: ActualizarPostulacionDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}