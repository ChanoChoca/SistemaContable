import {Ventas} from "./ventas";

export interface Cuotas {
  id?: number;
  monto: number;
  fechaVencimiento: Date;
  estadoPago: string;
  venta: Ventas;
}
