import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './database/prisma.module.js';
import { CategoriasModule } from './categorias/categorias.module.js';
import { AuthModule } from './auth/auth.module.js';
import { OfertasModule } from './ofertas/ofertas.module.js';
import { PostulacionesModule } from './postulaciones/postulaciones.module.js';
import { CandidatosModule } from './candidatos/candidatos.module.js';
import { OrganizacionesModule } from './organizaciones/organizaciones.module.js';
import { AdministracionModule } from './administracion/administracion.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    // PrismaModule exporta el cliente reutilizable para los módulos de dominio.
    PrismaModule,
    CategoriasModule,
    AuthModule,
    OfertasModule,
    PostulacionesModule,
    CandidatosModule,
    OrganizacionesModule,
    AdministracionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
