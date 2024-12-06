import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cuenta } from '../models/cuenta.model';
import {Page} from "../models/page.model";
import {State} from "../core/model/state.model";

@Injectable({
  providedIn: 'root'
})
export class CuentaService {
  private http = inject(HttpClient);

  // Signal para el estado de crear una cuenta
  private createCuenta$: WritableSignal<State<Cuenta>>
    = signal(State.Builder<Cuenta>().forInit());
  createCuentaSig = computed(() => this.createCuenta$());

  // Signal para el estado de la eliminación de cuentas
  private deleteCuenta$: WritableSignal<State<string>>
    = signal(State.Builder<string>().forInit());
  deleteCuentaSig = computed(() => this.deleteCuenta$());

  // Signal para el estado de la actualización de cuentas
  private updateCuenta$: WritableSignal<State<Cuenta>>
    = signal(State.Builder<Cuenta>().forInit());
  updateCuentaSig = computed(() => this.updateCuenta$());

  // Obtener todas las cuentas
  getAllCuentas(page: number = 0, size: number = 1, nombre: string = ''): Observable<Page<Cuenta>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('nombre', nombre.toString())

    return this.http.get<Page<Cuenta>>(`${environment.API_URL}/cuentas`, {params});
  }

  getAllCuentasTree(page: number = 0, size: number = 1, nombre: string = ''): Observable<Page<Cuenta>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('nombre', nombre.toString())

    return this.http.get<Page<Cuenta>>(`${environment.API_URL}/cuentas/tree`, {params});
  }

  // getCuentas(): Observable<Cuenta[]> {
  //   return this.http.get<Cuenta[]>(`${environment.API_URL}/cuentas/cuentas-sin-paginado`);
  // }
  getCuentas(): Observable<Cuenta[]> {
    return this.http.get<Cuenta[]>(`${environment.API_URL}/cuentas`);
  }

  // Obtener cuenta por ID
  getCuentaById(id: number): Observable<Cuenta> {
    return this.http.get<Cuenta>(`${environment.API_URL}/cuentas/${id}`);
  }

  // Método para actualizar una cuenta
  updateCuenta(cuenta: Cuenta): void {
    this.http.put<Cuenta>(`${environment.API_URL}/cuentas/${cuenta.id}`, cuenta)
      .subscribe({
        next: updatedCuenta => {
          // Si la actualización es exitosa, establece un estado de éxito
          this.updateCuenta$.set(State.Builder<Cuenta>().forSuccess(updatedCuenta));
        },
        error: err => {
          // Si hay un error, establece el estado de error
          this.updateCuenta$.set(State.Builder<Cuenta>().forError(err));
        }
      });
  }

  createCuenta(cuenta: Cuenta): void {
    this.http.post<Cuenta>(`${environment.API_URL}/cuentas`, cuenta)
      .subscribe({
        next: createdCuenta => this.createCuenta$.set(State.Builder<Cuenta>().forSuccess(createdCuenta)),
        error: err => this.createCuenta$.set(State.Builder<Cuenta>().forError(err)),
      });
  }

  // Método para eliminar cuenta por ID
  deleteCuenta(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.API_URL}/cuentas/${id}`);
  }

  deactivateCuenta(cuentaId: number): Observable<Cuenta> {
    return this.http.patch<Cuenta>(`${environment.API_URL}/cuentas/${cuentaId}/deactivate`, {
      activa: false
    });
  }

  actualizarSaldoCuenta(idCuenta: number, nuevoSaldo: number): Observable<Cuenta> {
    console.log(nuevoSaldo);
    return this.http.put<Cuenta>(`${environment.API_URL}/cuentas/${idCuenta}/actualizar`, { saldo: nuevoSaldo });
  }
}
