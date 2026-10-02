import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { EstudiantesModule } from './estudiantes/estudiantes.module.js';
import { PostulacionesModule } from './postulaciones/postulaciones.module.js';
import { AdministradoresModule } from './administradores/administradores.module.js';

@Module({
  imports: [EstudiantesModule, PostulacionesModule, AdministradoresModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
