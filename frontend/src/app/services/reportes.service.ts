import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {Page} from "../models/page.model";
import {CuentaAsiento} from "../models/cuenta-asiento.model";

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  // Inyecta HttpClient para hacer solicitudes HTTP
  private http = inject(HttpClient);

  // Obtener el libro diario entre dos fechas
  getLibroDiario(page: number = 0, size: number = 1, fechaInicio: string, fechaFin: string): Observable<Page<CuentaAsiento>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get<Page<CuentaAsiento>>(`${environment.API_URL}/cuenta-asiento/libro-diario`, { params });
  }

  getAllAsientos(fechaInicio: string, fechaFin: string): Observable<CuentaAsiento[]> {
    let params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    return this.http.get<CuentaAsiento[]>(`${environment.API_URL}/cuenta-asiento/libro-diario-sin-paginado`, {params});
  }

  // Obtener el libro mayor para una cuenta específica entre dos fechas
  getLibroMayor(cuentaId: number, fechaInicio: string, fechaFin: string): Observable<CuentaAsiento[]> {
    const params = {
      cuentaId: cuentaId.toString(),
      fechaInicio: fechaInicio,
      fechaFin: fechaFin
    };
    return this.http.get<CuentaAsiento[]>(`${environment.API_URL}/cuenta-asiento/libro-mayor`, { params });
  }
}
