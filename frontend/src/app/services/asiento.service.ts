import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AsientoContable } from '../models/asiento.model';
import {environment} from "../../environments/environment";
import {Page} from "../models/page.model";
import {State} from "../core/model/state.model";

@Injectable({
  providedIn: 'root'
})
export class AsientoService {

  // Inyecta HttpClient para hacer solicitudes HTTP
  private http = inject(HttpClient);

  // Signal para el estado de crear un asiento
  private createAsiento$: WritableSignal<State<AsientoContable>>
    = signal(State.Builder<AsientoContable>().forInit());
  createAsientoSig = computed(() => this.createAsiento$());

  // Signal para el estado de la eliminación de asiento
  private deleteAsiento$: WritableSignal<State<string>>
    = signal(State.Builder<string>().forInit());
  deleteAsientoSig = computed(() => this.deleteAsiento$());

  // Signal para el estado de la actualización de asiento
  private updateAsiento$: WritableSignal<State<AsientoContable>>
    = signal(State.Builder<AsientoContable>().forInit());
  updateAsientoSig = computed(() => this.updateAsiento$());

  // Obtener todos los asientos
  getAllAsientos(page: number = 0, size: number = 1): Observable<Page<AsientoContable>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())

    return this.http.get<Page<AsientoContable>>(`${environment.API_URL}/asientos-contables`, {params});
  }

  // Obtener asiento por ID
  getAsientoById(id: number): Observable<AsientoContable> {
    return this.http.get<AsientoContable>(`${environment.API_URL}/asientos-contables/${id}`);
  }

  updateAsiento(asiento: AsientoContable): void {
    this.http.put<AsientoContable>(`${environment.API_URL}/asientos-contables/${asiento.id}`, asiento)
      .subscribe({
        next: updatedAsiento => {
          // Si la actualización es exitosa, establece un estado de éxito
          this.updateAsiento$.set(State.Builder<AsientoContable>().forSuccess(updatedAsiento));
        },
        error: err => {
          // Si hay un error, establece el estado de error
          this.updateAsiento$.set(State.Builder<AsientoContable>().forError(err));
        }
      });
  }

  // Crear un nuevo asiento
  createAsiento(asiento: AsientoContable): void {
    this.http.post<AsientoContable>(`${environment.API_URL}/asientos-contables`, asiento)
      .subscribe({
        next: createdAsiento => this.createAsiento$.set(State.Builder<AsientoContable>().forSuccess(createdAsiento)),
        error: err => this.createAsiento$.set(State.Builder<AsientoContable>().forError(err)),
      });
  }

  // Eliminar asiento por ID
  deleteAsiento(id: number): void {
    this.http.delete<void>(`${environment.API_URL}/asientos-contables/${id}`)
      .subscribe({
        next: () => {
          // Si la eliminación es exitosa, puedes establecer un estado de éxito
          this.deleteAsiento$.set(State.Builder<string>().forSuccess(`Asiento ${id} eliminado correctamente.`));
        },
        error: err => {
          // Si hay un error, establece el estado de error
          this.deleteAsiento$.set(State.Builder<string>().forError(err));
        }
      });
  }
}
