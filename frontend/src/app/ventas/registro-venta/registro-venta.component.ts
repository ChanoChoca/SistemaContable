import {Component, EventEmitter, inject, Output} from '@angular/core';
import {Ventas} from "../../models/ventas";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CuentaService} from "../../services/cuenta.service";
import {Cuenta} from "../../models/cuenta.model";
import {CuentaAsiento} from "../../models/cuenta-asiento.model";
import {Asiento} from "../../models/asiento.model";
import {CuentaAsientoService} from "../../services/cuenta-asiento.service";
import {AuthService} from "../../core/auth/auth.service";
import {faXmark} from "@fortawesome/free-solid-svg-icons/faXmark";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {Articulos} from "../../models/articulos";
import {ArticulosVentas} from "../../models/articulos-ventas";

@Component({
  selector: 'app-registro-venta',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FaIconComponent
  ],
  templateUrl: './registro-venta.component.html',
  styleUrl: './registro-venta.component.css'
})
export class RegistroVentaComponent {
  cuentas: Cuenta[] = [];
  authService = inject(AuthService);
  articulosVentas: ArticulosVentas[] = [];
  articulos: Articulos[] = [];
  articuloSeleccionado: Articulos | null = null;
  cantidad: number = 1;

  nuevaVenta: Ventas = {
    fecha: new Date(),
    tipo: '',
    clienteEmail: '',
    nroComprobante: 0,
    monto: 0,
    nroFactura: 0,
    descripcion: '',
    vendedorEmail: '',
    formaPago: '',
    estado: 'Pendiente',
  };

  @Output() ventaRegistrada = new EventEmitter<Ventas>();

  tiposVenta = ['Venta', 'Crédito', 'Débito'];
  formasPago = ['Efectivo', 'Cheque', 'Transferencia', 'Tarjeta de Crédito', 'Tarjeta de Débito'];

  constructor(
    private cuentaService: CuentaService,
    private cuentaAsientoService: CuentaAsientoService
  ) {
    this.cargarVentas();
    this.cargarCuentas();
    this.cargarArticulos();
  }

  cargarArticulos(): void {
    const articulosGuardados = this.obtenerArticulosLocalStorage();
    this.articulos = articulosGuardados.length ? articulosGuardados : [];
  }

  quitarArticulo(id: number): void {
    this.articulosVentas = this.articulosVentas.filter(articulo => articulo.id !== id);

    // Guardamos los artículos actualizados en el LocalStorage
    this.cargarArticulos();
  }

  private obtenerArticulosLocalStorage(): Articulos[] {
    return JSON.parse(localStorage.getItem('articulos') || '[]');
  }

  calcularTotal(): number {
    return this.articulosVentas.reduce((total, articulo) => total + articulo.subtotal, 0);
  }

  cargarCuentas(): void {
    this.cuentaService.getCuentas().subscribe(cuentas => {
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

  stockSuficiente: boolean = true;
  precioVenta: number = 0;
  mostrarMensajeArticuloExistente: boolean = false;

  agregarProducto(): void {
    if (this.articuloSeleccionado && this.cantidad > 0) {
      // Validar si el stock es suficiente
      if (this.cantidad > this.articuloSeleccionado.stockActual) {
        this.stockSuficiente = false;
        return;
      }
      this.stockSuficiente = true;

      // Verificar si el artículo ya está en el carrito
      const articuloExistente = this.articulosVentas.find(
        articulo => articulo.articulo.id === this.articuloSeleccionado!.id
      );

      if (articuloExistente) {
        // Si ya existe, mostrar un mensaje o no agregarlo
        this.articuloSeleccionado = null;
        this.mostrarMensajeArticuloExistente = true;
        return;  // Salir sin agregar el artículo
      }

      // Resetear el mensaje si no es un artículo existente
      this.mostrarMensajeArticuloExistente = false;

      // Si el precio de venta no se ha definido, utilizamos el precio unitario por defecto
      const precioVenta = this.precioVenta > 0 ? this.precioVenta : this.articuloSeleccionado.precioUnitario;

      const subtotal = precioVenta * this.cantidad;
      const articuloVenta: ArticulosVentas = {
        id: new Date().getTime(),
        cantidad: this.cantidad,
        subtotal,
        precioVenta,
        venta: this.nuevaVenta,
        articulo: this.articuloSeleccionado
      };

      this.articulosVentas.push(articuloVenta);
      this.guardarArticulosVentaLocalStorage(this.articulosVentas);
    }
  }

  private guardarArticulosVentaLocalStorage(articulosVentas: ArticulosVentas[]): void {
    localStorage.setItem('articulosVentas', JSON.stringify(articulosVentas));
  }

  private guardarArticulosLocalStorage(articulos: Articulos[]): void {
    localStorage.setItem('articulos', JSON.stringify(articulos));
  }

  registrarVenta(): void {
    // Asignar automáticamente el correo del vendedor
    this.nuevaVenta.vendedorEmail = this.authService.getAuthenticatedUserEmail();

    // Calcular el monto de la venta a partir del total de los artículos
    this.nuevaVenta.monto = this.calcularTotal();

    const ventasGuardadas = this.obtenerVentasLocalStorage();

    // Autoincrementar ID, número de comprobante y número de factura
    this.nuevaVenta.id = ventasGuardadas.length ? Math.max(...ventasGuardadas.map(v => v.id || 0)) + 1 : 1;
    this.nuevaVenta.nroComprobante = ventasGuardadas.length ? Math.max(...ventasGuardadas.map(v => v.nroComprobante || 0)) + 1 : 1;
    this.nuevaVenta.nroFactura = ventasGuardadas.length ? Math.max(...ventasGuardadas.map(v => v.nroFactura || 0)) + 1 : 1;

    // Verificar si las cuentas de Ventas y Mercaderías tienen suficiente saldo
    const cuentaVenta = this.cuentas.find(cuenta => cuenta.nombre === 'Ventas');
    const cuentaMercaderias = this.cuentas.find(cuenta => cuenta.nombre === 'Mercaderias');

    if (cuentaVenta && cuentaMercaderias) {
      if (cuentaVenta.saldoActual < this.nuevaVenta.monto || cuentaMercaderias.saldoActual < this.nuevaVenta.monto) {
        this.saldoInsuficiente = true;
        return;
      }
    }

    // Descontar el stock de los artículos vendidos
    this.articulosVentas.forEach(articuloVenta => {
      const articulo = this.articulos.find(a => a.id === articuloVenta.articulo.id);
      if (articulo) {
        articulo.stockActual -= articuloVenta.cantidad;
      }
    });

    // Guardar los cambios en el LocalStorage
    this.guardarArticulosLocalStorage(this.articulos);

    // Registrar la venta
    ventasGuardadas.push({ ...this.nuevaVenta });
    this.guardarVentasLocalStorage(ventasGuardadas);

    this.ventaRegistrada.emit({ ...this.nuevaVenta });
    this.registrarAsientoContable();
    this.reiniciarFormulario();
  }

  saldoInsuficiente: boolean = false;

  registrarAsientoContable(): void {
    const asiento: Asiento = {
      fecha: new Date(),
      descripcion: `Venta de producto - Factura ${this.nuevaVenta.nroFactura}`,
      usuarioEmail: this.authService.getAuthenticatedUserEmail()
    };

    // Obtener las cuentas necesarias (Caja, Venta, CMV, Mercaderías)
    const cuentasAfectadas: CuentaAsiento[] = [];

    if (this.nuevaVenta.formaPago === 'Efectivo') {
      // Suponiendo que ya tienes la lógica para obtener las cuentas por nombre o ID
      const cuentaCaja = this.cuentas.find(cuenta => cuenta.nombre === 'Caja');
      const cuentaVenta = this.cuentas.find(cuenta => cuenta.nombre === 'Ventas');
      const cuentaCMV = this.cuentas.find(cuenta => cuenta.nombre === 'CMV');
      const cuentaMercaderias = this.cuentas.find(cuenta => cuenta.nombre === 'Mercaderias');

      console.log(cuentaCaja, cuentaVenta, cuentaCMV, cuentaMercaderias);

      if (cuentaCaja && cuentaVenta && cuentaCMV && cuentaMercaderias) {
        // Crear los asientos contables para cada cuenta afectada
        cuentasAfectadas.push(
          { id: undefined!, cuenta: cuentaCaja, asiento, debe: this.nuevaVenta.monto, haber: 0, saldo: cuentaCaja.saldoActual + this.nuevaVenta.monto },
          { id: undefined!, cuenta: cuentaVenta, asiento, debe: 0, haber: this.nuevaVenta.monto, saldo: cuentaVenta.saldoActual - this.nuevaVenta.monto },
          { id: undefined!, cuenta: cuentaCMV, asiento, debe: this.nuevaVenta.monto, haber: 0, saldo: cuentaCMV.saldoActual + this.nuevaVenta.monto },
          { id: undefined!, cuenta: cuentaMercaderias, asiento, debe: 0, haber: this.nuevaVenta.monto, saldo: cuentaMercaderias.saldoActual - this.nuevaVenta.monto }
        );


        cuentasAfectadas.map(cuentaAfectada =>
            this.cuentaService.actualizarSaldoCuenta(cuentaAfectada.cuenta.id!, cuentaAfectada.saldo).toPromise()
        );

        // Llamar al servicio para crear los asientos
        this.cuentaAsientoService.crearCuentasAsiento(asiento, cuentasAfectadas);
      }
    }
  }

  private cargarVentas(): void {
    const ventasGuardadas = this.obtenerVentasLocalStorage();
    if (!ventasGuardadas.length) {
      this.guardarVentasLocalStorage([]);
    }
  }

  private obtenerVentasLocalStorage(): Ventas[] {
    return JSON.parse(localStorage.getItem('ventas') || '[]');
  }

  private guardarVentasLocalStorage(ventas: Ventas[]): void {
    localStorage.setItem('ventas', JSON.stringify(ventas));
  }

  private reiniciarFormulario(): void {
    this.nuevaVenta = {
      fecha: new Date(),
      tipo: '',
      clienteEmail: '',
      monto: 0,
      descripcion: '',
      vendedorEmail: '',
      formaPago: '',
      estado: 'Pendiente',
      id: undefined!,
      nroComprobante: undefined!,
      nroFactura: undefined!,
    };
  }

  protected readonly faXmark = faXmark;
}
