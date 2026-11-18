import { Module } from '@nestjs/common';
import { PostulacionesService } from './postulaciones.service.js';

@Module({
  providers: [PostulacionesService],
  exports: [PostulacionesService],
})
export class PostulacionesModule {}
