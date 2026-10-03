import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmpresasModule } from './empresas/empresas.module';
import { OfertasModule } from './ofertas/ofertas.module';
import { EstudiantesModule } from './estudiantes/estudiantes.module';
import { PostulacionesModule } from './postulaciones/postulaciones.module';
import { AdministradoresModule } from './administradores/administradores.module';

@Module({
  imports: [
    EmpresasModule,
    OfertasModule,
    EstudiantesModule,
    PostulacionesModule,
    AdministradoresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}