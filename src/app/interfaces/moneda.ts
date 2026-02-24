import { Conversion } from "./conversion";

export interface Moneda {
  id: number;
  codigo: string;
  leyenda: string;
  simbolo: string;
  eliminada: boolean;
  conversion?: Conversion;
  indiceConvertibilidad?: number;
}