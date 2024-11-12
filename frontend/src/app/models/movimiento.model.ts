import { Cuenta } from './cuenta.model';
import { AsientoContable } from './asiento.model';

export type TipoMovimiento = '+A' | '-P' | 'R-' | '-A' | '+P' | 'R+' | 'PN';

export interface MovimientoContable {
  id?: number;
  descripcion: string;
  cuenta: Cuenta;            // Cuenta asociada al movimiento
  asiento: AsientoContable;   // Asiento al que pertenece el movimiento
  monto: number;
  tipoMovimiento: TipoMovimiento;
}

export interface MovimientoContableLibroMayor {
  fecha: string;              // Fecha del movimiento
  descripcion: string;        // Descripción del movimiento
  tipoMovimiento: TipoMovimiento;
  monto: number;              // Monto de la transacción
}

export interface MovimientoContableLibroDiario {
  descripcion: string;        // Descripción del movimiento
  tipoMovimiento: TipoMovimiento;
  monto: number;              // Monto de la transacción
}
