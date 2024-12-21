import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {User} from "../core/model/user.model";
import {catchError, Observable, tap, throwError} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);

  updateBalance(user: User): Observable<User> {
    const balanceData = {
      email: user.email,
      saldoBanco: user.saldoBanco,
      saldoCuenta: user.saldoCuenta,
      limite: user.limite
    };

    console.log("Datos de saldo enviados: ", balanceData);
    return this.http.put<User>(`${environment.API_URL}/auth/balance`, balanceData);
  }

  fetchHttpUser(forceResync: boolean): Observable<User[]> {
    const params = new HttpParams().set('forceResync', forceResync);
    return this.http.get<User[]>(`${environment.API_URL}/auth/get-authenticated-user`, {params})
      .pipe(
        tap(user => console.log('Usuario autenticado:', user)),
        catchError(err => {
          console.error('Error al obtener usuario:', err);
          return throwError(err);
        })
      );
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.API_URL}/auth/usuarios`);
  }

  getUserByEmail(userEmail: string): Observable<User> {
    return this.http.get<User>(`${environment.API_URL}/auth/email`, { params: { email: userEmail } });
  }
}
