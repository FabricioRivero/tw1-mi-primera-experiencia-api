import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from './current-user.decorator.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import type { UsuarioAutenticado } from './interfaces/usuario-autenticado.interface.js';
import { LoginDto } from './dto/login.dto.js';
import { RegistroCandidatoDto } from './dto/registro-candidato.dto.js';
import { RegistroOrganizacionDto } from './dto/registro-organizacion.dto.js';
import {
  AUTHENTICATED_ACCESS,
  PUBLIC_ACCESS,
} from '../common/swagger/role-docs.js';
import {
  LoginRespuestaDto,
  UsuarioRespuestaDto,
} from '../common/swagger/responses.dto.js';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('registro/candidato')
  @ApiOperation({
    summary: 'Registrar una cuenta de candidato',
    description: `${PUBLIC_ACCESS}\n\n**Body obligatorio:** email, password (12–72 caracteres), nombres y apellidos. El rol se asigna como CANDIDATO; no se acepta rol en el body. Devuelve el usuario creado sin la contraseña.`,
  })
  @ApiCreatedResponse({
    description: 'Cuenta y perfil de candidato creados.',
    schema: {
      example: {
        mensaje: 'Cuenta creada correctamente.',
        usuario: {
          id: 12,
          email: 'ana@ejemplo.com',
          rol: 'CANDIDATO',
          nombres: 'Ana María',
          apellidos: 'Pérez Gómez',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Body inválido o campos adicionales.' })
  @ApiConflictResponse({ description: 'El correo ya está registrado.' })
  registrarCandidato(@Body() dto: RegistroCandidatoDto) {
    return this.auth.registrarCandidato(dto);
  }

  @Post('registro/organizacion')
  @ApiOperation({
    summary: 'Registrar una cuenta de organización',
    description: `${PUBLIC_ACCESS}\n\n**Body obligatorio:** email, password (12–72 caracteres) y nombre de la organización. El rol se asigna como ORGANIZACION; no se acepta rol en el body. El MVP no incluye aprobación administrativa.`,
  })
  @ApiCreatedResponse({
    description: 'Cuenta y perfil de organización creados.',
    schema: {
      example: {
        mensaje: 'Cuenta creada correctamente.',
        usuario: {
          id: 13,
          email: 'talento@empresa.com',
          rol: 'ORGANIZACION',
          nombreOrganizacion: 'Empresa Ejemplo S.R.L.',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Body inválido o campos adicionales.' })
  @ApiConflictResponse({ description: 'El correo ya está registrado.' })
  registrarOrganizacion(@Body() dto: RegistroOrganizacionDto) {
    return this.auth.registrarOrganizacion(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: `${PUBLIC_ACCESS}\n\nEnvía email y password. La respuesta incluye un JWT Bearer válido durante 3600 segundos y el rol asignado. El administrador no se registra aquí: se crea mediante el seed.`,
  })
  @ApiOkResponse({
    description:
      'Sesión iniciada. Usa access_token en el botón Authorize de Swagger.',
    type: LoginRespuestaDto,
  })
  @ApiBadRequestResponse({ description: 'Body inválido o campos adicionales.' })
  @ApiUnauthorizedResponse({ description: 'Correo o contraseña incorrectos.' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Consultar la cuenta autenticada',
    description: `${AUTHENTICATED_ACCESS}\n\nNo requiere ID en la ruta. Devuelve id, email, rol y los datos básicos del perfil asociado; nunca incluye passwordHash.`,
  })
  @ApiOkResponse({
    description: 'Cuenta y perfil actuales.',
    type: UsuarioRespuestaDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Falta un Bearer token válido o expiró.',
  })
  me(@CurrentUser() user: UsuarioAutenticado) {
    return this.auth.me(user.sub);
  }
}
