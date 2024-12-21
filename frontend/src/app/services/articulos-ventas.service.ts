import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Ventas} from "../models/ventas";
import {environment} from "../../environments/environment";
import {ArticulosVentas} from "../models/articulos-ventas";
import {Observable} from "rxjs";
import {Cuotas} from "../models/cuotas";
import {Pagos} from "../models/pagos";

@Injectable({
  providedIn: 'root'
})
export class ArticulosVentasService {

  constructor(private http: HttpClient) {}

  // Método para obtener todas las ventas
  getArticulosVentas(): Observable<ArticulosVentas[]> {
    return this.http.get<ArticulosVentas[]>(`${environment.API_URL}/articulos-ventas`);
  }

  // Método para obtener una venta específica por su ID
  getArticuloVentaById(articuloVentaId: number) {
    return this.http.get<ArticulosVentas>(`${environment.API_URL}/${articuloVentaId}`);
  }

  // Método para crear una nueva venta
  createArticuloVenta(articuloVenta: ArticulosVentas) {
    return this.http.post<ArticulosVentas>(`${environment.API_URL}`, articuloVenta);
  }

  // Método para actualizar una venta
  updateArticuloVenta(ventaId: number, articuloVenta: ArticulosVentas) {
    return this.http.put<ArticulosVentas>(`${environment.API_URL}/${ventaId}`, articuloVenta);
  }

  // Método para eliminar una venta
  deleteArticuloVenta(articuloVentaId: number) {
    return this.http.delete<void>(`${environment.API_URL}/${articuloVentaId}`);
  }

  crearVentaConArticulos(ventaConArticulos: { venta: Ventas, articulosVentas: ArticulosVentas[], formasDePago: Pagos[], cuotas: Cuotas[] }): Observable<any> {
    return this.http.post<any>(`${environment.API_URL}/articulos-ventas`, ventaConArticulos);
  }

  // Método para obtener artículos de ventas por mes
  getArticulosVentasByMonth(mes: string): Observable<ArticulosVentas[]> {
    return this.http.get<ArticulosVentas[]>(`${environment.API_URL}/articulos-ventas/get-by-month`, {
      params: { mes }
    });
  }
}
