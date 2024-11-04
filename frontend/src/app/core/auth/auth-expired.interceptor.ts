import {HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from "@angular/common/http";
import {inject} from "@angular/core";
import {AuthService} from "./auth.service";
import {tap} from "rxjs";

// Interceptor para manejar errores de autenticación
export const authExpired: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  // Inyección del servicio AuthService
  const authService = inject(AuthService);

  // Continuar con la solicitud HTTP
  return next(req).pipe(
    // Operador tap para interceptar el flujo de la respuesta
    tap({
      // Manejar errores de la respuesta
      error: (err: HttpErrorResponse) => {
        // Si el error es 401 (no autorizado), la URL no incluye "api/auth", y el usuario está autenticado, iniciar el proceso de login
        if (err.status === 401 && err.url && !err.url.includes("api/auth") && authService.isAuthenticated()) {
          authService.login();
        }
      }
    })
  )
}
