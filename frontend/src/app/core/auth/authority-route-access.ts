import {ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot} from "@angular/router";
import {inject} from "@angular/core";
import {AuthService} from "./auth.service";
import {map} from "rxjs";

// Guard para controlar el acceso a rutas basadas en autoridades del usuario
export const authorityRouteAccess: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  // Inyección del servicio AuthService
  const authService = inject(AuthService);

  // Obtener la información del usuario autenticado desde el servidor
  return authService.fetchHttpUser(false).pipe(
    // Operador map para transformar el flujo de la respuesta
    map(connectedUser => {
      // Si el usuario está autenticado
      if (connectedUser) {
        // Obtener las autoridades requeridas desde los datos de la ruta
        const authorities = next.data['authorities'];
        // Verificar si no se requieren autoridades o si el usuario tiene alguna de las autoridades requeridas
        return !authorities || authorities.length === 0 || authService.hasAnyAuthority(authorities);
      }
      // Si el usuario no está autenticado, iniciar el proceso de login
      authService.login();
      return false;
    })
  );
}
