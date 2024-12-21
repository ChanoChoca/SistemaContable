import {Ventas} from "./ventas";
import {Articulos} from "./articulos";

export interface ArticulosVentas {
  id?: number;
  cantidad: number;
  subtotal: number;
  precioVenta: number;
  venta?: Ventas;
  articulo: Articulos;
}
