import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PostulacionesModule } from '../postulaciones/postulaciones.module.js';
import { CandidatosController } from './candidatos.controller.js';

@Module({
  imports: [AuthModule, PostulacionesModule],
  controllers: [CandidatosController],
})
export class CandidatosModule {}
