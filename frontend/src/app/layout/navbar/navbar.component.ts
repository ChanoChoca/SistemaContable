import {Component, effect, inject, OnDestroy, OnInit} from '@angular/core';
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
import {faDownload} from "@fortawesome/free-solid-svg-icons/faDownload";
import {faXmark} from "@fortawesome/free-solid-svg-icons/faXmark";

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
export class NavbarComponent implements OnInit, OnDestroy {
  isAsideMenuOpen = false; // Controla la visibilidad del menú desplegable
  isDesktopView = window.innerWidth > 1024; // Detecta si es vista de escritorio
  private readonly resizeObserver: (() => void) | undefined;

  // Servicios inyectados
  authService = inject(AuthService);
  toastService = inject(ToastService);

  login = () => this.authService.login();
  logout = () => this.authService.logout();

  currentMenuItems: MenuItem[] | undefined = [];
  connectedUser: User = { email: this.authService.notConnected };

  constructor() {
    effect(() => {
      if (this.authService.fetchUser().status === "OK") {
        this.connectedUser = this.authService.fetchUser().value!;
        this.currentMenuItems = this.fetchMenu();
      }
    });

    // Escucha el evento de cambio de tamaño de pantalla
    this.resizeObserver = this.listenToResize();
  }

  ngOnInit(): void {
    this.authService.fetch(false);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver();
    }
  }

  toggleAsideMenu(): void {
    this.isAsideMenuOpen = !this.isAsideMenuOpen;
  }

  private fetchMenu(): MenuItem[] {
    if (this.authService.hasRoleClient()) {
      return [
        { label: "Mi cuenta",
          style: {
          padding: '12px 24px',
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: 'white'
          },
          command: () => (window.location.href = "/cliente") },
        { label: "Log out",
          style: {
          padding: '12px 24px',
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: 'white'
          },
          command: this.logout },
      ];
    } else if (this.authService.isAuthenticated()) {
      return [
        { label: "Log out",
          style: {
          padding: '12px 24px',
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: 'white'
          },
          command: this.logout },
      ];
    } else {
      return [
        { label: "Sign up",
          style: {
          padding: '12px 24px',
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: 'white'
          },
          command: this.login },
        { label: "Log in",
          style: {
          padding: '12px 24px',
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: 'white'
          },
          command: this.login },
      ];
    }
  }

  private listenToResize(): () => void {
    const onResize = () => {
      this.isDesktopView = window.innerWidth > 1024;
    };
    window.addEventListener('resize', onResize);
    onResize(); // Llama inmediatamente para establecer el estado inicial
    return () => window.removeEventListener('resize', onResize); // Limpia el evento
  }

  protected readonly faDownload = faDownload;
  protected readonly faXmark = faXmark;
}
