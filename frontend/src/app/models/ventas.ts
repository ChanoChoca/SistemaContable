import {User} from "../core/model/user.model";

export interface Ventas {
  id?: number;
  fecha: Date;
  tipo: string;
  cliente?: User;
  monto: number;
  nroFactura: number;
  descripcion: string;
  vendedor?: User;
  estado: string;
}
