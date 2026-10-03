import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Empresa } from './interfaces/empresa.interface';
import { CrearEmpresaDto } from './dto/crear-empresa.dto';
import { ReemplazarEmpresaDto } from './dto/reemplazar-empresa.dto';
import { ActualizarEmpresaDto } from './dto/actualizar-empresa.dto';

@Injectable()
export class EmpresasService {
  // Ruta absoluta al archivo JSON donde se guardan las empresas
  private readonly ruta = path.resolve(process.cwd(), 'data', 'empresas.json');

  // ---------- Persistencia (archivo JSON) ----------

  private leer(): Empresa[] {
    if (!fs.existsSync(this.ruta)) return [];
    return JSON.parse(fs.readFileSync(this.ruta, 'utf-8')) as Empresa[];
  }

  private guardar(empresas: Empresa[]): void {
    fs.writeFileSync(this.ruta, JSON.stringify(empresas, null, 2), 'utf-8');
  }

  // ---------- Reglas de negocio ----------

  // El NIT no puede repetirse. idExcluir sirve para que, al editar,
  // la empresa no choque consigo misma.
  private verificarNitUnico(
    empresas: Empresa[],
    nit: string,
    idExcluir?: string,
  ): void {
    const repetido = empresas.some((e) => e.nit === nit && e.id !== idExcluir);
    if (repetido) {
      throw new ConflictException(`Ya existe una empresa con el NIT ${nit}`);
    }
  }

  private buscarIndice(empresas: Empresa[], id: string): number {
    const indice = empresas.findIndex((e) => e.id === id);
    if (indice === -1) {
      throw new NotFoundException(`No existe la empresa con id ${id}`);
    }
    return indice;
  }

  // ---------- CRUD ----------

  create(dto: CrearEmpresaDto): Empresa {
    const empresas = this.leer();
    this.verificarNitUnico(empresas, dto.nit);

    const nueva: Empresa = { id: randomUUID(), ...dto };
    empresas.push(nueva);
    this.guardar(empresas);
    return nueva;
  }

  findAll(): Empresa[] {
    return this.leer();
  }

  findOne(id: string): Empresa {
    const empresas = this.leer();
    return empresas[this.buscarIndice(empresas, id)];
  }

  // PUT: se reemplaza el recurso completo (se conserva solo el id)
  replace(id: string, dto: ReemplazarEmpresaDto): Empresa {
    const empresas = this.leer();
    const indice = this.buscarIndice(empresas, id);
    this.verificarNitUnico(empresas, dto.nit, id);

    empresas[indice] = { id, ...dto };
    this.guardar(empresas);
    return empresas[indice];
  }

  // PATCH: se modifican solo los campos enviados
  update(id: string, dto: ActualizarEmpresaDto): Empresa {
    const empresas = this.leer();
    const indice = this.buscarIndice(empresas, id);
    if (dto.nit) this.verificarNitUnico(empresas, dto.nit, id);

    empresas[indice] = { ...empresas[indice], ...dto };
    this.guardar(empresas);
    return empresas[indice];
  }

  remove(id: string): void {
    const empresas = this.leer();
    const indice = this.buscarIndice(empresas, id);
    empresas.splice(indice, 1);
    this.guardar(empresas);
  }
}
