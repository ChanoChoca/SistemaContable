import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Cuotas} from "../models/cuotas";
import {Observable} from "rxjs";
import {Pagos} from "../models/pagos";

@Injectable({
  providedIn: 'root'
})
export class CuotasService {

  constructor(private http: HttpClient) {}

  // Método para obtener todas las cuotas
  getCuotas() {
    return this.http.get<Cuotas[]>(`${environment.API_URL}`);
  }

  // Método para obtener una cuota específica por su ID
  getCuotaById(cuotaId: number) {
    return this.http.get<Cuotas>(`${environment.API_URL}/${cuotaId}`);
  }

  // Método para crear una nueva cuota
  createCuota(cuota: Cuotas) {
    return this.http.post<Cuotas>(`${environment.API_URL}`, cuota);
  }

  // Método para actualizar una cuota
  updateCuota(cuota: Cuotas) {
    return this.http.put<Cuotas>(`${environment.API_URL}/cuotas`, cuota);
  }

  // Método para eliminar una cuota
  deleteCuota(cuotaId: number) {
    return this.http.delete<void>(`${environment.API_URL}/cuotas/${cuotaId}`);
  }

  getCuotasByClient(email: string): Observable<Cuotas[]> {
    return this.http.get<Cuotas[]>(`${environment.API_URL}/cuotas/get-by-client`, {
      params: {email} }
    );
  }
}
