import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from "../../core/auth/auth.service";
import {User} from "../../core/model/user.model";
import {Cuotas} from "../../models/cuotas";
import {Cuenta} from "../../models/cuenta.model";
import {Pagos} from "../../models/pagos";
import {CuotasService} from "../../services/cuotas.service";
import {CuentaService} from "../../services/cuenta.service";
import {CuentaAsientoService} from "../../services/cuenta-asiento.service";
import {UserService} from "../../services/user.service";
import {PagosService} from "../../services/pagos.service";
import {Asiento} from "../../models/asiento.model";
import {CuentaAsiento} from "../../models/cuenta-asiento.model";
import {PaginatorModule} from "primeng/paginator";
import {ActivatedRoute} from "@angular/router";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faXmark} from "@fortawesome/free-solid-svg-icons/faXmark";

@Component({
  selector: 'app-cuotas',
  standalone: true,
  imports: [
    PaginatorModule,
    FaIconComponent
  ],
  templateUrl: './cuotas.component.html',
  styleUrl: './cuotas.component.css'
})
export class CuotasComponent implements OnInit {
  authService = inject(AuthService);
  userEmail = this.authService.getAuthenticatedUserEmail(); // Usuario autenticado
  user: User | undefined;
  cuotas: Cuotas[] = []; // Todas las cuotas desde el servicio
  cuentas: Cuenta[] = [];
  cuenta: Cuenta | undefined;
  montoPago: number = 0;
  cuentasExcluidas = ['Deudores por ventas'];
  formasDePago: Pagos[] = [];
  cuotasPendientes: { cuota: Cuotas; numero: number; total: number }[] = []; // Cuotas pendientes con datos adicionales

  constructor(private cuotasService: CuotasService,
              private cuentasService: CuentaService,
              private cuentaAsientoService: CuentaAsientoService,
              private userService: UserService,
              private pagosService: PagosService,
              private route: ActivatedRoute) {}

  // ngOnInit() {
  //   this.cargarCuentas();
  //   this.obtenerCuotasCliente();
  // }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const ventaId = +params['ventaId']; // Convertir a número
      this.obtenerCuotasCliente(ventaId);
      this.cargarCuentas();
    });
  }


  cargarCuentas(): void {
    this.cuentasService.getCuentas().subscribe(cuentas => {
      // Filtrar cuentas activas antes de procesarlas
      const cuentasActivas = cuentas.filter(cuenta => cuenta.activa);
      this.cuentas = this.flattenCuentas(cuentasActivas);
    });
  }

  flattenCuentas(cuentas: Cuenta[]): Cuenta[] {
    const result: Cuenta[] = [];

    const agregarCuentaUnica = (cuenta: Cuenta) => {
      // Verificar si la cuenta es hoja (sin subcuentas)
      if (!cuenta.subCuentas || cuenta.subCuentas.length === 0) {
        if (!result.some(c => c.id === cuenta.id)) {
          result.push(cuenta);  // Agregar la cuenta al resultado
        }
      }
    };

    const procesarCuentas = (cuentas: Cuenta[]) => {
      cuentas.forEach(cuenta => {
        // Agregar la cuenta si es hoja
        agregarCuentaUnica(cuenta);

        // Si tiene subCuentas, procesarlas recursivamente (pero no agregarlas si no son hojas)
        if (cuenta.subCuentas && cuenta.subCuentas.length > 0) {
          const subCuentasActivas = cuenta.subCuentas.filter(subCuenta => subCuenta.activa);
          procesarCuentas(subCuentasActivas);  // Recursión sobre las subcuentas activas
        }
      });
    };

    procesarCuentas(cuentas);
    return result;
  }

  obtenerCuentasFiltradas(): Cuenta[] {
    return this.cuentas.filter(cuenta => !this.cuentasExcluidas.includes(cuenta.nombre));
  }

  // Método para agregar una forma de pago
  agregarFormaDePago(): void {
    if (this.formasDePago.some(pago => pago.cuenta.id === this.cuenta?.id)) {
      alert("Esta cuenta ya ha sido agregada.");
      return;
    }

    if (!this.cuenta || !this.montoPago) {
      alert("Debe seleccionar una cuenta y un monto.");
      return;
    }

    this.formasDePago.push({
      id: undefined,
      cuenta: this.cuenta,
      cantidad: this.montoPago
    });

    // Limpiar campos después de agregar la forma de pago
    this.cuenta = undefined;
    this.montoPago = 0;
  }

  // obtenerCuotasCliente() {
  //   this.userService.getUserByEmail(this.userEmail).subscribe(user => {
  //     this.user = user;
  //   });
  //   this.cuotasService.getCuotasByClient(this.userEmail).subscribe((cuotas) => {
  //     this.cuotas = cuotas;
  //     this.filtrarCuotasPendientes();
  //   });
  // }
  obtenerCuotasCliente(ventaId?: number) {
    this.userService.getUserByEmail(this.userEmail).subscribe(user => {
      this.user = user;
    });
    this.cuotasService.getCuotasByClient(this.userEmail).subscribe(cuotas => {
      this.cuotas = cuotas;
      this.filtrarCuotasPendientes(ventaId!);
    });
  }

  // filtrarCuotasPendientes() {
  //   const cuotasAgrupadas: Record<number, Cuotas[]> = {};
  //
  //   // Agrupar cuotas por `venta.id`
  //   this.cuotas.forEach((cuota) => {
  //     const ventaId = cuota.venta.id!;
  //     if (!cuotasAgrupadas[ventaId]) {
  //       cuotasAgrupadas[ventaId] = [];
  //     }
  //     cuotasAgrupadas[ventaId].push(cuota);
  //   });
  //
  //   // Asignar número de cuota dentro del grupo
  //   this.cuotasPendientes = [];
  //   Object.values(cuotasAgrupadas).forEach((grupo) => {
  //     grupo.forEach((cuota, index) => {
  //       this.cuotasPendientes.push({
  //         cuota,
  //         numero: index + 1, // Contador dentro del grupo
  //         total: grupo.length, // Total de cuotas en el grupo
  //       });
  //     });
  //   });
  // }
  filtrarCuotasPendientes(ventaId: number) {
    const cuotasFiltradas = this.cuotas.filter(cuota => cuota.venta.id === ventaId);
    this.cuotasPendientes = cuotasFiltradas.map((cuota, index, array) => ({
      cuota,
      numero: index + 1, // Número dentro del grupo
      total: array.length, // Total de cuotas en el grupo
    }));
  }

  eliminarFormaPago(formaPago: Pagos): void {
    this.formasDePago = this.formasDePago.filter(fp => fp !== formaPago);
  }

  esPagoValido(montoCuota: number): boolean {
    const sumaPagos = this.formasDePago.reduce((total, pago) => total + pago.cantidad, 0);
    return sumaPagos === montoCuota;
  }

  pagarCuota(id: number | undefined, forma: string) {
    if (id === undefined) {
      console.error("ID de cuota no proporcionado");
      return;
    }

    const cuota = this.cuotas.find(c => c.id === id);

    if (!cuota) {
      console.error("Cuota no encontrada");
      return;
    }

    // Validación de saldo
    const saldoDisponible = forma === 'contado'
      ? cuota.venta.cliente?.saldoCuenta ?? 0
      : cuota.venta.cliente?.saldoBanco ?? 0;

    if (saldoDisponible < cuota.monto) {
      alert("Saldo insuficiente");
      return;
    }

    this.verificarAsientoContable(cuota);

    // Actualización del saldo del cliente
    if (forma === 'contado') {
      cuota.venta.cliente!.saldoCuenta! -= cuota.monto;
    } else {
      cuota.venta.cliente!.saldoBanco! -= cuota.monto;
    }

    // Actualizar el estado de la cuota
    cuota.estadoPago = 'Pagada';

    const asiento: Asiento = {
      fecha: new Date(),
      descripcion: `Pago de Cuota - Factura ${cuota.venta.nroFactura}`,
      usuarioEmail: this.authService.getAuthenticatedUserEmail()
    };

    // Crear las cuentas afectadas
    const cuentasAfectadas: CuentaAsiento[] = [];
    let sumatoriaHaber = 0;

    this.formasDePago.forEach(pago => {
      pago.venta = cuota.venta;
      pago.cuota = cuota;

      cuentasAfectadas.push({
        id: undefined!,
        cuenta: pago.cuenta,
        asiento,
        debe: pago.cantidad,
        haber: 0,
        saldo: pago.cuenta.saldoActual + pago.cantidad,
      });
      sumatoriaHaber += pago.cantidad;
    });

    cuentasAfectadas.push({
      id: undefined!,
      cuenta: this.cuentas.find(c => c.nombre === 'Deudores por ventas')!,
      asiento,
      debe: 0,
      haber: sumatoriaHaber,
      saldo: cuota.venta.cliente!.saldoCuenta! - sumatoriaHaber
    });

    // Guardar asiento contable
    this.cuentaAsientoService.crearCuentasAsiento(asiento, cuentasAfectadas);
    this.pagosService.createPagos(this.formasDePago);
    this.cuotasService.updateCuota(cuota).subscribe(() => {
      // Actualizar cuotas en tiempo real
      this.cuotas = this.cuotas.filter(c => c.id !== id); // Eliminar la cuota pagada
      this.filtrarCuotasPendientes(cuota.venta.id!); // Actualizar cuotas pendientes
      this.formasDePago = [];
      alert("Pago realizado con éxito");
    });
  }

  verificarAsientoContable(cuota: Cuotas) {
    // Verificar si las cuentas de Ventas y Mercaderías tienen suficiente saldo
    const cuentaDeudoresPorVentas = this.cuentas.find(cuenta => cuenta.nombre === 'Deudores por ventas');

    // Verificación de existencia de cuentas
    if (!cuentaDeudoresPorVentas) {
      alert('Cuenta Deudores por ventas no existe, debes crearla.');
      return;
    }

    if (cuentaDeudoresPorVentas.saldoActual < cuota.monto) {
      alert('Saldo insuficiente en las cuenta "Deudores por ventas".');
      return;
    }
  }

  protected readonly faXmark = faXmark;
}
