export interface Cuenta {
  id?: number;
  nombre: string;
  codigo: string;
  saldo: number;
  cuentaPadre: Cuenta | null;  // Referencia a la cuenta padre para la estructura en árbol
  subCuentas?: Cuenta[]; // Lista de subcuentas
  activa: boolean;
  eliminada: boolean;
}
