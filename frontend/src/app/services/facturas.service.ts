// import {Injectable, signal, WritableSignal} from '@angular/core';
// import {environment} from "../../environments/environment";
// import {HttpClient, HttpEvent} from "@angular/common/http";
// import {State} from "../core/model/state.model";
// import {Observable} from "rxjs";
// import {FacturaResponse} from "../models/facutura-response";
//
// @Injectable({
//   providedIn: 'root'
// })
// export class FacturaService {
//   constructor(private http: HttpClient) {}
//
//   private createFactura$: WritableSignal<State<any>>
//     = signal(State.Builder<any>().forInit());
//   generarFactura(data: any): Observable<FacturaResponse> {
//     return this.http.post<FacturaResponse>(`${environment.API_URL}/facturas/generar`, {params: {data}});
//       // .subscribe({
//       //   next: createdFactura => this.createFactura$.set(State.Builder<any>().forSuccess(createdFactura)),
//       //   error: err => this.createFactura$.set(State.Builder<any>().forError(err)),
//       // });
//   }
// }
