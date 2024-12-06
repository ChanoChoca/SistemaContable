import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {Cuenta} from "../../models/cuenta.model";
import {AuthService} from "../../core/auth/auth.service";
import {Router, RouterLink} from "@angular/router";
import {CuentaService} from "../../services/cuenta.service";
import {CuentaAsientoService} from "../../services/cuenta-asiento.service";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-cuenta-item',
  standalone: true,
  imports: [
    RouterLink,
    NgClass
  ],
  templateUrl: './cuenta-item.component.html',
  styleUrl: './cuenta-item.component.css'
})
export class CuentaItemComponent {
  @Input() cuenta: Cuenta | undefined;
  @Input() level: number = 0;
  @Output() cuentaEliminada = new EventEmitter<Cuenta>(); // Emite la cuenta eliminada
  @Input() parentPrefix: string = '';

  authService = inject(AuthService);

  constructor(
    private cuentaService: CuentaService,
    private cuentaAsientoService: CuentaAsientoService,
    private router: Router
  ) {}

  getNumeroCuenta(prefix: string, cuenta: Cuenta | undefined): string {
    if (!cuenta) return '';
    const numeroActual = cuenta.codigo ? cuenta.codigo.toString() : '';
    return prefix ? `${prefix}.${numeroActual}` : numeroActual;
  }


  // Función para eliminar la cuenta
  deleteCuenta(cuenta: Cuenta): void {
    if (!confirm(`¿Está seguro de que desea eliminar la cuenta ${cuenta.nombre}?`)) {
      return;
    }

    this.cuentaAsientoService.checkCuentaAsientos(cuenta.id!).subscribe({
      next: (hasAsientos) => {
        if (hasAsientos) {
          // Si tiene asientos, desactivar la cuenta
          this.cuentaService.deactivateCuenta(cuenta.id!).subscribe({
            next: () => {
              alert(`La cuenta ${cuenta.nombre} no se puede eliminar físicamente porque está siendo referenciada en asientos, ha sido desactivada.`);
              // this.getCuentas(); // Refrescar la lista si es necesario
            },
            error: (err) => {
              console.error('Error al desactivar la cuenta:', err);
              alert('Ocurrió un error al desactivar la cuenta.');
            }
          });
        } else {
          // Si no tiene asientos, verificar subcuentas
          if (cuenta.subCuentas && cuenta.subCuentas.length > 0) {
            // Eliminación lógica si tiene subcuentas
            this.cuentaService.deactivateCuenta(cuenta.id!).subscribe({
              next: () => {
                alert(`La cuenta ${cuenta.nombre} tiene subcuentas y ha sido desactivada.`);
                // this.getCuentas(); // Refrescar la lista si es necesario
              },
              error: (err) => {
                console.error('Error al desactivar la cuenta:', err);
                alert('Ocurrió un error al desactivar la cuenta.');
              }
            });
          } else {
            // Eliminación física si no tiene asientos ni subcuentas
            this.cuentaService.deleteCuenta(cuenta.id!).subscribe({
              next: () => {
                alert(`La cuenta ${cuenta.nombre} ha sido eliminada físicamente.`);
                // this.getCuentas(); // Refrescar la lista si es necesario
              },
              error: (err) => {
                console.error('Error al eliminar la cuenta:', err);
                alert('Ocurrió un error al eliminar la cuenta.');
              }
            });
          }
        }
      },
      error: (err) => {
        console.error('Error al verificar asientos:', err);
        alert('Ocurrió un error al verificar si la cuenta tiene asientos.');
      }
    });
  }

  // Función para modificar la cuenta
  editCuenta(cuenta: Cuenta): void {
    if (!confirm(`¿Está seguro de que desea modificar la cuenta ${cuenta.nombre}?`)) {
      return;
    }

    this.cuentaAsientoService.checkCuentaAsientos(cuenta.id!).subscribe({
      next: (hasAsientos) => {
        if (hasAsientos) {
          alert(`La cuenta ${cuenta.nombre} no se puede modificar porque está siendo referenciada en asientos.`);
        } else {
          this.router.navigate(['/cuenta/edit', cuenta.id]);
        }
      },
      error: (err) => {
        console.error('Error al verificar si la cuenta tiene asientos:', err);
        alert('Ocurrió un error al verificar si la cuenta tiene asientos.');
      }
    });
  }
}
