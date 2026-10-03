import { Module } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { EmpresasController } from './empresas.controller';

@Module({
  controllers: [EmpresasController],
  providers: [EmpresasService],
  exports: [EmpresasService], // para que OfertasModule pueda usarlo
})
export class EmpresasModule {}
