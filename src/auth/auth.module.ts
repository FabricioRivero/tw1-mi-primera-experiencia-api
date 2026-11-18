import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { PasswordService } from './password.service.js';
import { RolesGuard } from '../authorization/roles.guard.js';
import { PermissionsGuard } from '../authorization/permissions.guard.js';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: (() => {
          const secret = config.getOrThrow<string>('JWT_SECRET');
          if (secret.length < 32 || secret.startsWith('CAMBIAR_')) {
            throw new Error(
              'JWT_SECRET debe tener al menos 32 caracteres aleatorios. Revisa .env.',
            );
          }
          return secret;
        })(),
        signOptions: {
          expiresIn: '1h',
          issuer: 'pasantias-mvp-api',
          audience: 'pasantias-mvp-client',
        },
        verifyOptions: {
          issuer: 'pasantias-mvp-api',
          audience: 'pasantias-mvp-client',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [JwtModule, JwtAuthGuard, RolesGuard, PermissionsGuard],
})
export class AuthModule {}
