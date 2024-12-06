import {Component, inject, OnInit} from '@angular/core';
import { AsientoService } from '../services/asiento.service';
import {DatePipe, NgClass} from "@angular/common";
import {RouterLink} from "@angular/router";
import {AuthService} from "../core/auth/auth.service";
import {Page} from "../models/page.model";
import {Asiento} from "../models/asiento.model";
import {CuentaAsientoService} from "../services/cuenta-asiento.service";
// import { ToastrService } from 'ngx-toastr'; // Para notificaciones, opcional

@Component({
  selector: 'app-asiento-list',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    NgClass
  ],
  templateUrl: './asiento-list.component.html',
  styleUrl: './asiento-list.component.css'
})
export class AsientoListComponent implements OnInit {
  asientos: Asiento[] = [];
  currentPage: number = 0;
  pageSize: number = 3;
  totalPages: number = 0;
  authService = inject(AuthService);

  constructor(
    private asientoService: AsientoService,
    private cuentaAsientoService: CuentaAsientoService
  ) {}

  ngOnInit(): void {
    this.getAsientos();
  }

  getAsientos(): void {
    this.asientoService.getAllAsientos(this.currentPage, this.pageSize)
      .subscribe((data: any) => {
        this.asientos = data.content;
        this.totalPages = data.page.totalPages;
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.getAsientos();
  }

  // Eliminar asiento por ID con validación de CuentaAsiento
  deleteAsiento(asiento: Asiento): void {
    // Verificar si el asiento tiene CuentaAsiento asociado
    this.cuentaAsientoService.checkIfCuentaAsientoExists(asiento.id!)
      .subscribe((exists: boolean) => {
        if (exists) {
          alert('No puedes eliminar este asiento, ya tiene cuentas asociadas.');
        } else {
          if (confirm('¿Estás seguro de que deseas eliminar este asiento?')) {
            this.asientoService.deleteAsiento(asiento.id!);
            alert('Asiento eliminado exitosamente');
            this.getAsientos();
          }
        }
      });
  }
}
