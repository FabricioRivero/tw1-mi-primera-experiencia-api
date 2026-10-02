import { Module } from '@nestjs/common';
import { EstudiantesModule } from './estudiantes/estudiantes.module.js';
import { PostulacionesModule } from './postulaciones/postulaciones.module.js';
import { AdministradoresModule } from './administradores/administradores.module.js';

@Module({
  imports: [EstudiantesModule, PostulacionesModule, AdministradoresModule],
})
export class AppModule {}
