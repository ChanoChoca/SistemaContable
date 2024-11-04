import { Injectable } from '@angular/core';
import {Message} from "primeng/api";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  // Estado inicial de los mensajes de toast
  INIT_STATE = "INIT";

  // Crea un BehaviorSubject con un mensaje de estado inicial
  private send$ = new BehaviorSubject<Message>({ summary: this.INIT_STATE });

  // Convierte el BehaviorSubject en un Observable que otros componentes pueden suscribirse
  sendSub = this.send$.asObservable();

  // Método para enviar un nuevo mensaje de toast
  public send(message: Message): void {
    // Emite el nuevo mensaje a todos los suscriptores
    this.send$.next(message);
  }
}
