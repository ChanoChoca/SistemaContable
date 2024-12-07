import {Component, inject, OnInit} from '@angular/core';
import {Ventas} from "../models/ventas";
import {RouterLink} from "@angular/router";
import {AuthService} from "../core/auth/auth.service";

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent implements OnInit {
  ventas: Ventas[] = [];
  estados = ['Pendiente', 'Pagada', 'Anulada'];
  authService = inject(AuthService);

  constructor() {}

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.ventas = JSON.parse(localStorage.getItem('ventas') || '[]');
  }

  verFactura(id: number): void {
    console.log(`Ver factura con ID: ${id}`);
  }

  onVentaRegistrada(nuevaVenta: Ventas): void {
    this.ventas.push(nuevaVenta);
  }
}
