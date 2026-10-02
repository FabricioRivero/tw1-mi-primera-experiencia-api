import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Postulacion } from './interfaces/postulacion.interface.js';
import { CrearPostulacionDto } from './dto/crear-postulacion.dto.js';
import { ActualizarPostulacionDto } from './dto/actualizar-postulacion.dto.js';
import { ReemplazarPostulacionDto } from './dto/reemplazar-postulacion.dto.js';
import { EstadoPostulacion } from './enums/estado-postulacion.enum.js';
import { Estudiante } from '../estudiantes/interfaces/estudiante.interface.js';

@Injectable()
export class PostulacionesService {
  private readonly ruta = path.resolve(
    process.cwd(),
    'data',
    'postulaciones.json',
  );
  private readonly rutaEstudiantes = path.resolve(
    process.cwd(),
    'data',
    'estudiantes.json',
  );

  private asegurarArchivo(ruta: string): void {
    const dir = path.dirname(ruta);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(ruta)) {
      fs.writeFileSync(ruta, '[]', 'utf-8');
    }
  }

  private leer(): Postulacion[] {
    this.asegurarArchivo(this.ruta);
    const contenido = fs.readFileSync(this.ruta, 'utf-8');
    return JSON.parse(contenido) as Postulacion[];
  }

  private guardar(datos: Postulacion[]): void {
    this.asegurarArchivo(this.ruta);
    fs.writeFileSync(this.ruta, JSON.stringify(datos, null, 2), 'utf-8');
  }

  private leerEstudiantes(): Estudiante[] {
    this.asegurarArchivo(this.rutaEstudiantes);
    const contenido = fs.readFileSync(this.rutaEstudiantes, 'utf-8');
    return JSON.parse(contenido) as Estudiante[];
  }

  private buscarIndice(id: string): number {
    const postulaciones = this.leer();
    const indice = postulaciones.findIndex((item) => item.id === id);
    if (indice === -1) {
      throw new NotFoundException(`No existe una postulación con id ${id}`);
    }
    return indice;
  }

  private verificarEstudianteExiste(idEstudiante: string): void {
    const estudiantes = this.leerEstudiantes();
    const existe = estudiantes.some((item) => item.id === idEstudiante);
    if (!existe) {
      throw new NotFoundException(
        `No existe un estudiante con id ${idEstudiante}`,
      );
    }
  }

  obtenerTodos(): Postulacion[] {
    return this.leer();
  }

  obtenerPorId(id: string): Postulacion {
    const postulacion = this.leer().find((item) => item.id === id);
    if (!postulacion) {
      throw new NotFoundException(`No existe una postulación con id ${id}`);
    }
    return postulacion;
  }

  obtenerPorEstudiante(idEstudiante: string): Postulacion[] {
    this.verificarEstudianteExiste(idEstudiante);
    return this.leer().filter((item) => item.idEstudiante === idEstudiante);
  }

  crear(datos: CrearPostulacionDto): Postulacion {
    this.verificarEstudianteExiste(datos.idEstudiante);

    const postulaciones = this.leer();

    const yaPostulo = postulaciones.some(
      (item) =>
        item.idEstudiante === datos.idEstudiante &&
        item.idOferta === datos.idOferta,
    );

    if (yaPostulo) {
      throw new ConflictException(
        'El estudiante ya postuló a esta oferta',
      );
    }

    const nuevaPostulacion: Postulacion = {
      id: uuidv4(),
      idEstudiante: datos.idEstudiante,
      idOferta: datos.idOferta,
      fechaPostulacion: new Date().toISOString(),
      estado: EstadoPostulacion.PENDIENTE,
    };

    postulaciones.push(nuevaPostulacion);
    this.guardar(postulaciones);
    return nuevaPostulacion;
  }

  reemplazar(id: string, datos: ReemplazarPostulacionDto): Postulacion {
    this.verificarEstudianteExiste(datos.idEstudiante);

    const postulaciones = this.leer();
    const indice = this.buscarIndice(id);

    const duplicado = postulaciones.some(
      (item) =>
        item.id !== id &&
        item.idEstudiante === datos.idEstudiante &&
        item.idOferta === datos.idOferta,
    );

    if (duplicado) {
      throw new ConflictException(
        'El estudiante ya postuló a esta oferta',
      );
    }

    const postulacionReemplazada: Postulacion = {
      id,
      idEstudiante: datos.idEstudiante,
      idOferta: datos.idOferta,
      fechaPostulacion: postulaciones[indice].fechaPostulacion,
      estado: datos.estado,
    };

    postulaciones[indice] = postulacionReemplazada;
    this.guardar(postulaciones);
    return postulacionReemplazada;
  }

  actualizar(id: string, datos: ActualizarPostulacionDto): Postulacion {
    const postulaciones = this.leer();
    const indice = this.buscarIndice(id);

    postulaciones[indice] = {
      ...postulaciones[indice],
      estado: datos.estado,
    };

    this.guardar(postulaciones);
    return postulaciones[indice];
  }

  eliminar(id: string): Postulacion {
    const postulaciones = this.leer();
    const indice = this.buscarIndice(id);
    const [postulacionEliminada] = postulaciones.splice(indice, 1);
    this.guardar(postulaciones);
    return postulacionEliminada;
  }
}
