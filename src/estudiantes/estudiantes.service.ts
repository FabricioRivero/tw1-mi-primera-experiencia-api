import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Estudiante } from './interfaces/estudiante.interface.js';
import { CrearEstudianteDto } from './dto/crear-estudiante.dto.js';
import { ActualizarEstudianteDto } from './dto/actualizar-estudiante.dto.js';
import { ReemplazarEstudianteDto } from './dto/reemplazar-estudiante.dto.js';

@Injectable()
export class EstudiantesService {
  private readonly ruta = path.resolve(process.cwd(), 'data', 'estudiantes.json');

  private asegurarArchivo(): void {
    const dir = path.dirname(this.ruta);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.ruta)) {
      fs.writeFileSync(this.ruta, '[]', 'utf-8');
    }
  }

  private leer(): Estudiante[] {
    this.asegurarArchivo();
    const contenido = fs.readFileSync(this.ruta, 'utf-8');
    return JSON.parse(contenido) as Estudiante[];
  }

  private guardar(datos: Estudiante[]): void {
    this.asegurarArchivo();
    fs.writeFileSync(this.ruta, JSON.stringify(datos, null, 2), 'utf-8');
  }

  private buscarIndice(id: string): number {
    const estudiantes = this.leer();
    const indice = estudiantes.findIndex((item) => item.id === id);
    if (indice === -1) {
      throw new NotFoundException(`No existe un estudiante con id ${id}`);
    }
    return indice;
  }

  obtenerTodos(): Estudiante[] {
    return this.leer();
  }

  obtenerPorId(id: string): Estudiante {
    const estudiante = this.leer().find((item) => item.id === id);
    if (!estudiante) {
      throw new NotFoundException(`No existe un estudiante con id ${id}`);
    }
    return estudiante;
  }

  crear(datos: CrearEstudianteDto): Estudiante {
    const estudiantes = this.leer();

    if (estudiantes.some((item) => item.correo === datos.correo)) {
      throw new ConflictException(
        `Ya existe un estudiante registrado con el correo ${datos.correo}`,
      );
    }

    const nuevoEstudiante: Estudiante = {
      id: uuidv4(),
      nombre: datos.nombre,
      universidad: datos.universidad,
      carrera: datos.carrera,
      semestreEgreso: datos.semestreEgreso,
      correo: datos.correo,
      telefono: datos.telefono,
    };

    estudiantes.push(nuevoEstudiante);
    this.guardar(estudiantes);
    return nuevoEstudiante;
  }

  reemplazar(id: string, datos: ReemplazarEstudianteDto): Estudiante {
    const estudiantes = this.leer();
    const indice = this.buscarIndice(id);

    const correoEnUso = estudiantes.some(
      (item) => item.correo === datos.correo && item.id !== id,
    );
    if (correoEnUso) {
      throw new ConflictException(
        `Ya existe un estudiante registrado con el correo ${datos.correo}`,
      );
    }

    const estudianteReemplazado: Estudiante = {
      id,
      nombre: datos.nombre,
      universidad: datos.universidad,
      carrera: datos.carrera,
      semestreEgreso: datos.semestreEgreso,
      correo: datos.correo,
      telefono: datos.telefono,
    };

    estudiantes[indice] = estudianteReemplazado;
    this.guardar(estudiantes);
    return estudianteReemplazado;
  }

  actualizar(id: string, datos: ActualizarEstudianteDto): Estudiante {
    const estudiantes = this.leer();
    const indice = this.buscarIndice(id);

    if (datos.correo) {
      const correoEnUso = estudiantes.some(
        (item) => item.correo === datos.correo && item.id !== id,
      );
      if (correoEnUso) {
        throw new ConflictException(
          `Ya existe un estudiante registrado con el correo ${datos.correo}`,
        );
      }
    }

    estudiantes[indice] = {
      ...estudiantes[indice],
      ...datos,
    };

    this.guardar(estudiantes);
    return estudiantes[indice];
  }

  eliminar(id: string): Estudiante {
    const estudiantes = this.leer();
    const indice = this.buscarIndice(id);
    const [estudianteEliminado] = estudiantes.splice(indice, 1);
    this.guardar(estudiantes);
    return estudianteEliminado;
  }
}
