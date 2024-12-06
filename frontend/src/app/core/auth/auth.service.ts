import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpParams, HttpStatusCode} from "@angular/common/http";
import {Location} from "@angular/common";
import {catchError, Observable, tap, throwError} from "rxjs";
import {State} from "../model/state.model";
import {User} from "../model/user.model";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Inyección del servicio HttpClient
  http = inject(HttpClient);

  // Inyección del servicio Location
  location = inject(Location);

  // Estado por defecto cuando el usuario no está conectado
  notConnected = "NOT_CONNECTED";

  // Señal para gestionar el estado del usuario autenticado
  private fetchUser$: WritableSignal<State<User>> =
    signal(State.Builder<User>().forSuccess({email: this.notConnected}));
  // Computed para obtener el estado del usuario autenticado
  fetchUser = computed(() => this.fetchUser$());

  // Método para obtener la información del usuario autenticado
  fetch(forceResync: boolean): void {
    this.fetchHttpUser(forceResync)
      .subscribe({
        // En caso de éxito, actualizar la señal con el usuario autenticado
        next: user => this.fetchUser$.set(State.Builder<User>().forSuccess(user)),
        // En caso de error, manejar el error y actualizar la señal adecuadamente
        error: err => {
          if (err.status === HttpStatusCode.Unauthorized && this.isAuthenticated()) {
            this.fetchUser$.set(State.Builder<User>().forSuccess({email: this.notConnected}));
          } else {
            this.fetchUser$.set(State.Builder<User>().forError(err));
          }
        }
      })
  }

  // Método para iniciar sesión redirigiendo a la URL de autorización de Okta
  login(): void {
    console.log(`${location.origin}${this.location.prepareExternalUrl("oauth2/authorization/okta")}`);
    location.href = `${location.origin}${this.location.prepareExternalUrl("oauth2/authorization/okta")}`;
  }

  // Método para cerrar sesión llamando al endpoint de logout
  logout(): void {
    this.http.post(`${environment.API_URL}/auth/logout`, {})
      .subscribe({
        // En caso de éxito, actualizar la señal y redirigir a la URL de logout
        next: (response: any) => {
          this.fetchUser$.set(State.Builder<User>()
            .forSuccess({email: this.notConnected}));
          location.href = response.logoutUrl
        }
      })
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    if (this.fetchUser$().value) {
      return this.fetchUser$().value!.email !== this.notConnected;
    } else {
      return false;
    }
  }

  // Método para obtener la información del usuario desde el servidor
  fetchHttpUser(forceResync: boolean): Observable<User> {
    const params = new HttpParams().set('forceResync', forceResync);
    return this.http.get<User>(`${environment.API_URL}/auth/get-authenticated-user`, {params})
      .pipe(
        tap(user => console.log('Usuario autenticado:', user)),
        catchError(err => {
          console.error('Error al obtener usuario:', err);
          return throwError(err);
        })
      );
  }

  // Método para verificar si el usuario tiene alguna de las autoridades especificadas
  hasAnyAuthority(authorities: string[] | string): boolean {
    if(this.fetchUser$().value!.email === this.notConnected) {
      return false;
    }
    if(!Array.isArray(authorities)) {
      authorities = [authorities];
    }
    return this.fetchUser$().value!.authorities!
      .some((authority: string) => authorities.includes(authority));
  }

  // Método para obtener solo el email del usuario autenticado
  getAuthenticatedUserEmail(): string {
    const userState = this.fetchUser$().value;
    if (userState && userState.email !== this.notConnected) {
      return userState.email || '';
    }
    return this.notConnected;
  }

  getUserAuthority(): string[] {
    const user = this.fetchUser$().value;
    if (user && user.email !== this.notConnected) {
      return user.authorities || [];
    }
    return [];
  }

  hasRoleAdmin(): boolean {
    return this.getUserAuthority().includes('ROL_ADMIN');
  }
}
