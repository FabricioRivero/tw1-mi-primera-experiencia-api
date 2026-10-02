import { Module } from '@nestjs/common';
import { AdministradoresController } from './administradores.controller.js';
import { AdministradoresService } from './administradores.service.js';

@Module({
  controllers: [AdministradoresController],
  providers: [AdministradoresService],
})
export class AdministradoresModule {}
