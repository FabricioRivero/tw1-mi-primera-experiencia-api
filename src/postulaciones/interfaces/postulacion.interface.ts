import { EstadoPostulacion } from '../enums/estado-postulacion.enum';

export interface Postulacion {
  id: string;
  idEstudiante: string;
  idOferta: string;
  estado: EstadoPostulacion;
}