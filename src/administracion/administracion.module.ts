import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CategoriasModule } from '../categorias/categorias.module.js';
import { AdministracionController } from './administracion.controller.js';

@Module({
  imports: [AuthModule, CategoriasModule],
  controllers: [AdministracionController],
})
export class AdministracionModule {}
