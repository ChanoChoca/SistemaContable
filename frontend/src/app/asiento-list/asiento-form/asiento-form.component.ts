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
  nuevoMovimiento: MovimientoContable = { descripcion: '', cuenta: null!, asiento: null!, monto: 0, esDebito: true };

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
    this.asiento.movimientos.push({ ...this.nuevoMovimiento }); // Agrega el movimiento al array de movimientos del asiento
    // Resetea el movimiento para permitir agregar uno nuevo
    this.nuevoMovimiento = { descripcion: '', cuenta: null!, asiento: null!, monto: 0, esDebito: true };
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

    // Validar que todos los campos requeridos estén llenos
    if (!this.asiento.fecha) {
      alert('Complete todos los campos antes de enviar.');
      return;
    }

    if (this.isEditMode) {
      this.asientoService.updateAsiento(this.asiento);
    } else {
      this.asientoService.createAsiento(this.asiento);
    }
  }
}
