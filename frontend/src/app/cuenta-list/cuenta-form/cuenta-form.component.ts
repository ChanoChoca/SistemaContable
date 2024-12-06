import {Component, OnInit} from '@angular/core';
import {Cuenta} from "../../models/cuenta.model";
import {CuentaService} from "../../services/cuenta.service";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {faXmark} from "@fortawesome/free-solid-svg-icons/faXmark";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-cuenta-form',
  standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        FaIconComponent
    ],
  templateUrl: './cuenta-form.component.html',
  styleUrl: './cuenta-form.component.css'
})
export class CuentaFormComponent implements OnInit {
  accountForm: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  cuentas: Cuenta[] = [];
  isCodigoExistente: boolean = false;
  cuentaPadreSaldoInvalido: boolean = false;
  isSaldoDisabled: boolean = false;
  cuentaId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private cuentaService: CuentaService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.accountForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      codigo: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      tipo: ['', Validators.required],
      cuentaPadre: [null],
      subcuentas: [],
      saldoActual: [0, [Validators.required, Validators.min(0)]],
      activa: true,
    });
  }

  ngOnInit(): void {
    // Obtener el ID de la cuenta desde la ruta
    this.cuentaId = this.route.snapshot.paramMap.get('id') ? +this.route.snapshot.paramMap.get('id')! : null;

    // Si hay un ID, obtener la cuenta para editarla
    if (this.cuentaId) {
      this.cuentaService.getCuentaById(this.cuentaId).subscribe((cuenta) => {
        this.accountForm.patchValue(cuenta); // Cargar los datos en el formulario

        // Validar si tiene subcuentas y deshabilitar el saldo si es necesario
        if (cuenta.subCuentas && cuenta.subCuentas.length > 0) {
          this.isSaldoDisabled = true;
          this.accountForm.get('saldoActual')?.disable();
        }

        // Asegurar que subcuentas sea un array
        this.accountForm.get('subcuentas')?.setValue(cuenta.subCuentas || []);
      });
    }

    this.cuentaService.getCuentas().subscribe((cuentas) => {
      this.cuentas = cuentas;
    });

    // Verificar cambios en el código de cuenta
    this.accountForm.get('codigo')?.valueChanges.subscribe((codigo) => {
      this.checkCodigoExistente(codigo);
    });

    // Verificar cambios en la cuenta padre
    this.accountForm.get('cuentaPadre')?.valueChanges.subscribe((cuentaPadre) => {
      this.checkCuentaPadreSaldo(cuentaPadre);
    });
  }

  checkCodigoExistente(codigo: string): void {
    // Si se está editando una cuenta y el código es el mismo que el almacenado, no mostrar error
    if (this.cuentaId) {
      const cuentaActual = this.cuentas.find((cuenta) => cuenta.id === this.cuentaId);

      // Si el código es el mismo que el almacenado en la cuenta actual, no marcar como existente
      if (cuentaActual && cuentaActual.codigo === codigo) {
        this.isCodigoExistente = false;
        return;
      }
    }

    // Si estamos creando una cuenta nueva o el código es diferente, verificar duplicados
    this.isCodigoExistente = this.cuentas.some((cuenta) => cuenta.codigo === codigo);
  }

  // Verifica si una cuenta es una subcuenta en una jerarquía recursiva
  checkIfCuentaEsSubcuenta(cuenta: Cuenta, cuentaPadre: Cuenta | null): boolean {
    if (!cuentaPadre) {
      return false;
    }

    // Verificar si la cuentaPadre es la cuenta actual
    if (cuentaPadre.id === cuenta.id) {
      return true;
    }

    // Recursión para verificar si alguna subcuenta es la cuenta a modificar
    return cuentaPadre.subCuentas?.some((subCuenta) => this.checkIfCuentaEsSubcuenta(cuenta, subCuenta)) || false;
  }

  checkCuentaPadreSaldo(cuentaPadre: Cuenta | null): void {
    if (cuentaPadre) {
      // Caso 1: Validar si la cuenta seleccionada como padre es la misma cuenta que se está editando.
      if (this.cuentaId && cuentaPadre.id === this.cuentaId) {
        this.errorMessage = 'La cuenta no puede ser su propio padre.';
        this.cuentaPadreSaldoInvalido = true;
        return;
      }

      // Caso 2: Verificar si la cuenta seleccionada como padre es una subcuenta de la cuenta que se está editando.
      const cuentaActual = this.cuentas.find((cuenta) => cuenta.id === this.cuentaId);
      if (cuentaActual && this.checkIfCuentaEsSubcuenta(cuentaActual, cuentaPadre)) {
        this.errorMessage = 'No puedes seleccionar una subcuenta como cuenta padre.';
        this.cuentaPadreSaldoInvalido = true;
        return;
      }

      // Caso 3: Validar si la cuenta padre tiene un saldo diferente de 0 o null
      if (cuentaPadre.saldoActual !== 0 && cuentaPadre.saldoActual !== null) {
        this.errorMessage = 'La cuenta padre seleccionada debe tener un saldo de 0 o null.';
        this.cuentaPadreSaldoInvalido = true;
        return;
      }
    }

    // Si pasa todas las validaciones, limpiar errores
    this.errorMessage = null;
    this.cuentaPadreSaldoInvalido = false;
  }

  onSubmit(): void {
    // Si tiene subcuentas, no permitir modificar el saldo
    if (this.isSaldoDisabled) {
      this.accountForm.get('saldoActual')?.setValue(0); // Asegura que el saldo no se modifique
    }

    // Asegurarse de que el saldoActual no sea null antes de enviar los datos
    const saldoActual = this.accountForm.get('saldoActual')?.value ?? 0;  // Usar 0 si es null

    if (
      this.accountForm.valid &&
      !this.isCodigoExistente &&
      !this.cuentaPadreSaldoInvalido
    ) {
      const nuevaCuenta: Cuenta = {
        ...this.accountForm.value,
        saldoActual, // Asegurarse de enviar el saldo como 0 si es null
        subcuentas: [], // Asegúrate de enviar un arreglo vacío para subcuentas
      };

      // Asegurarse de convertir el ID en un número válido antes de enviarlo
      if (this.cuentaId !== null) {
        nuevaCuenta.id = Number(this.cuentaId); // Convertir a número si es necesario
      }

      if (this.cuentaId) {
        // Si estamos editando, actualizamos la cuenta
        this.cuentaService.updateCuenta(nuevaCuenta);
        this.successMessage = 'Cuenta actualizada correctamente';
        this.router.navigate(['/cuentas']);
      } else {
        // Si estamos creando, creamos la cuenta
        this.cuentaService.createCuenta(nuevaCuenta);
        this.successMessage = 'Cuenta creada correctamente';
        this.router.navigate(['/cuentas']);
      }
    } else {
      this.errorMessage = 'Hay un error en el formulario, revisa los campos.';
    }
  }

    protected readonly faXmark = faXmark;
}
