import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {State} from "../core/model/state.model";
import {Articulos} from "../models/articulos";
import {map, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ArticulosService {

  // Inyecta HttpClient para hacer solicitudes HTTP
  private http = inject(HttpClient);

  // Signal para el estado de crear un asiento
  private createArticulo$: WritableSignal<State<Articulos>>
    = signal(State.Builder<Articulos>().forInit());
  createArticuloSig = computed(() => this.createArticulo$());

  createArticulo(articulo: Articulos): void {
    this.http.post<Articulos>(`${environment.API_URL}/articulos`, articulo)
      .subscribe({
        next: createdArticulo => this.createArticulo$.set(State.Builder<Articulos>().forSuccess(createdArticulo)),
        error: err => this.createArticulo$.set(State.Builder<Articulos>().forError(err)),
      });
  }

  getArticulos(): Observable<Articulos[]> {
    return this.http.get<Articulos[]>(`${environment.API_URL}/articulos`)
  }

  getArticuloById(id: number): Observable<Articulos> {
    return this.http.get<Articulos>(`${environment.API_URL}/articulos/${id}`);
  }

  // Verificar si el nombre del artículo ya existe
  checkArticuloByName(nombre: string): Observable<boolean> {
    const params = new HttpParams().set('nombre', nombre);  // Se agrega el parámetro 'nombre'
    return this.http.get<boolean>(`${environment.API_URL}/articulos/check-nombre`, { params });
  }

  updateArticulo(articulo: Articulos): Observable<Articulos> {
    return this.http.put<Articulos>(`${environment.API_URL}/articulos/${articulo.id}`, articulo);
  }
}
