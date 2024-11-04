import { Cuenta } from './cuenta.model';
import { AsientoContable } from './asiento.model';

export interface MovimientoContable {
  id?: number;
  descripcion: string;
  cuenta: Cuenta;            // Cuenta asociada al movimiento
  asiento: AsientoContable;   // Asiento al que pertenece el movimiento
  monto: number;
  esDebito: boolean;          // `true` si es un débito, `false` si es un crédito
}
