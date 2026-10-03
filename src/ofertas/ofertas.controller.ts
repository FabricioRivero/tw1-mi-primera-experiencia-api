import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { OfertasService } from './ofertas.service';
import { CrearOfertaDto } from './dto/crear-oferta.dto';
import { ReemplazarOfertaDto } from './dto/reemplazar-oferta.dto';
import { ActualizarOfertaDto } from './dto/actualizar-oferta.dto';
import { FiltrarOfertasDto } from './dto/filtrar-ofertas.dto';

@Controller('ofertas')
export class OfertasController {
  constructor(private readonly ofertasService: OfertasService) {}

  @Post()
  create(@Body() dto: CrearOfertaDto) {
    return this.ofertasService.create(dto);
  }

  @Get()
  findAll(@Query() filtros: FiltrarOfertasDto) {
    return this.ofertasService.findAll(filtros);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ofertasService.findOne(id);
  }

  @Put(':id')
  replace(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReemplazarOfertaDto,
  ) {
    return this.ofertasService.replace(id, dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarOfertaDto,
  ) {
    return this.ofertasService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    this.ofertasService.remove(id);
  }
}
