import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

/** Exporta PrismaService para que los módulos puedan inyectarlo. */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
