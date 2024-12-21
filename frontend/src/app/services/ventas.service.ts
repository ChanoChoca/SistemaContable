import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Ventas} from "../models/ventas";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  constructor(private http: HttpClient) {}

  // Método para obtener todas las ventas
  getVentas(): Observable<Ventas[]> {
    return this.http.get<Ventas[]>(`${environment.API_URL}/ventas`);
  }

  // Método para obtener una venta específica por su ID
  getVentaById(ventaId: number): Observable<Ventas> {
    return this.http.get<Ventas>(`${environment.API_URL}/ventas/${ventaId}`);
  }

  // Método para crear una nueva venta
  createVenta(venta: Ventas) {
    return this.http.post<Ventas>(`${environment.API_URL}`, venta);
  }

  // Método para actualizar una venta
  updateVenta(ventaId: number, venta: Ventas) {
    return this.http.put<Ventas>(`${environment.API_URL}/${ventaId}`, venta);
  }

  // Método para eliminar una venta
  deleteVenta(ventaId: number) {
    return this.http.delete<void>(`${environment.API_URL}/${ventaId}`);
  }

  getVentasByClienteEmail(userEmail: string): Observable<Ventas[]> {
    return this.http.get<Ventas[]>(`${environment.API_URL}/ventas/clienteEmail`, {params: {userEmail}});
  }
}
