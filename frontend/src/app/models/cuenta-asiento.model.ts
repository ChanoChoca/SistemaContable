import {Cuenta} from "./cuenta.model";
import {Asiento} from "./asiento.model";

export interface CuentaAsiento {
  id: number,
  cuenta: Cuenta,
  asiento: Asiento,
  debe: number,
  haber: number,
  saldo: number
}
