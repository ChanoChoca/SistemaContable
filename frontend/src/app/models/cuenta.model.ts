export interface Cuenta {
  id?: number,
  nombre: string,
  codigo: string,
  tipo: string,
  cuentaPadre: Cuenta,
  subCuentas?: Cuenta[],
  saldoActual: number,
  activa: boolean
}
