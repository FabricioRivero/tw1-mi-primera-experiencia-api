import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmpresasModule } from './empresas/empresas.module';
import { OfertasModule } from './ofertas/ofertas.module';

@Module({
  imports: [EmpresasModule, OfertasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}