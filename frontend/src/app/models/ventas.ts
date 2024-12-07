export interface Ventas {
  id?: number;
  fecha: Date;
  tipo: string;
  clienteEmail: string;
  nroComprobante: number;
  monto: number;
  nroFactura: number;
  descripcion: string;
  vendedorEmail: string;
  formaPago: string;
  estado: string;
}
