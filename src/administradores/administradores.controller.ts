import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AdministradoresService } from './administradores.service.js';
import { CrearAdministradorDto } from './dto/crear-administrador.dto.js';

@Controller('administradores')
export class AdministradoresController {
  constructor(
    private readonly administradoresService: AdministradoresService,
  ) {}

  @Get()
  obtenerTodos() {
    return this.administradoresService.obtenerTodos();
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.administradoresService.obtenerPorId(id);
  }

  @Post()
  crear(@Body() datos: CrearAdministradorDto) {
    return this.administradoresService.crear(datos);
  }
}
