import { Injectable } from '@nestjs/common';
import { CreateOfertaDto } from './dto/crear-oferta.dto';
import { UpdateOfertaDto } from './dto/actualizar-oferta.dto';

@Injectable()
export class OfertasService {
  create(createOfertaDto: CreateOfertaDto) {
    return 'This action adds a new oferta';
  }

  findAll() {
    return `This action returns all ofertas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} oferta`;
  }

  update(id: number, updateOfertaDto: UpdateOfertaDto) {
    return `This action updates a #${id} oferta`;
  }

  remove(id: number) {
    return `This action removes a #${id} oferta`;
  }
}
