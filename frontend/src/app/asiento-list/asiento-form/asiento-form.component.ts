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

  cargarCuentas(): void {
    this.cuentaService.getCuentas().subscribe(cuentas => {
      this.cuentas = cuentas; // Ajusta según la estructura de respuesta de tu API
    });
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
    if (this.isEditMode) {
      this.asientoService.updateAsiento(this.asiento);
    } else {
      this.asientoService.createAsiento(this.asiento);
    }
  }
}
