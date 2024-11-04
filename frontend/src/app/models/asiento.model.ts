import { MovimientoContable } from './movimiento.model';

export interface AsientoContable {
  id?: number;
  fecha: Date;  // Utilizando ISO string para representar `LocalDateTime`
  usuarioEmail: string;  // Referencia al usuario que creó el asiento
  movimientos: MovimientoContable[];
}
