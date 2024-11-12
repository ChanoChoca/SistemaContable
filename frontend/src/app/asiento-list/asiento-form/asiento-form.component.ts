import {Component, inject, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {AsientoContable} from "../../models/asiento.model";
import {AsientoService} from "../../services/asiento.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MovimientoContable} from "../../models/movimiento.model";
import {AuthService} from "../../core/auth/auth.service";
import {Cuenta} from "../../models/cuenta.model";
import {CuentaService} from "../../services/cuenta.service";

@Component({
  selector: 'app-asiento-form',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './asiento-form.component.html',
  styleUrl: './asiento-form.component.css'
})
export class AsientoFormComponent implements OnInit {
  asiento: AsientoContable = { fecha: new Date(), usuarioEmail: '', movimientos: [] };
  isEditMode = false;
  cuentas: Cuenta[] = []; // Lista de cuentas para seleccionar
  usuarioEmail: string = ''; // Email del usuario autenticado
  nuevoMovimiento: MovimientoContable = { descripcion: '', cuenta: null!, asiento: null!, monto: 0, tipoMovimiento: '+A' };

  constructor(
    private asientoService: AsientoService,
    private cuentaService: CuentaService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarCuentas();
    this.asiento.usuarioEmail = this.authService.getAuthenticatedUserEmail();
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.asientoService.getAsientoById(id).subscribe(asiento => {
          this.asiento = asiento;
          this.usuarioEmail = asiento.usuarioEmail;
        });
      }
    });
  }

  // Método para cargar las cuentas
  cargarCuentas(): void {
    this.cuentaService.getCuentas().subscribe(cuentas => {
      this.cuentas = this.flattenCuentas(cuentas); // Aplana la estructura de cuentas con subcuentas
    });
  }

  // Función recursiva para aplanar la estructura de cuentas y subcuentas
  flattenCuentas(cuentas: Cuenta[]): Cuenta[] {
    let result: Cuenta[] = [];

    cuentas.forEach(cuenta => {
      result.push(cuenta); // Agrega la cuenta actual
      if (cuenta.subCuentas && cuenta.subCuentas.length > 0) {
        result = result.concat(this.flattenCuentas(cuenta.subCuentas)); // Llama recursivamente y concatena subcuentas
      }
    });

    return result;
  }

  agregarMovimiento(): void {
    // Validar que todos los campos estén completos antes de agregar el movimiento
    if (
      !this.nuevoMovimiento.descripcion ||
      // Permitir movimientos sin cuenta solo si son de tipo 'R-' o 'R+'
      (!this.nuevoMovimiento.cuenta && !['R-', 'R+'].includes(this.nuevoMovimiento.tipoMovimiento)) ||
      this.nuevoMovimiento.monto <= 0 ||
      !this.nuevoMovimiento.tipoMovimiento
    ) {
      alert('Por favor complete todos los campos requeridos antes de agregar el movimiento.');
      return;
    }

    // Agrega el movimiento al array de movimientos del asiento
    this.asiento.movimientos.push({ ...this.nuevoMovimiento });

    // Resetea el movimiento para permitir agregar uno nuevo
    this.nuevoMovimiento = {
      descripcion: '',
      cuenta: null!, // Permitir movimientos sin cuenta si así lo prefieres
      asiento: null!,
      monto: 0,
      tipoMovimiento: '+A'
    };
  }

  getTipoMovimientoDescripcion(tipo: string): string {
    const descripciones: { [key: string]: string } = {
      '+A': 'Activo Aumenta',
      '-A': 'Activo Disminuye',
      '+P': 'Pasivo Aumenta',
      '-P': 'Pasivo Disminuye',
      'R+': 'Resultado Positivo',
      'R-': 'Resultado Negativo',
      'PN': 'Patrimonio Neto'
    };
    return descripciones[tipo] || 'Desconocido';
  }

  eliminarMovimiento(index: number): void {
    this.asiento.movimientos.splice(index, 1);
  }

  onSubmit(): void {
    // Validar si hay al menos un movimiento agregado
    if (this.asiento.movimientos.length === 0) {
      alert('Debe agregar al menos un movimiento contable.');
      return;
    }

    // Validar que todos los movimientos sean válidos
    for (const movimiento of this.asiento.movimientos) {
      // Permitir movimientos sin cuenta solo si son de tipo 'R-' o 'R+'
      if (!movimiento.cuenta && !['R-', 'R+'].includes(movimiento.tipoMovimiento)) {
        alert('Todos los movimientos deben tener una cuenta asociada, excepto para movimientos de tipo "Resultado Negativo" o "Resultado Positivo".');
        return;
      }
    }

    if (!this.asiento.fecha) {
      this.asientoService.deleteAsientoSig();
      alert('Complete todos los campos antes de enviar.');
      return;
    }

    let esActualizado: boolean;

    if (this.isEditMode) {
      esActualizado = true;
      this.asientoService.updateAsiento(this.asiento);
    } else {
      esActualizado = false;
      this.asientoService.createAsiento(this.asiento);
    }

    // Reaccionar cuando la señal cambie (usando computed)
    if (esActualizado) {
      // Usar un efecto para manejar el estado de éxito o error
      this.asientoService.updateAsientoSig(); // Activa la señal
      // Recargar la lista de cuentas después de actualizar
      this.cargarCuentas();
      // Redirigir o mostrar mensaje de éxito
      alert('Asiento actualizado exitosamente');
      this.router.navigate(['/asientos']);
    } else {
      // Usar un efecto para manejar el estado de éxito o error
      this.asientoService.createAsientoSig(); // Activa la señal
      // Recargar la lista de cuentas después de crear
      this.cargarCuentas();
      // Redirigir o mostrar mensaje de éxito
      alert('Asiento creado exitosamente');
      this.router.navigate(['/asientos']);
    }
  }
}
