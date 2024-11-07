import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {AsientoContable, AsientoContableLibroMayor} from "../models/asiento.model";
import {environment} from "../../environments/environment";
import {Page} from "../models/page.model";
import {MovimientoContableLibroMayor} from "../models/movimiento.model";

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  // Inyecta HttpClient para hacer solicitudes HTTP
  private http = inject(HttpClient);

  // Obtener el libro diario entre dos fechas
  getLibroDiario(page: number = 0, size: number = 1, fechaInicio: string, fechaFin: string): Observable<Page<AsientoContableLibroMayor>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get<Page<AsientoContableLibroMayor>>(`${environment.API_URL}/asientos-contables/libro-diario`, { params });
  }

  getAllAsientos(fechaInicio: string, fechaFin: string): Observable<AsientoContable[]> {
    let params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    return this.http.get<AsientoContable[]>(`${environment.API_URL}/asientos-contables/libro-diario-sin-paginado`, {params});
  }

  // Obtener el libro mayor para una cuenta específica entre dos fechas
  getLibroMayor(cuentaId: number, fechaInicio: string, fechaFin: string): Observable<MovimientoContableLibroMayor[]> {
    const params = {
      cuentaId: cuentaId.toString(),
      fechaInicio: fechaInicio,
      fechaFin: fechaFin
    };
    return this.http.get<MovimientoContableLibroMayor[]>(`${environment.API_URL}/movimientos-contables/libro-mayor`, { params });
  }
}
