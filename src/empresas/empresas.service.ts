import { Injectable } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/crear-empresa.dto';
import { UpdateEmpresaDto } from './dto/actualizar-empresa.dto';

@Injectable()
export class EmpresasService {
  create(createEmpresaDto: CreateEmpresaDto) {
    return 'This action adds a new empresa';
  }

  findAll() {
    return `This action returns all empresas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} empresa`;
  }

  update(id: number, updateEmpresaDto: UpdateEmpresaDto) {
    return `This action updates a #${id} empresa`;
  }

  remove(id: number) {
    return `This action removes a #${id} empresa`;
  }
}
