import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { OfertasModule } from '../ofertas/ofertas.module.js';
import { PostulacionesModule } from '../postulaciones/postulaciones.module.js';
import { OrganizacionesController } from './organizaciones.controller.js';

@Module({
  imports: [AuthModule, OfertasModule, PostulacionesModule],
  controllers: [OrganizacionesController],
})
export class OrganizacionesModule {}
