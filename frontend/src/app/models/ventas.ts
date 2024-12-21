import {User} from "../core/model/user.model";

export interface Ventas {
  id?: number;
  fecha: Date;
  tipo: string;
  cliente?: User;
  nroComprobante: number;
  monto: number;
  nroFactura: number;
  descripcion: string;
  vendedorEmail: string;
  estado: string;
}
