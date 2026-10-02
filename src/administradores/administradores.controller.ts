import { Controller, Get, Post, Body } from '@nestjs/common';
import { AdministradoresService } from './administradores.service';
import { CrearAdministradorDto } from './dto/crear-administrador.dto';

@Controller('administradores')
export class AdministradoresController {
  constructor(private readonly service: AdministradoresService) {}
  @Post() create(@Body() dto: CrearAdministradorDto) { return this.service.create(dto); }
  @Get() findAll() { return this.service.findAll(); }
}