import {Ventas} from "./ventas";

export interface Comprobantes {
  id?: number;
  comprobanteNro: number;
  comprobanteTipo: number;
  venta: Ventas;
}
