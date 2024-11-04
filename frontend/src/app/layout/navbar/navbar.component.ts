import { Component, effect, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';
import { DialogService } from 'primeng/dynamicdialog';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../../core/model/user.model';
import { AvatarComponent } from "./avatar/avatar.component";
import { ToastService } from '../toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    ButtonModule,
    FontAwesomeModule,
    ToolbarModule,
    MenuModule,
    AvatarComponent
  ],
  providers: [DialogService],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'] // Asegúrate de que el archivo CSS esté referenciado aquí
})
export class NavbarComponent implements OnInit {

  // Servicios inyectados
  authService = inject(AuthService);
  toastService = inject(ToastService);

  // Métodos para el inicio y cierre de sesión
  login = () => this.authService.login();
  logout = () => this.authService.logout();

  // Menú de navegación actual
  currentMenuItems: MenuItem[] | undefined = [];

  // Usuario conectado
  connectedUser: User = { email: this.authService.notConnected };

  constructor() {
    // Observa los cambios en el estado de autenticación del usuario
    effect(() => {
      if (this.authService.fetchUser().status === "OK") {
        this.connectedUser = this.authService.fetchUser().value!;
        this.currentMenuItems = this.fetchMenu();
      }
    });
  }

  ngOnInit(): void {
    // Fetch el estado de autenticación al iniciar
    this.authService.fetch(false);
  }

  // Construye el menú basado en el estado de autenticación
  private fetchMenu(): MenuItem[] {
    if (this.authService.isAuthenticated()) {
      return [
        {
          label: "Log out",
          style: {
            backgroundColor: '#c3c3c3',
            color: 'white',
            fontWeight: 'bold',
            padding: '10px 17px',
            borderRadius: '5px',
            border: 'none'
          },
          command: this.logout
        }
      ];
    } else {
      return [
        {
          label: "Sign up",
          style: {
            backgroundColor: '#4CAF50',
            color: 'white',
            fontWeight: 'bold',
            padding: '10px 20px',
            borderRadius: '5px',
            border: 'none'
          },
          command: this.login
        },
        {
          label: "Log in",
          style: {
            backgroundColor: '#008CBA',
            color: 'white',
            fontWeight: 'bold',
            padding: '10px 20px',
            borderRadius: '5px',
            border: 'none'
          },
          command: this.login
        }
      ];
    }
  }

  // Verifica si el usuario tiene el rol de "landlord"
  hasRoleAdmin(): boolean {
    return this.authService.hasAnyAuthority("ROL_ADMIN");
  }
}
