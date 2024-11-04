import {Component, inject, OnInit} from '@angular/core';
import { AsientoService } from '../services/asiento.service';
import { AsientoContable } from '../models/asiento.model';
import {DatePipe} from "@angular/common";
import {RouterLink} from "@angular/router";
import {AuthService} from "../core/auth/auth.service";
import {Page} from "../models/page.model";
// import { ToastrService } from 'ngx-toastr'; // Para notificaciones, opcional

@Component({
  selector: 'app-asiento-list',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink
  ],
  templateUrl: './asiento-list.component.html',
  styleUrl: './asiento-list.component.css'
})
export class AsientoListComponent implements OnInit {
  asientos: AsientoContable[] = [];
  currentPage: number = 0;
  pageSize: number = 3;
  totalPages: number = 0;
  authService = inject(AuthService);

  constructor(
    private asientoService: AsientoService,
    // private toastr: ToastrService  // Opcional para notificaciones
  ) {}

  ngOnInit(): void {
    this.getAsientos();
  }

  // Cargar todos los asientos
  getAsientos(): void {
    this.asientoService.getAllAsientos(this.currentPage, this.pageSize)
      .subscribe((data: Page<AsientoContable>) => {
        this.asientos = data.content;
        this.totalPages = data.page.totalPages;
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.getAsientos();
  }

  // Eliminar asiento por ID
  deleteAsiento(asiento: AsientoContable): void {
    if (confirm("¿Estás seguro de que deseas eliminar este asiento?")) {
      this.asientoService.deleteAsiento(asiento.id!);
    }
  }

  hasRoleAdmin(): boolean {
    return this.authService.hasAnyAuthority("ROL_ADMIN");
  }
}
