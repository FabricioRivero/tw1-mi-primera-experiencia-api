import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Administrador } from './interfaces/administrador.interface.js';
import { CrearAdministradorDto } from './dto/crear-administrador.dto.js';

@Injectable()
export class AdministradoresService {
  private readonly ruta = path.resolve(
    process.cwd(),
    'data',
    'administradores.json',
  );

  private asegurarArchivo(): void {
    const dir = path.dirname(this.ruta);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.ruta)) {
      fs.writeFileSync(this.ruta, '[]', 'utf-8');
    }
  }

  private leer(): Administrador[] {
    this.asegurarArchivo();
    const contenido = fs.readFileSync(this.ruta, 'utf-8');
    return JSON.parse(contenido) as Administrador[];
  }

  private guardar(datos: Administrador[]): void {
    this.asegurarArchivo();
    fs.writeFileSync(this.ruta, JSON.stringify(datos, null, 2), 'utf-8');
  }

  obtenerTodos(): Administrador[] {
    return this.leer();
  }

  obtenerPorId(id: string): Administrador {
    const admin = this.leer().find((item) => item.id === id);
    if (!admin) {
      throw new NotFoundException(`No existe un administrador con id ${id}`);
    }
    return admin;
  }

  crear(datos: CrearAdministradorDto): Administrador {
    const administradores = this.leer();

    if (administradores.some((item) => item.usuario === datos.usuario)) {
      throw new ConflictException(
        `Ya existe un administrador con el usuario ${datos.usuario}`,
      );
    }

    if (administradores.some((item) => item.correo === datos.correo)) {
      throw new ConflictException(
        `Ya existe un administrador con el correo ${datos.correo}`,
      );
    }

    const nuevoAdministrador: Administrador = {
      id: uuidv4(),
      nombre: datos.nombre,
      usuario: datos.usuario,
      correo: datos.correo,
    };

    administradores.push(nuevoAdministrador);
    this.guardar(administradores);
    return nuevoAdministrador;
  }
}
