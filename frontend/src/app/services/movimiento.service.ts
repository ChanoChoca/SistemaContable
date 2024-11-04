import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {MovimientoContable} from "../models/movimiento.model";
import {State} from "../core/model/state.model";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {

  // Inyecta HttpClient para hacer solicitudes HTTP
  private http = inject(HttpClient);

  // Signal para el estado de crear una cuenta
  private createMovimiento$: WritableSignal<State<MovimientoContable>>
    = signal(State.Builder<MovimientoContable>().forInit());
  createMovimientoSig = computed(() => this.createMovimiento$());

  // Obtener todos los movimientos
  getAllMovimientos(): Observable<MovimientoContable> {
    return this.http.get<MovimientoContable>(`${environment.API_URL}/movimientos-contables`);
  }

  // Obtener movimiento por ID
  getMovimientoById(id: number): Observable<MovimientoContable> {
    return this.http.get<MovimientoContable>(`${environment.API_URL}/movimientos-contables/${id}`);
  }

  updateMovimiento(movimiento: MovimientoContable): Observable<MovimientoContable> {
    return this.http.put<MovimientoContable>(`${environment.API_URL}/movimientos-contables/${movimiento.id}`, movimiento);
  }

  // Crear un nuevo movimiento
  createMovimiento(movimiento: MovimientoContable): void {
    this.http.post<MovimientoContable>(`${environment.API_URL}/movimientos-contables`, movimiento)
      .subscribe({
        next: createdAsiento => this.createMovimiento$.set(State.Builder<MovimientoContable>().forSuccess(createdAsiento)),
        error: err => this.createMovimiento$.set(State.Builder<MovimientoContable>().forError(err)),
      });
  }

  // Eliminar movimiento por ID
  deleteMovimiento(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.API_URL}/movimientos-contables/${id}`);
  }
}
