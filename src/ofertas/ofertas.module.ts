import { Module } from '@nestjs/common';
import { OfertasService } from './ofertas.service';
import { OfertasController } from './ofertas.controller';
import { EmpresasModule } from '../empresas/empresas.module';

@Module({
  imports: [EmpresasModule], // trae EmpresasService (porque EmpresasModule lo exporta)
  controllers: [OfertasController],
  providers: [OfertasService],
  exports: [OfertasService], // para que PostulacionesModule (Jorge) lo use
})
export class OfertasModule {}
