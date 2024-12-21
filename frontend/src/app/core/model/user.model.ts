// Interfaz para representar un usuario
export interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
  saldoCuenta?: number;
  limite?: number;
  saldoBanco?: number;
  authorities?: string[];
}
