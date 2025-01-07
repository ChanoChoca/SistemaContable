import {Component, inject, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {CuentaAsiento} from "../../models/cuenta-asiento.model";
import {Asiento} from "../../models/asiento.model";
import {Cuenta} from "../../models/cuenta.model";
import {CuentaService} from "../../services/cuenta.service";
import {AsientoService} from "../../services/asiento.service";
import {CuentaAsientoService} from "../../services/cuenta-asiento.service";
import {AuthService} from "../../core/auth/auth.service";
import {Router} from "@angular/router";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faXmark} from "@fortawesome/free-solid-svg-icons/faXmark";
import {UserService} from "../../services/user.service";
import {User} from "../../core/model/user.model";

@Component({
  selector: 'app-asiento-form',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FaIconComponent
  ],
  templateUrl: './asiento-form.component.html',
  styleUrl: './asiento-form.component.css'
})

export class AsientoFormComponent implements OnInit {
  asientoForm: FormGroup;
  cuentasDisponibles: Cuenta[] = [];
  fechaMinima: string = '';
  fechaMaxima: string = '';
  montosExcedenSaldo: boolean = false;
  saldosExcedidos: { [idCuenta: number]: boolean } = {};
  authService = inject(AuthService);
  asientoId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private cuentaService: CuentaService,
    private asientoService: AsientoService,
    private cuentaAsientoService: CuentaAsientoService,
    private usuarioService: UserService,
    private router: Router
  ) {
    this.asientoForm = this.fb.group({
      fecha: ['', [Validators.required, this.fechaValida.bind(this)]],
      descripcion: ['', Validators.required],
      cuentas: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.cargarCuentas();
    this.obtenerUltimaFechaAsiento();
    this.fechaMaxima = new Date().toISOString().split('T')[0];

    // Escuchar cambios en el FormArray para validar saldos
    this.cuentas.valueChanges.subscribe(() => this.verificarSaldos());
  }

  cargarCuentas() {
    this.cuentaService.getCuentas().subscribe((cuentas) => {
      this.cuentasDisponibles = cuentas.filter(cuenta =>
        (cuenta.activa && (!cuenta.subCuentas || cuenta.subCuentas.length === 0))
      );
      console.log(cuentas);
    });
  }

  obtenerUltimaFechaAsiento() {
    this.asientoService.getUltimaFechaAsiento().subscribe((ultimaFecha: Date) => {
      this.fechaMinima = new Date(ultimaFecha).toISOString().split('T')[0];
    });
  }

  fechaValida(control: FormControl) {
    const fechaSeleccionada = new Date(control.value).getTime();
    const fechaMin = new Date(this.fechaMinima).getTime();
    const fechaMax = new Date(this.fechaMaxima).getTime();

    if (fechaSeleccionada < fechaMin || fechaSeleccionada > fechaMax) {
      return { fechaInvalida: true };
    }
    return null;
  }

  get cuentas() {
    return this.asientoForm.get('cuentas') as FormArray;
  }

  agregarCuenta() {
    const cuentaGroup = this.fb.group({
      idCuenta: ['', Validators.required],
      debe: [0, [Validators.required, Validators.min(0)]],
      haber: [0, [Validators.required, Validators.min(0)]]
    });
    this.cuentas.push(cuentaGroup);
  }

  eliminarCuenta(i: number) {
    this.cuentas.removeAt(i);
    this.verificarSaldos();
  }

  verificarSaldos() {
    this.montosExcedenSaldo = false;
    this.saldosExcedidos = {};

    const cuentaMontos: { [idCuenta: number]: number } = {};

    this.cuentas.controls.forEach((control) => {
      const idCuenta = control.get('idCuenta')?.value;
      const debe = control.get('debe')?.value || 0;
      const haber = control.get('haber')?.value || 0;

      if (idCuenta) {
        if (!cuentaMontos[idCuenta]) {
          cuentaMontos[idCuenta] = 0;
        }

        cuentaMontos[idCuenta] -= debe;
        cuentaMontos[idCuenta] += haber;
      }
    });

    for (const idCuenta in cuentaMontos) {
      const cuentaSeleccionada = this.cuentasDisponibles.find((cuenta) => cuenta.id === +idCuenta);
      if (cuentaSeleccionada) {
        const saldoActual = cuentaSeleccionada.saldoActual;
        const saldoRestante = saldoActual - cuentaMontos[idCuenta];

        if (saldoRestante < 0) {
          this.montosExcedenSaldo = true;
          this.saldosExcedidos[+idCuenta] = true;
        }
      }
    }
  }

  isFormInvalid(): boolean {
    const invalidForm = this.asientoForm.invalid || this.montosExcedenSaldo;

    const allCuentasEmpty = this.cuentas.controls.every(control => {
      const debe = control.get('debe')?.value || 0;
      const haber = control.get('haber')?.value || 0;
      return debe === 0 && haber === 0;
    });

    return invalidForm || (this.cuentas.length > 0 && allCuentasEmpty);
  }

  async onSubmit() {
    if (this.asientoForm.valid && !this.montosExcedenSaldo) {
      const usuario: User | undefined = await this.usuarioService.getUserByEmail(this.authService.getAuthenticatedUserEmail()).toPromise();
      // Crear el objeto Asiento
      const asiento: Asiento = {
        fecha: new Date(this.asientoForm.value.fecha),
        descripcion: this.asientoForm.value.descripcion,
        usuario: usuario!
      };

      // Si no hay cuentas, solo crear el asiento
      if (this.cuentas.length === 0) {
        this.asientoService.createAsiento(asiento);
        this.router.navigate(['/asientos']);
        return;
      }

      // Mapear las cuentas afectadas
      const cuentasAfectadas: CuentaAsiento[] = this.asientoForm.value.cuentas.map((cuenta: any) => {
        const cuentaEncontrada = this.cuentasDisponibles.find(c => c.id === +cuenta.idCuenta);
        return {
          id: undefined,
          cuenta: cuentaEncontrada!,
          debe: cuenta.debe,
          haber: cuenta.haber,
          saldo: 0
        };
      });

      // Procesar las cuentas de forma secuencial
      for (const cuentaAfectada of cuentasAfectadas) {
        if (cuentaAfectada.debe > 0) {
          cuentaAfectada.saldo = cuentaAfectada.cuenta.saldoActual + cuentaAfectada.debe;
        } else {
          cuentaAfectada.saldo = cuentaAfectada.cuenta.saldoActual - cuentaAfectada.haber;
        }

        // Actualizar saldo en el backend de forma secuencial
        try {
          await this.cuentaService.actualizarSaldoCuenta(cuentaAfectada.cuenta.id!, cuentaAfectada.saldo).toPromise();
          console.log(`Saldo actualizado para la cuenta ${cuentaAfectada.cuenta.nombre}`);
        } catch (error) {
          console.error(`Error al actualizar el saldo para la cuenta ${cuentaAfectada.cuenta.nombre}:`, error);
        }
      }

      // Crear las CuentasAsiento después de actualizar los saldos
      this.cuentaAsientoService.crearCuentasAsiento(asiento, cuentasAfectadas);
      this.router.navigate(['/asientos']);
    }
  }

  protected readonly faXmark = faXmark;
}
