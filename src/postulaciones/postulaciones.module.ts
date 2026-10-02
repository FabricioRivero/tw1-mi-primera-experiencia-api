import { Module } from '@nestjs/common';
import { PostulacionesController } from './postulaciones.controller.js';
import { PostulacionesService } from './postulaciones.service.js';

@Module({
  controllers: [PostulacionesController],
  providers: [PostulacionesService],
})
export class PostulacionesModule {}
