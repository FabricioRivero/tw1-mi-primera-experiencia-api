import { TipoOferta } from '../enums/tipo-oferta.enum';
import { Modalidad } from '../enums/modalidad.enum';

export interface Oferta {
  id: string;
  empresaId: string;
  titulo: string;
  descripcion: string;
  area: string;
  tipo: TipoOferta;
  modalidad: Modalidad;
  requisitos: string[];
  fechaPublicacion: string;
  activa: boolean;
}
