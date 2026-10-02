import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Postulacion } from './interfaces/postulacion.interface';
import { CrearPostulacionDto } from './dto/crear-postulacion.dto';
import { ActualizarPostulacionDto } from './dto/actualizar-postulacion.dto';
import { EstadoPostulacion } from './enums/estado-postulacion.enum';

@Injectable()
export class PostulacionesService {
  private readonly ruta = path.resolve(process.cwd(), 'data', 'postulaciones.json');

  private leer(): Postulacion[] {
    return JSON.parse(fs.readFileSync(this.ruta, 'utf-8'));
  }

  private guardar(datos: Postulacion[]) {
    fs.writeFileSync(this.ruta, JSON.stringify(datos, null, 2), 'utf-8');
  }

  findAll(): Postulacion[] { return this.leer(); }

  findOne(id: string): Postulacion {
    const post = this.leer().find(p => p.id === id);
    if (!post) throw new NotFoundException('No encontrado');
    return post;
  }

  create(dto: CrearPostulacionDto): Postulacion {
    const postulaciones = this.leer();
    const estudiantes = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'data', 'estudiantes.json'), 'utf-8'));
    
    if (!estudiantes.some((e: any) => e.id === dto.idEstudiante)) {
      throw new NotFoundException('El estudiante no existe');
    }

    if (postulaciones.some(p => p.idEstudiante === dto.idEstudiante && p.idOferta === dto.idOferta)) {
      throw new BadRequestException('Ya postuló a esta oferta');
    }

    const nueva = { id: uuidv4(), ...dto, estado: EstadoPostulacion.PENDIENTE };
    postulaciones.push(nueva);
    this.guardar(postulaciones);
    return nueva;
  }

  update(id: string, dto: ActualizarPostulacionDto): Postulacion {
    const postulaciones = this.leer();
    const index = postulaciones.findIndex(p => p.id === id);
    if (index === -1) throw new NotFoundException('No encontrado');
    
    postulaciones[index].estado = dto.estado;
    this.guardar(postulaciones);
    return postulaciones[index];
  }

  remove(id: string) {
    let postulaciones = this.leer();
    postulaciones = postulaciones.filter(p => p.id !== id);
    this.guardar(postulaciones);
    return { mensaje: 'Eliminado' };
  }
}