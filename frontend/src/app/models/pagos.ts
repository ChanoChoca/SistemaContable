import {Cuenta} from "./cuenta.model";
import {Ventas} from "./ventas";
import {Cuotas} from "./cuotas";

export interface Pagos {
  id?: number
  cantidad: number
  cuenta: Cuenta
  venta?: Ventas;
  cuota?: Cuotas;
}
