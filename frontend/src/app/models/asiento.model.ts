import {MovimientoContable, MovimientoContableLibroDiario} from './movimiento.model';

export interface AsientoContable {
  id?: number;
  fecha: Date;  // Utilizando ISO string para representar `LocalDateTime`
  usuarioEmail: string;  // Referencia al usuario que creó el asiento
  movimientos: MovimientoContable[];
}

export interface AsientoContableLibroMayor {
  id: number
  fecha: string
  movimientos: MovimientoContableLibroDiario[];
}

export interface AsientoContableGet {
  id: number
  fecha: string
  usuarioEmail: string;
}
