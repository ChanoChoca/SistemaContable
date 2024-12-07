import {Ventas} from "./ventas";
import {Articulos} from "./articulos";

export interface ArticulosVentas {
  id: number;
  cantidad: number;
  subtotal: number;
  precioVenta: number;  // Nuevo campo
  venta: Ventas;
  articulo: Articulos;
}
