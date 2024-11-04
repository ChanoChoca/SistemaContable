import { Component, input } from '@angular/core';
import { NgClass } from "@angular/common";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [
    NgClass, // Importa NgClass para aplicar clases CSS dinámicas
    FontAwesomeModule // Importa el módulo de FontAwesome para usar íconos
  ],
  templateUrl: './avatar.component.html', // Ruta al archivo de plantilla HTML
  styleUrls: ['./avatar.component.css'] // Ruta al archivo de estilos SCSS
})
export class AvatarComponent {

  // Propiedad para la URL de la imagen del avatar
  imageUrl = input<string>();

  // Propiedad para el tamaño del avatar, puede ser "avatar-sm" o "avatar-xl"
  avatarSize = input<"avatar-sm" | "avatar-xl">();
}
