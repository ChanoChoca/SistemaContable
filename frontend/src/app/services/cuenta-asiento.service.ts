import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {CuentaAsiento} from "../models/cuenta-asiento.model";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {State} from "../core/model/state.model";
import {Asiento} from "../models/asiento.model";

@Injectable({
  providedIn: 'root'
})
export class CuentaAsientoService {

  // Inyecta HttpClient para hacer solicitudes HTTP
  private http = inject(HttpClient);

  // Signal para el estado de crear un asiento
  private createCuentaAsiento$: WritableSignal<State<CuentaAsiento[]>>
    = signal(State.Builder<CuentaAsiento[]>().forInit());
  createCuentaAsientoSig = computed(() => this.createCuentaAsiento$());

  crearCuentasAsiento(asiento: Asiento, cuentasAfectadas: CuentaAsiento[]): void {
    const requestPayload = {
      asiento: asiento,
      cuentasAfectadas: cuentasAfectadas
    };

    this.http.post<CuentaAsiento[]>(`${environment.API_URL}/cuenta-asiento`, requestPayload)
      .subscribe({
        next: createdCuentaAsiento => this.createCuentaAsiento$.set(State.Builder<CuentaAsiento[]>().forSuccess(createdCuentaAsiento)),
        error: err => this.createCuentaAsiento$.set(State.Builder<CuentaAsiento[]>().forError(err)),
      });
  }

  // Método para verificar si un asiento tiene CuentaAsiento asociado
  checkIfCuentaAsientoExists(asientoId: number): Observable<boolean> {
    return this.http.get<boolean>(`${environment.API_URL}/cuenta-asiento/exists-asiento/${asientoId}`);
  }

  checkCuentaAsientos(cuentaId: number): Observable<boolean> {
    return this.http.get<boolean>(`${environment.API_URL}/cuenta-asiento/exists-cuenta/${cuentaId}`);
  }
}
