import {Component, inject, Input} from '@angular/core';
import {Cuenta} from "../../models/cuenta.model";
import {AuthService} from "../../core/auth/auth.service";
import {RouterLink} from "@angular/router";
import {CuentaService} from "../../services/cuenta.service";

@Component({
  selector: 'app-cuenta-item',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './cuenta-item.component.html',
  styleUrl: './cuenta-item.component.css'
})
export class CuentaItemComponent {

  @Input() cuenta: Cuenta | undefined; // Entrada para cada cuenta
  @Input() level: number = 0; // Nivel de jerarquía, para la indentación
  authService = inject(AuthService);

  constructor(
    private cuentaService: CuentaService,
    // private toastr: ToastrService  // Opcional para notificaciones
  ) {}

  // Método para eliminar cuenta
  deleteCuenta(cuenta: Cuenta): void {
    this.cuentaService.deleteCuenta(cuenta.id!);
  }
}
