// Interfaz para representar un usuario
export interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  cuit?: number | null;
  direccion?: string;
  imageUrl?: string;
  saldoCuenta?: number;
  limite?: number;
  saldoBanco?: number;
  authorities?: string[];
}
