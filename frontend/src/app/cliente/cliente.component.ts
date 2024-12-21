import {Component, inject, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {VentasService} from "../services/ventas.service";
import {AuthService} from "../core/auth/auth.service";
import {Ventas} from "../models/ventas";
import {UserService} from "../services/user.service";
import {User} from "../core/model/user.model";
import {faDownload} from "@fortawesome/free-solid-svg-icons/faDownload";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {Pagos} from "../models/pagos";
import {PagosService} from "../services/pagos.service";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [
    FormsModule,
    FaIconComponent,
    RouterLink
  ],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css'
})
export class ClienteComponent implements OnInit {
  authService = inject(AuthService);
  userEmail = this.authService.getAuthenticatedUserEmail(); // Usuario autenticado
  ventas: Ventas[] = [];
  user: User | undefined;
  pagosFiltrados: { [ventaId: number]: Pagos[] } = {};
  pagos: Pagos[] = []

  constructor(private ventasService: VentasService,
              private userService: UserService,
              private pagosService: PagosService) {
  }

  ngOnInit() {
    this.cargarVentas();
    this.cargarPagos();
  }

  cargarVentas() {
    this.userService.getUserByEmail(this.userEmail).subscribe(user => {
      this.user = user;
    });
    this.ventasService.getVentasByClienteEmail(this.userEmail).subscribe(ventas => {
      this.ventas = ventas;
    })
  }

  cargarPagos(): void {
    this.pagosService.getPagos().subscribe({
      next: (pagos) => {
        this.pagos = pagos;
        this.pagos.forEach((pago) => {
          const ventaId = pago.venta?.id;
          if (ventaId) {
            if (!this.pagosFiltrados[ventaId]) {
              this.pagosFiltrados[ventaId] = [];
            }
            this.pagosFiltrados[ventaId].push(pago);
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar los pagos', err);
      }
    });
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  //TODO: imprimir con npm i @afipsdk/afip.js
  //Existen facturas A, B, C, M, E, T

  protected readonly faDownload = faDownload;
}
