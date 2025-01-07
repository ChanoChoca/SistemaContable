import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Articulos} from "../models/articulos";
import {environment} from "../../environments/environment";
import {Comprobantes} from "../models/comprobantes";
import {FacturaResponse} from "../models/factura-response";

@Injectable({
  providedIn: 'root'
})
export class ArcaService {

  // Inyecta HttpClient para hacer solicitudes HTTP
  private http = inject(HttpClient);

  generarComprobantes(comprobantes: { cbteTipo: number; docNro: number; impNeto: number; ventaId: number }[]): Observable<boolean> {
    return this.http.post<boolean>(`${environment.API_URL}/wsfe/crear-comprobantes`, comprobantes);
  }

  obtenerFactura(cbteTipo: number, cbteNro: number): Observable<FacturaResponse> {
    const params = {
      cbteTipo: cbteTipo.toString(),
      cbteNro: cbteNro.toString()
    };
    return this.http.get<FacturaResponse>(`${environment.API_URL}/wsfe/factura`, { params });
  }

  obtenerComprobante(ventaId: number, cbteTipo: number): Observable<Comprobantes> {
    const params = {
      ventaId: ventaId,
      comprobanteTipo: cbteTipo
    }
    return this.http.get<Comprobantes>(`${environment.API_URL}/wsfe/comprobante`, { params });
  }
}
