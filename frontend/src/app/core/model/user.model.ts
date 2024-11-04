// Interfaz para representar un usuario
export interface User {
  firstName?: string; // Nombre del usuario, opcional
  lastName?: string; // Apellido del usuario, opcional
  email?: string; // Correo electrónico del usuario, opcional
  imageUrl?: string; // URL de la imagen del usuario, opcional
  authorities?: string[]; // Lista de autoridades (roles/privilegios) del usuario, opcional
}
