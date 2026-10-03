import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Oferta } from './interfaces/oferta.interface';
import { CrearOfertaDto } from './dto/crear-oferta.dto';
import { ReemplazarOfertaDto } from './dto/reemplazar-oferta.dto';
import { ActualizarOfertaDto } from './dto/actualizar-oferta.dto';
import { FiltrarOfertasDto } from './dto/filtrar-ofertas.dto';
import { EmpresasService } from '../empresas/empresas.service';

@Injectable()
export class OfertasService {
  private readonly ruta = path.resolve(process.cwd(), 'data', 'ofertas.json');

  // Inyección de dependencias: Nest nos entrega la instancia de EmpresasService
  constructor(private readonly empresasService: EmpresasService) {}

  // ---------- Persistencia (archivo JSON) ----------

  private leer(): Oferta[] {
    if (!fs.existsSync(this.ruta)) return [];
    return JSON.parse(fs.readFileSync(this.ruta, 'utf-8')) as Oferta[];
  }

  private guardar(ofertas: Oferta[]): void {
    fs.writeFileSync(this.ruta, JSON.stringify(ofertas, null, 2), 'utf-8');
  }

  private buscarIndice(ofertas: Oferta[], id: string): number {
    const indice = ofertas.findIndex((o) => o.id === id);
    if (indice === -1) {
      throw new NotFoundException(`No existe la oferta con id ${id}`);
    }
    return indice;
  }

  // ---------- CRUD ----------

  create(dto: CrearOfertaDto): Oferta {
    // Si la empresa no existe, findOne lanza 404 y aquí se corta todo
    this.empresasService.findOne(dto.empresaId);

    const ofertas = this.leer();
    const nueva: Oferta = {
      id: randomUUID(),
      ...dto,
      activa: dto.activa ?? true,
      fechaPublicacion: new Date().toISOString(),
    };
    ofertas.push(nueva);
    this.guardar(ofertas);
    return nueva;
  }

  findAll(filtros: FiltrarOfertasDto): Oferta[] {
    let ofertas = this.leer();

    if (filtros.tipo) {
      ofertas = ofertas.filter((o) => o.tipo === filtros.tipo);
    }
    if (filtros.modalidad) {
      ofertas = ofertas.filter((o) => o.modalidad === filtros.modalidad);
    }
    if (filtros.area) {
      const area = filtros.area.toLowerCase();
      ofertas = ofertas.filter((o) => o.area.toLowerCase().includes(area));
    }
    return ofertas;
  }

  findOne(id: string): Oferta {
    const ofertas = this.leer();
    return ofertas[this.buscarIndice(ofertas, id)];
  }

  // PUT: reemplaza todo; se conservan id y fechaPublicacion
  replace(id: string, dto: ReemplazarOfertaDto): Oferta {
    const ofertas = this.leer();
    const indice = this.buscarIndice(ofertas, id);
    this.empresasService.findOne(dto.empresaId);

    ofertas[indice] = {
      id,
      ...dto,
      activa: dto.activa ?? true,
      fechaPublicacion: ofertas[indice].fechaPublicacion,
    };
    this.guardar(ofertas);
    return ofertas[indice];
  }

  // PATCH: solo los campos enviados
  update(id: string, dto: ActualizarOfertaDto): Oferta {
    const ofertas = this.leer();
    const indice = this.buscarIndice(ofertas, id);
    if (dto.empresaId) this.empresasService.findOne(dto.empresaId);

    ofertas[indice] = { ...ofertas[indice], ...dto };
    this.guardar(ofertas);
    return ofertas[indice];
  }

  remove(id: string): void {
    const ofertas = this.leer();
    const indice = this.buscarIndice(ofertas, id);
    ofertas.splice(indice, 1);
    this.guardar(ofertas);
  }
}
