import { Injectable } from '@nestjs/common';
import { CrearEmpresaDto } from './dto/crear-empresa.dto';
import { ActualizarEmpresaDto } from './dto/actualizar-empresa.dto';

@Injectable()
export class EmpresasService {
  create(createEmpresaDto: CrearEmpresaDto) {
    return 'This action adds a new empresa';
  }

  findAll() {
    return `This action returns all empresas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} empresa`;
  }

  update(id: number, updateEmpresaDto: ActualizarEmpresaDto) {
    return `This action updates a #${id} empresa`;
  }

  remove(id: number) {
    return `This action removes a #${id} empresa`;
  }
}
