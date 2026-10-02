import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Estudiante } from './interfaces/estudiante.interface';
import { CrearEstudianteDto } from './dto/crear-estudiante.dto';
import { ActualizarEstudianteDto } from './dto/actualizar-estudiante.dto';

@Injectable()
export class EstudiantesService {
  private readonly ruta = path.resolve(process.cwd(), 'data', 'estudiantes.json');

  private leer(): Estudiante[] {
    const contenido = fs.readFileSync(this.ruta, 'utf-8');
    return JSON.parse(contenido);
  }

  private guardar(datos: Estudiante[]) {
    fs.writeFileSync(this.ruta, JSON.stringify(datos, null, 2), 'utf-8');
  }

  findAll(): Estudiante[] {
    return this.leer();
  }

  findOne(id: string): Estudiante {
    const estudiante = this.leer().find(e => e.id === id);
    if (!estudiante) throw new NotFoundException(`Estudiante ${id} no encontrado`);
    return estudiante;
  }

  create(dto: CrearEstudianteDto): Estudiante {
    const estudiantes = this.leer();
    if (estudiantes.some(e => e.correo === dto.correo)) {
      throw new BadRequestException('El correo ya existe');
    }
    const nuevo = { id: uuidv4(), ...dto };
    estudiantes.push(nuevo);
    this.guardar(estudiantes);
    return nuevo;
  }

  update(id: string, dto: ActualizarEstudianteDto): Estudiante {
    const estudiantes = this.leer();
    const index = estudiantes.findIndex(e => e.id === id);
    if (index === -1) throw new NotFoundException('No encontrado');
    
    estudiantes[index] = { ...estudiantes[index], ...dto };
    this.guardar(estudiantes);
    return estudiantes[index];
  }

  remove(id: string) {
    let estudiantes = this.leer();
    const inicial = estudiantes.length;
    estudiantes = estudiantes.filter(e => e.id !== id);
    if (estudiantes.length === inicial) throw new NotFoundException('No encontrado');
    this.guardar(estudiantes);
    return { mensaje: 'Eliminado' };
  }
}