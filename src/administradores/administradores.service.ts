import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CrearAdministradorDto } from './dto/crear-administrador.dto';

export interface Administrador {
  id: string;
  usuario: string;
  [key: string]: any;
}

@Injectable()
export class AdministradoresService {
  private readonly ruta = path.resolve(process.cwd(), 'data', 'administradores.json');

  private leer(): Administrador[] {
    return JSON.parse(fs.readFileSync(this.ruta, 'utf-8'));
  }

  private guardar(datos: Administrador[]) {
    fs.writeFileSync(this.ruta, JSON.stringify(datos, null, 2), 'utf-8');
  }

  findAll(): Administrador[] { return this.leer(); }

  create(dto: CrearAdministradorDto): Administrador {
    const admins = this.leer();
    if (admins.some(a => a.usuario === dto.usuario)) {
      throw new BadRequestException('El usuario ya existe');
    }
    const nuevo = { id: uuidv4(), ...dto };
    admins.push(nuevo);
    this.guardar(admins);
    return nuevo;
  }
}