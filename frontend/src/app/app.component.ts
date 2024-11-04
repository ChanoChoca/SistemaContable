import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from "primeng/button";
import { FaIconLibrary, FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { fontAwesomeIcons } from "./shared/font-awesome-icons";
import { NavbarComponent } from "./layout/navbar/navbar.component";
import { ToastModule } from "primeng/toast";
import { ToastService } from "./layout/toast.service";
import { MessageService } from "primeng/api";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ButtonModule, FontAwesomeModule, NavbarComponent, ToastModule],
  providers: [MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  // Inyecta la librería de iconos FontAwesome
  faIconLibrary = inject(FaIconLibrary);

  // Variable que indica si se está en la vista de listados
  isListingView = true;

  // Inyecta el servicio de Toast personalizado
  toastService = inject(ToastService);

  // Inyecta el servicio de mensajes de PrimeNG
  messageService = inject(MessageService);

  title = 'front'

  // Método llamado al inicializar el componente
  ngOnInit(): void {
    this.initFontAwesome();  // Inicializa FontAwesome
    this.listenToastService();  // Configura el servicio de Toast
  }

  // Método para inicializar los iconos de FontAwesome
  private initFontAwesome() {
    this.faIconLibrary.addIcons(...fontAwesomeIcons);
  }

  // Método para escuchar los mensajes del servicio de Toast
  private listenToastService() {
    this.toastService.sendSub.subscribe({
      next: newMessage => {
        // Si el mensaje no es nulo y no es el estado inicial
        if(newMessage && newMessage.summary !== this.toastService.INIT_STATE) {
          this.messageService.add(newMessage);  // Agrega el mensaje al servicio de mensajes
        }
      }
    })
  }
}
