import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {Cuenta} from "../../models/cuenta.model";
import {AuthService} from "../../core/auth/auth.service";
import {Router, RouterLink} from "@angular/router";
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
  @Input() cuenta: Cuenta | undefined;
  @Input() level: number = 0;
  @Output() cuentaEliminada = new EventEmitter<Cuenta>();  // Emite la cuenta eliminada
  authService = inject(AuthService);

  constructor(
    private cuentaService: CuentaService,
    private router: Router
  ) {}

  deleteCuenta(cuenta: Cuenta): void {
    this.cuentaService.deleteCuenta(cuenta.id!).subscribe({
      next: () => {
        alert('Cuenta eliminada exitosamente');
        this.cuentaEliminada.emit(cuenta);  // Emitir la cuenta eliminada
      },
      error: (err) => {
        alert('Error al eliminar la cuenta');
      },
    });
  }
}
