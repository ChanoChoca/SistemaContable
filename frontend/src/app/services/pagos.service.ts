import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Ventas} from "../models/ventas";
import {environment} from "../../environments/environment";
import {Pagos} from "../models/pagos";
import {Observable} from "rxjs";
import {ArticulosVentas} from "../models/articulos-ventas";
import {User} from "../core/model/user.model";
import {State} from "../core/model/state.model";
import {Cuenta} from "../models/cuenta.model";
import {Comprobantes} from "../models/comprobantes";

@Injectable({
  providedIn: 'root'
})
export class PagosService {

  constructor(private http: HttpClient) {}

  // Método para obtener todos los pagos
  getPagos(): Observable<Pagos[]> {
    return this.http.get<Pagos[]>(`${environment.API_URL}/pagos`);
  }

  // Método para obtener un pago específica por su ID
  getPagoById(pagoId: number) {
    return this.http.get<Pagos>(`${environment.API_URL}/${pagoId}`);
  }

  // Método para crear un nuevo pago
  createPago(pago: Pagos) {
    return this.http.post<Pagos>(`${environment.API_URL}`, pago);
  }

  // Método para actualizar un pago
  updatePago(pagoId: number, pago: Pagos) {
    return this.http.put<Pagos>(`${environment.API_URL}/${pagoId}`, pago);
  }

  // Método para eliminar un pago
  deletePago(pagoId: number) {
    return this.http.delete<void>(`${environment.API_URL}/${pagoId}`);
  }

  private createPagos$: WritableSignal<State<Pagos[]>>
    = signal(State.Builder<Pagos[]>().forInit());
  createPagos(formasDePago: Pagos[]): void {
    this.http.post<Pagos[]>(`${environment.API_URL}/pagos`, formasDePago)
      .subscribe({
        next: createdPagos => this.createPagos$.set(State.Builder<Pagos[]>().forSuccess(createdPagos)),
        error: err => this.createPagos$.set(State.Builder<Pagos[]>().forError(err)),
      });
  }

  getPagosByVentaId(ventaId: number): Observable<Pagos[]> {
    return this.http.get<Pagos[]>(`${environment.API_URL}/pagos/getPagosByVentaId`, { params: { ventaId } });
  }
}
