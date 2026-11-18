import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';
import { PUBLIC_ACCESS } from './common/swagger/role-docs.js';

@ApiTags('Estado de la API')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Comprobar que la API está disponible',
    description: `${PUBLIC_ACCESS}\n\nNo necesita parámetros. Devuelve un texto de confirmación.`,
  })
  @ApiOkResponse({
    description: 'API disponible.',
    schema: { example: 'Hello World!' },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
