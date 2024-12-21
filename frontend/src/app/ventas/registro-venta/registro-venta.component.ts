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
import {UserService} from "../../services/user.service";
import {User} from "../../core/model/user.model";
import {ArticulosService} from "../../services/articulos.service";
import {VentasService} from "../../services/ventas.service";
import {ArticulosVentasService} from "../../services/articulos-ventas.service";
import {Pagos} from "../../models/pagos";
import {Cuotas} from "../../models/cuotas";
import {CuotasService} from "../../services/cuotas.service";

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
  usuarios: User[] = [];
  cuentas: Cuenta[] = [];
  cuenta: Cuenta | undefined;
  authService = inject(AuthService);
  articulosVentas: ArticulosVentas[] = [];
  articulos: Articulos[] = [];
  articulosHtml: Articulos[] = [];
  articuloSeleccionado: Articulos | null = null;
  metodoCosteoSeleccionado: string = '';
  cantidad: number = 1;
  costoArticulos: number = 0;
  stockSuficiente: boolean = true;
  precioBajo: boolean = false;
  precioVenta: number = 0;
  formasDePago: Pagos[] = [];
  montoPago: number = 0;
  montoMercaderia: number = 0;
  mostrarMensajeArticuloExistente: boolean = false;
  cantidadCuotas: number = 1;
  cuotas: Cuotas[] = [];
  tiposVenta = ['Venta', 'Crédito', 'Débito'];
  @Output() ventaRegistrada = new EventEmitter<Ventas>();

  nuevaVenta: Ventas = {
    id: 0,
    fecha: new Date(),
    tipo: '',
    cliente: undefined,
    nroComprobante: 0,
    monto: 0,
    nroFactura: 0,
    descripcion: '',
    vendedorEmail: '',
    estado: 'Pendiente',
  };

  private reiniciarFormulario(): void {
    this.nuevaVenta = {
      id: 0,
      fecha: new Date(),
      tipo: '',
      cliente: undefined,
      monto: 0,
      descripcion: '',
      vendedorEmail: '',
      estado: 'Pendiente',
      nroComprobante: 0,
      nroFactura: 0,
    };
  }

  constructor(
    private cuentaService: CuentaService,
    private cuentaAsientoService: CuentaAsientoService,
    private usuariosService: UserService,
    private articuloService: ArticulosService,
    private articulosVentasService: ArticulosVentasService,
    private ventasService: VentasService,
  ) {
    this.cargarVentas();
    this.cargarCuentas();
    this.cargarArticulos();
    this.cargarUsuarios();
  }

  //SECCION VENTAS

  cargarVentas(): void {
    this.ventasService.getVentas()
  }

  // SECCION CUENTAS

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

  private cuentasExcluidas = ['Deudores por ventas', 'Ventas', 'CMV', 'Mercaderias'];

  obtenerCuentasFiltradas(): Cuenta[] {
    return this.cuentas.filter(cuenta => !this.cuentasExcluidas.includes(cuenta.nombre));
  }

  // SECCION ARTICULOS

  cargarArticulos(): void {
    this.articuloService.getArticulos().subscribe(articulos => {
          const nombresUnicos = new Set<string>();
          this.articulos = articulos;
          this.articulosHtml = articulos.filter(articulo => {
        if (nombresUnicos.has(articulo.nombre)) {
          return false;
        }
        nombresUnicos.add(articulo.nombre);
        return true;
      });
    });
  }

  // SECCION USUARIOS

  cargarUsuarios(): void {
    this.usuariosService.getUsers().subscribe(usuarios => {
      // Filtrar los usuarios para excluir el usuario autenticado
      this.usuarios = usuarios.filter(usuario => usuario.email !== this.authService.getAuthenticatedUserEmail());
    });
  }

  agregarProducto(): void {
    if (!this.articuloSeleccionado || this.cantidad <= 0 || this.precioVenta <= 0) {
      alert("Por favor, selecciona un artículo válido, una cantidad y un precio de venta.");
      return;
    }

    // Verificar si el artículo ya está agregado en la venta
    const articuloExistente = this.articulosVentas.find(av => av.articulo.nombre === this.articuloSeleccionado!.nombre);
    if (articuloExistente) {
      this.mostrarMensajeArticuloExistente = true;
      alert("Este artículo ya ha sido agregado a la venta.");
      return;
    }

    // Filtrar artículos por nombre y asegurarse de que haya stock disponible
    const articulosFiltrados = this.articulos
      .filter(articulo => articulo.nombre === this.articuloSeleccionado!.nombre && articulo.stockActual > 0);

    // Si no hay artículos con stock disponible, mostrar un mensaje y salir
    if (articulosFiltrados.length === 0) {
      alert("No hay artículos con stock suficiente.");
      return;
    }

    // Ordenar artículos según el método PEPS (FIFO: más antiguos primero)
    const articulosOrdenados = [...articulosFiltrados].sort(
      (a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()
    );

    // Llamada para distribuir la cantidad según el método PEPS
    const distribucionCantidad = this.distribuirCantidadPEPS(articulosOrdenados, this.cantidad);

    if (!distribucionCantidad) {
      alert("No hay suficiente stock disponible para cumplir con la cantidad solicitada.");
      return;
    }

    // Crear ArticulosVentas para cada lote de artículo distribuido
    distribucionCantidad.forEach(cantidad => {
      const subtotal = cantidad * this.precioVenta;

      // Tomar el artículo de la lista de artículos ordenados, asegurando que cada venta use un artículo diferente
      const articuloParaVenta = articulosOrdenados.shift(); // Tomamos el primer artículo disponible

      if (articuloParaVenta) {
        const nuevoArticuloVenta: ArticulosVentas = {
          id: Date.now(), // Generar un ID único
          cantidad,
          subtotal,
          precioVenta: this.precioVenta,
          articulo: articuloParaVenta, // Asignar el artículo disponible con stock
        };

        this.articulosVentas.push(nuevoArticuloVenta);
      }
    });

    // Guardar en localStorage
    localStorage.setItem('articulosVentas', JSON.stringify(this.articulosVentas));

    // Actualizar el costo total de los artículos
    this.costoArticulos = this.articulosVentas.reduce((total, av) => total + av.subtotal, 0);

    // Reiniciar campos del formulario
    this.articuloSeleccionado = null;
    this.cantidad = 1;
    this.precioVenta = 0;
    this.stockSuficiente = true;
    this.mostrarMensajeArticuloExistente = false;
  }

  // Método recursivo para distribuir la cantidad solicitada entre los artículos según PEPS
  private distribuirCantidadPEPS(articulos: Articulos[], cantidadSolicitada: number): number[] | null {
    let cantidadRestante = cantidadSolicitada;
    const cantidadesDistribuidas: number[] = [];

    for (let articulo of articulos) {
      console.log(articulo.id)
      if (cantidadRestante <= 0) break;

      const cantidadDisponible = articulo.stockActual;
      const cantidadAAsignar = Math.min(cantidadRestante, cantidadDisponible);

      cantidadesDistribuidas.push(cantidadAAsignar);
      cantidadRestante -= cantidadAAsignar;

      if (cantidadRestante <= 0) {
        return cantidadesDistribuidas;
      }
    }

    return cantidadRestante > 0 ? null : cantidadesDistribuidas;
  }

  // VALIDACIONES

  // Método para agregar una forma de pago
  agregarFormaDePago(): void {
    if (!this.nuevaVenta.cliente) {
      alert("Debe seleccionar un cliente.");
      return;
    }

    if (this.formasDePago.some(pago => pago.cuenta.id === this.cuenta?.id)) {
      alert("Esta cuenta ya ha sido agregada.");
      return;
    }

    if (!this.cuenta || !this.montoPago) {
      alert("Debe seleccionar una cuenta y un monto.");
      return;
    }

    this.formasDePago.push({
      cuenta: this.cuenta,
      cantidad: this.montoPago,
      venta: this.nuevaVenta
    });

    // Limpiar campos después de agregar la forma de pago
    this.cuenta = undefined;
    this.montoPago = 0;
  }

  // Método para validar las formas de pago
  validarPago(): boolean {
    const totalPago = this.formasDePago.reduce((total, pago) => total + pago.cantidad, 0);
    return totalPago === this.costoArticulos;
  }

  eliminarProducto(articulo: ArticulosVentas): void {
    this.articulosVentas = this.articulosVentas.filter(a => a !== articulo);
    this.costoArticulos = this.articulosVentas.reduce((total, av) => total + av.subtotal, 0);
  }

  eliminarFormaPago(formaPago: Pagos): void {
    this.formasDePago = this.formasDePago.filter(fp => fp !== formaPago);
  }

  get puedeRegistrarVenta(): boolean {
    const productosEnLocalStorage = JSON.parse(localStorage.getItem('articulosVentas') || '[]');
    return (
      productosEnLocalStorage.length > 0 && // Verificar si hay productos
      this.nuevaVenta.tipo !== '' &&        // Verificar si el tipo de venta está definido
      this.nuevaVenta.cliente !== undefined // Verificar si el cliente está seleccionado
    );
  }

  registrarVenta(): void {
    // Asegúrate de que la venta tenga todos los datos necesarios
    this.nuevaVenta.vendedorEmail = this.authService.getAuthenticatedUserEmail();
    this.nuevaVenta.monto = this.costoArticulos; // El monto total de la venta

    // Validar si el monto concuerda con los articulos para comprar
    if (this.nuevaVenta.tipo === 'Venta' || this.nuevaVenta.tipo === 'Débito') {
      if (!this.validarPago()) {
        alert("El total de las formas de pago no coincide con el monto de la venta.");
        localStorage.clear();
        return;
      }
    }

    // Obtener los artículos de la venta desde localStorage
    const articulosVentas: ArticulosVentas[] = JSON.parse(localStorage.getItem('articulosVentas') || '[]');

    this.montoMercaderia = articulosVentas.reduce((total, articuloVenta) => total + articuloVenta.articulo.precioUnitario * articuloVenta.cantidad, 0);

    // Asignar la referencia a la venta a cada artículo
    articulosVentas.forEach((articuloVenta: ArticulosVentas) => {
      articuloVenta.venta = this.nuevaVenta; // Asigna la venta a cada artículo
    });

    // Crear un objeto que contenga la venta y los artículos de venta
    const ventaConArticulos = {
      venta: this.nuevaVenta,
      articulosVentas: articulosVentas,
      formasDePago: this.formasDePago,
      cuotas: this.cuotas
    };

    // Actualizar el saldo del cliente dependiendo del tipo de venta
    this.actualizarSaldoCliente(this.nuevaVenta.cliente!, this.nuevaVenta.monto, this.nuevaVenta.tipo);

    // Enviar la venta y los artículos de venta en un solo endpoint
    this.articulosVentasService.crearVentaConArticulos(ventaConArticulos).subscribe((result) => {

      this.descontarStock(articulosVentas);
      // Emitir evento de venta registrada
      this.ventaRegistrada.emit(result.venta);

      // Limpiar el localStorage después de registrar la venta
      localStorage.clear();
      this.articulosVentas = [];
      this.reiniciarFormulario();
    }, (error) => {
      console.error('Error al registrar la venta y los artículos', error);
    });

    // Registrar el asiento contable
    this.registrarAsientoContable();
  }

  descontarStock(articulosVentas: ArticulosVentas[]): void {
    articulosVentas.forEach((articuloVenta) => {
      // Obtener el artículo correspondiente
      this.articuloService.getArticuloById(articuloVenta.articulo.id!).subscribe((articulo) => {
        // Descontar el stock del artículo
        articulo.stockActual -= articuloVenta.cantidad;
        // Actualizar el artículo con el nuevo stock
        this.articuloService.updateArticulo(articulo).subscribe((updatedArticulo) => {
          console.log('Stock actualizado para el artículo:', updatedArticulo);
        }, (error) => {
          console.error('Error al actualizar el stock del artículo', error);
        });
      }, (error) => {
        console.error('Error al obtener el artículo para actualizar stock', error);
      });
    });
  }

  actualizarSaldoCliente(cliente: User, monto: number, tipoVenta: string): void {
    // Verificar si las cuentas de Ventas y Mercaderías tienen suficiente saldo
    const cuentaDeudoresPorVentas = this.cuentas.find(cuenta => cuenta.nombre === 'Deudores por ventas');
    const cuentaVenta = this.cuentas.find(cuenta => cuenta.nombre === 'Ventas');
    const cuentaCMV = this.cuentas.find(cuenta => cuenta.nombre === 'CMV');
    const cuentaMercaderias = this.cuentas.find(cuenta => cuenta.nombre === 'Mercaderias');

    // Verificación de existencia de cuentas
    if (!cuentaCMV || !cuentaMercaderias || !cuentaVenta) {
      alert('Una o más cuentas (Deudores por ventas, CMV, Mercaderias, Ventas) no existen, debes crearla.');
      localStorage.clear();
      return;
    }

    if (cuentaMercaderias.saldoActual < this.costoArticulos || cuentaCMV.saldoActual < this.costoArticulos || cuentaVenta.saldoActual < this.nuevaVenta.monto) {
      alert('Saldo insuficiente en las cuentas "CMV", "Mercaderias" o "Ventas".');
      localStorage.clear();
      return;
    }

    switch (tipoVenta) {
      case 'Venta':
        this.nuevaVenta.estado = 'Pagada';

        // Verificar si el cliente tiene monto
        if (this.nuevaVenta.cliente?.saldoCuenta! < this.nuevaVenta.monto) {
          alert('El cliente no tiene saldo suficiente para realizar esta venta.');
          localStorage.clear();
          return;
        }

        // Descontar el saldo de la cuenta del cliente
        cliente.saldoCuenta! -= monto;
        break;
      case 'Crédito':
        // Verificación de existencia de la cuenta 'Deudores por ventas'
        if (!cuentaDeudoresPorVentas) {
          alert('La cuenta "Deudores por ventas" no existe, debes crearla.');
          localStorage.clear();
          return;
        }
        if (cuentaDeudoresPorVentas!.saldoActual < this.nuevaVenta.monto) {
          alert('Saldo insuficiente en la cuenta "Deudores por ventas".');
          localStorage.clear();
          return;
        }

        // Verificación de si el cliente alcanza el límite de crédito
        if (this.nuevaVenta.cliente!.limite! < this.nuevaVenta.monto) {
          alert('El cliente no tiene suficiente límite de crédito para realizar esta venta.');
          localStorage.clear();
          return;
        }

        const cuotaMonto = this.nuevaVenta.monto / this.cantidadCuotas;

        for (let i = 0; i < this.cantidadCuotas; i++) {
          // Crear una fecha base inicial para cada cuota
          const fechaBase = new Date();
          fechaBase.setDate(fechaBase.getDate() + 20); // Añadir 20 días para cuotas que sea la primera

          if (i !== 0) {
            fechaBase.setMonth(fechaBase.getMonth() + i); // Añadir el desplazamiento mensual
          }

          this.cuotas.push({
            monto: cuotaMonto,
            fechaVencimiento: fechaBase,
            estadoPago: 'Pendiente',
            venta: this.nuevaVenta
          });
        }

        // Descontar el limite del cliente
        cliente.limite! -= monto;
        break;
      case 'Débito':
        this.nuevaVenta.estado = 'Pagada';

        // Verificación de saldo del cliente para pago con débito
        if (this.nuevaVenta.cliente!.saldoBanco! < this.nuevaVenta.monto) {
          alert('El cliente no tiene saldo suficiente en su cuenta bancaria para realizar esta venta.');
          localStorage.clear();
          return;
        }

        // Si es débito, se descuenta del saldo bancario
        cliente.saldoBanco! -= monto;
        break;
      default:
        break;
    }

    // Actualizamos el saldo del cliente
    this.usuariosService.updateBalance(cliente).subscribe((updatedUser) => {
      console.log("Saldo actualizado correctamente para el cliente", updatedUser);
    }, (error) => {
      console.error("Error al actualizar el saldo del cliente", error);
    });
  }

  registrarAsientoContable(): void {
    const asiento: Asiento = {
      fecha: new Date(),
      descripcion: `Venta de producto - Factura ${this.nuevaVenta.nroFactura}`,
      usuarioEmail: this.authService.getAuthenticatedUserEmail()
    };

    // Obtener las cuentas necesarias (Caja, Venta, CMV, Mercaderías)
    const cuentasAfectadas: CuentaAsiento[] = [];

    const cuentaDeudoresPorVentas = this.cuentas.find(cuenta => cuenta.nombre === 'Deudores por ventas');
    const cuentaVenta = this.cuentas.find(cuenta => cuenta.nombre === 'Ventas');
    const cuentaCMV = this.cuentas.find(cuenta => cuenta.nombre === 'CMV');
    const cuentaMercaderias = this.cuentas.find(cuenta => cuenta.nombre === 'Mercaderias');

    let sumatoriaDebe = 0;
    // Si hay más de una forma de pago, procesarlas por separado
    this.formasDePago.forEach(pago => {
      cuentasAfectadas.push(
        { id: undefined!, cuenta: pago.cuenta, asiento, debe: pago.cantidad, haber: 0, saldo: pago.cuenta.saldoActual + pago.cantidad },
      );
      sumatoriaDebe = sumatoriaDebe + pago.cantidad;
    });

    if (this.nuevaVenta.tipo === 'Crédito') {
      // Venta a crédito
      cuentasAfectadas.push(
        { id: undefined!, cuenta: cuentaDeudoresPorVentas!, asiento, debe: this.nuevaVenta.monto, haber: 0, saldo: cuentaDeudoresPorVentas!.saldoActual + sumatoriaDebe },
        { id: undefined!, cuenta: cuentaVenta!, asiento, debe: 0, haber: this.nuevaVenta.monto, saldo: cuentaVenta!.saldoActual - sumatoriaDebe }
      );
    } else {
      cuentasAfectadas.push(
        { id: undefined!, cuenta: cuentaVenta!, asiento, debe: 0, haber: sumatoriaDebe, saldo: cuentaVenta!.saldoActual - sumatoriaDebe }
      );
    }

    cuentasAfectadas.push(
      { id: undefined!, cuenta: cuentaCMV!, asiento, debe: this.montoMercaderia, haber: 0, saldo: cuentaCMV!.saldoActual + this.montoMercaderia },
      { id: undefined!, cuenta: cuentaMercaderias!, asiento, debe: 0, haber: this.montoMercaderia, saldo: cuentaMercaderias!.saldoActual - this.montoMercaderia }
    );

    // Actualizar los saldos de las cuentas
    cuentasAfectadas.forEach(cuentaAfectada => {
      this.cuentaService.actualizarSaldoCuenta(cuentaAfectada.cuenta.id!, cuentaAfectada.saldo).toPromise();
    });

    // Llamar al servicio para crear los asientos
    this.cuentaAsientoService.crearCuentasAsiento(asiento, cuentasAfectadas);
    this.formasDePago = [];
  }

  protected readonly faXmark = faXmark;
}
