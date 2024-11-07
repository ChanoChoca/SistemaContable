import {Component, inject, OnInit} from '@angular/core';
import {CuentaService} from '../services/cuenta.service';
import { Cuenta } from '../models/cuenta.model';
import {FormsModule} from "@angular/forms";
import {AuthService} from "../core/auth/auth.service";
import {Page} from "../models/page.model";
import {RouterLink} from "@angular/router";
import {CuentaItemComponent} from "./cuenta-item/cuenta-item.component";
// import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cuenta-list',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    CuentaItemComponent
  ],
  templateUrl: './cuenta-list.component.html',
  styleUrl: './cuenta-list.component.css'
})
export class CuentaListComponent implements OnInit {
  cuentas: Cuenta[] = [];
  nombre: string = "";
  currentPage: number = 0;
  pageSize: number = 3;
  totalPages: number = 0;
  authService = inject(AuthService);

  constructor(
    private cuentaService: CuentaService,
    // private toastr: ToastrService  // Opcional para notificaciones
  ) {}

  ngOnInit(): void {
    this.getCuentas();
  }

  getCuentas(): void {
    this.cuentaService.getAllCuentasTree(this.currentPage, this.pageSize, this.nombre)
      .subscribe((data: Page<Cuenta>) => {
        this.cuentas = data.content;
        this.totalPages = data.page.totalPages;
      });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.getCuentas();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.getCuentas();
  }

  clearFilters(): void {
    this.nombre = '';
    this.onSearch();
  }

  deleteCuenta(cuenta: Cuenta): void {
    this.cuentaService.deleteCuenta(cuenta.id!);
  }

  hasRoleAdmin(): boolean {
    return this.authService.hasAnyAuthority("ROL_ADMIN");
  }
}
