import 'dotenv/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
  type OpenAPIObject,
  type OperationObject,
} from '@nestjs/swagger';
import { AppModule } from './app.module.js';

const STATE_TONES: Record<string, 'info' | 'warning' | 'danger'> = {
  ABIERTA: 'info',
  CERRADA: 'danger',
  ENVIADA: 'info',
  EN_REVISION: 'warning',
  SELECCIONADA: 'info',
  ACEPTADA: 'info',
  NO_SELECCIONADA: 'danger',
  RECHAZO_LA_OFERTA: 'danger',
  RETIRADA: 'danger',
};

function decorateSwaggerDescriptions(document: OpenAPIObject): void {
  const endpointPattern =
    /\b(GET|POST|PUT|PATCH|DELETE)\s+(\/api\/v1(?:\/[A-Za-z0-9_{}.-]+)*)/g;
  const statePattern = new RegExp(
    `\\b(${Object.keys(STATE_TONES).join('|')})\\b`,
    'g',
  );
  for (const path of Object.values(document.paths)) {
    for (const operation of Object.values(path ?? {})) {
      if (!operation || typeof operation !== 'object') continue;
      const description = (operation as OperationObject).description;
      if (!description) continue;
      const endpoints = description.replace(
        endpointPattern,
        '<code class="api-doc-endpoint">$1 $2</code>',
      );
      (operation as OperationObject).description = endpoints.replace(
        statePattern,
        (_match, state: string) =>
          `<code class="api-doc-state api-doc-state--${STATE_TONES[state]}">${state}</code>`,
      );
    }
  }
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const configService = app.get(ConfigService);
  const port = Number(configService.get<string>('PORT', '3000'));

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API de pasantías — MVP')
    .setDescription(
      'API educativa de pasantías. Incluye autenticación JWT, roles ADMIN/CANDIDATO/ORGANIZACION, categorías, ofertas y postulaciones. Las descripciones de cada operación especifican permisos, campos, reglas y respuestas.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  decorateSwaggerDescriptions(document);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
    customCss: `
      .swagger-ui .renderedMarkdown code.api-doc-endpoint,
      .swagger-ui .markdown code.api-doc-endpoint {
        color: #854d0e;
        background: #fef3c7;
        border: 1px solid #fcd34d;
        border-radius: 4px;
        padding: 1px 5px;
        white-space: normal;
        overflow-wrap: anywhere;
      }
      .swagger-ui .renderedMarkdown code.api-doc-state,
      .swagger-ui .markdown code.api-doc-state {
        border: 1px solid transparent;
        border-radius: 4px;
        padding: 1px 5px;
      }
      .swagger-ui .renderedMarkdown code.api-doc-state--info,
      .swagger-ui .markdown code.api-doc-state--info {
        color: #075985;
        background: #e0f2fe;
        border-color: #7dd3fc;
      }
      .swagger-ui .renderedMarkdown code.api-doc-state--warning,
      .swagger-ui .markdown code.api-doc-state--warning {
        color: #92400e;
        background: #fef3c7;
        border-color: #fcd34d;
      }
      .swagger-ui .renderedMarkdown code.api-doc-state--danger,
      .swagger-ui .markdown code.api-doc-state--danger {
        color: #991b1b;
        background: #fee2e2;
        border-color: #fca5a5;
      }
    `,
    swaggerOptions: {
      tagsSorter: (left: string, right: string) => {
        const order = [
          'Estado de la API',
          'Autenticación',
          'Candidatos',
          'Organizaciones',
          'Administración',
          'Categorías',
          'Ofertas',
          'Postulaciones',
        ];
        return order.indexOf(left) - order.indexOf(right);
      },
    },
  });

  await app.listen(port);
  console.log(`API disponible en http://localhost:${port}/api/v1`);
  console.log(`Documentación disponible en http://localhost:${port}/api/docs`);
}

await bootstrap();
