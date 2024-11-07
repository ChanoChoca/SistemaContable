import {Component, OnInit} from '@angular/core';
import {Cuenta} from "../../models/cuenta.model";
import {CuentaService} from "../../services/cuenta.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-cuenta-form',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './cuenta-form.component.html',
  styleUrl: './cuenta-form.component.css'
})
export class CuentaFormComponent implements OnInit {
  cuenta: Cuenta = { nombre: '', codigo: '', saldo: 0, cuentaPadre: null, subCuentas: undefined, activa: true, eliminada: false}
  cuentas: Cuenta[] = [];
  isEditMode = false;
  constructor(
    private cuentaService: CuentaService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    // Cargar lista de todas las cuentas para los selectores de cuenta padre y subcuentas
    this.cargarCuentas();

    // Verificar si es modo edición
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.cuentaService.getCuentaById(id).subscribe(cuenta => {
          this.cuenta = cuenta;
        });
      }
    });
  }

  // Método para cargar todas las cuentas disponibles
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

  onSubmit(): void {
    // Verificar que subCuentas esté en el formato correcto
    if (!this.cuenta.subCuentas || this.cuenta.subCuentas.length === 0) {
      this.cuenta.subCuentas = []; // Asegurar que se envíe como un array vacío
    }

    if (this.isEditMode) {
      this.cuentaService.updateCuenta(this.cuenta);
    } else {
      this.cuentaService.createCuenta(this.cuenta);
    }
  }
}
