import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ArticulosVentasService} from "../services/articulos-ventas.service";
import {ArticulosVentas} from "../models/articulos-ventas";
import {Articulos} from "../models/articulos";
import {Ventas} from "../models/ventas";
import {ArticulosService} from "../services/articulos.service";
import {CuentaAsientoService} from "../services/cuenta-asiento.service";
import {CuentaAsiento} from "../models/cuenta-asiento.model";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-costeo',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './costeo.component.html',
  styleUrl: './costeo.component.css'
})
export class CosteoComponent implements OnInit {
  // Definición de los meses del año
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  mesSeleccionado: string = '';
  // Métodos de costeo disponibles
  metodosCosteo = ['PEPS', 'UEPS', 'PP'];
  metodoCosteoSeleccionado: string = '';
  cuentaAsientos: CuentaAsiento[] = [];

  // Declaración del formulario reactivo para filtrar por mes y método de costeo
  filtroForm: FormGroup;

  // Variables para almacenar las listas de artículos de ventas, artículos y ventas
  articulosVentas: ArticulosVentas[] = [];
  articulos: Articulos[] = [];

  constructor(private fb: FormBuilder,
              private articulosVentasService: ArticulosVentasService,
              private articulosService: ArticulosService,
              private cuentaAsientosService: CuentaAsientoService) {
    // Inicialización del formulario reactivo con campos para mes y método de costeo
    this.filtroForm = this.fb.group({
      mes: [''],
      metodoCosteo: ['']
    });
  }

  // Método que se ejecuta al iniciar el componente
  ngOnInit(): void {}

  // Método que se ejecuta al hacer la búsqueda (cuando se selecciona un mes)
  onSearch(): void {
    this.mesSeleccionado = this.filtroForm.get('mes')?.value; // Obtiene el mes seleccionado del formulario
    this.metodoCosteoSeleccionado = this.filtroForm.get('metodoCosteo')?.value; // Obtiene el mes seleccionado del formulario
    if (this.mesSeleccionado) {
      // Llama al servicio para obtener los artículos de ventas de un mes específico
      this.articulosVentasService.getArticulosVentasByMonth(this.mesSeleccionado).subscribe({
        next: (data) => {
          this.articulosVentas = data; // Asigna los datos obtenidos al array articulosVentas
          if (this.metodoCosteoSeleccionado === 'PEPS') {
            this.calcularCosteoPEPS();
          } else if (this.metodoCosteoSeleccionado === 'UEPS') {
            this.calcularCosteoUEPS(); // Llama al método para calcular el costeo
          } else if (this.metodoCosteoSeleccionado === 'PP') {
            this.calcularCosteoPP();
          }
        },
        error: (err) => {
          console.error('Error al obtener artículos de ventas:', err); // Maneja el error en caso de que falle la llamada
        }
      });
    }
  }

  // Método que calcula el costeo usando el método UEPS
  calcularCosteoUEPS(): void {
    // Paso 1: Restaurar el stock original de los artículos en articulosVentas
    this.articulosVentas.forEach(av => {
      console.log("Cantidad del articulo " + av.articulo.nombre + " a restaurar: " + av.cantidad);
      av.articulo.stockActual += av.cantidad;
    });

    // Paso 2: Compactar articulosVentas acumulando cantidades
    const articulosVentasProcesados: ArticulosVentas[] = [];
    this.articulosVentas.forEach(articuloVenta => {
      const articuloEncontrado = articulosVentasProcesados.find(
        av => av.articulo.nombre === articuloVenta.articulo.nombre && av.venta?.id === articuloVenta.venta?.id
      );

      if (articuloEncontrado) {
        articuloEncontrado.cantidad += articuloVenta.cantidad;
      } else {
        articulosVentasProcesados.push({
          cantidad: articuloVenta.cantidad,
          venta: articuloVenta.venta,
          articulo: articuloVenta.articulo,
          precioVenta: articuloVenta.precioVenta,
          subtotal: 0, // Se calculará posteriormente
        });
      }
    });

    // Paso 3: Obtener artículos desde el servicio y ajustar stock
    this.articulosService.getArticulos().subscribe(articulos => {
      const articulosDelBackend = [...articulos]; // Clonamos los artículos obtenidos del backend

      // Ajustar el stockActual comparando con articulosVentas
      this.articulosVentas.forEach(articuloVenta => {
        for (const articulo of articulosDelBackend) {
          if (articuloVenta.articulo.id === articulo.id) {
            articulo.stockActual = articuloVenta.articulo.stockActual;
            console.log(`Ajustando stock del artículo: ${articulo.nombre} a ${articulo.stockActual}`);
          }
        }
      });

      const nuevosArticulosVentas: ArticulosVentas[] = [];
      articulosVentasProcesados.forEach(articuloProcesado => {
        // Filtrar artículos con el mismo nombre y stock > 0, ordenados por fecha (más reciente primero)
        // const articulosMismoNombre = articulosDelBackend
        //   .filter(a => a.nombre === articuloProcesado.articulo.nombre && a.stockActual > 0)
        //   .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
        //Voy a usar el más reciente si cumple que el Articulo sea antes registrado que la venta (no sería el/los articulos más recientes del mes).
        const fecha = new Date(articuloProcesado.venta!.fecha);
        const articulosMismoNombre = articulosDelBackend
          .filter(a =>
            a.nombre === articuloProcesado.articulo.nombre && a.stockActual > 0 && new Date(a.fechaCreacion) <= new Date(fecha))
          .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());

        let cantidadRestante = articuloProcesado.cantidad;

        for (const articulo of articulosMismoNombre) {
          if (cantidadRestante <= 0) break; // Si ya no hay cantidad restante, terminamos

          const cantidadPorVender = Math.min(articulo.stockActual, cantidadRestante);

          // Crear nuevo registro de venta
          nuevosArticulosVentas.push({
            id: undefined, // Será asignado automáticamente si se maneja en BD
            cantidad: cantidadPorVender,
            subtotal: cantidadPorVender * articuloProcesado.precioVenta,
            precioVenta: articuloProcesado.precioVenta,
            venta: articuloProcesado.venta,
            articulo: articulo,
          });

          // Actualizar stock del artículo y la cantidad restante
          articulo.stockActual -= cantidadPorVender;
          cantidadRestante -= cantidadPorVender;
        }

        if (cantidadRestante > 0) {
          console.error(`No hay suficiente stock para completar la venta del artículo: ${articuloProcesado.articulo.nombre}`);
        }
      });

      // Paso 4: Asignar los nuevos artículos de ventas
      this.articulosVentas = nuevosArticulosVentas;
      this.calcularCantidadPrecioUnitario();
    });
  }

  calcularCosteoPEPS(): void {
    // Paso 1: Restaurar el stock original de los artículos en articulosVentas
    this.articulosVentas.forEach(av => {
      console.log("Cantidad del articulo " + av.articulo.nombre + " a restaurar: " + av.cantidad);
      av.articulo.stockActual += av.cantidad;
    });

    // Paso 2: Compactar articulosVentas acumulando cantidades
    const articulosVentasProcesados: ArticulosVentas[] = [];
    this.articulosVentas.forEach(articuloVenta => {
      const articuloEncontrado = articulosVentasProcesados.find(
        av => av.articulo.nombre === articuloVenta.articulo.nombre && av.venta?.id === articuloVenta.venta?.id
      );

      if (articuloEncontrado) {
        articuloEncontrado.cantidad += articuloVenta.cantidad;
      } else {
        articulosVentasProcesados.push({
          cantidad: articuloVenta.cantidad,
          venta: articuloVenta.venta,
          articulo: articuloVenta.articulo,
          precioVenta: articuloVenta.precioVenta,
          subtotal: 0, // Se calculará posteriormente
        });
      }
    });

    // Paso 3: Obtener artículos desde el servicio y ajustar stock
    this.articulosService.getArticulos().subscribe(articulos => {
      const articulosDelBackend = [...articulos]; // Clonamos los artículos obtenidos del backend

      // Ajustar el stockActual comparando con articulosVentas
      this.articulosVentas.forEach(articuloVenta => {
        for (const articulo of articulosDelBackend) {
          if (articuloVenta.articulo.id === articulo.id) {
            articulo.stockActual = articuloVenta.articulo.stockActual;
            console.log(`Ajustando stock del artículo: ${articulo.nombre} a ${articulo.stockActual}`);
          }
        }
      });

      const nuevosArticulosVentas: ArticulosVentas[] = [];
      articulosVentasProcesados.forEach(articuloProcesado => {
        // Filtrar artículos con el mismo nombre y stock > 0, ordenados por fecha (más antiguo primero)
        const fecha = new Date(articuloProcesado.venta!.fecha);
        const articulosMismoNombre = articulosDelBackend
          .filter(a => a.nombre === articuloProcesado.articulo.nombre && a.stockActual > 0 && new Date(a.fechaCreacion) <= new Date(fecha))
          .sort((a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()); // PEPS: Más antiguo primero

        let cantidadRestante = articuloProcesado.cantidad;

        for (const articulo of articulosMismoNombre) {
          if (cantidadRestante <= 0) break; // Si ya no hay cantidad restante, terminamos

          const cantidadPorVender = Math.min(articulo.stockActual, cantidadRestante);

          // Crear nuevo registro de venta
          nuevosArticulosVentas.push({
            id: undefined, // Será asignado automáticamente si se maneja en BD
            cantidad: cantidadPorVender,
            subtotal: cantidadPorVender * articuloProcesado.precioVenta,
            precioVenta: articuloProcesado.precioVenta,
            venta: articuloProcesado.venta,
            articulo: articulo,
          });

          // Actualizar stock del artículo y la cantidad restante
          articulo.stockActual -= cantidadPorVender;
          cantidadRestante -= cantidadPorVender;
        }

        if (cantidadRestante > 0) {
          console.error(`No hay suficiente stock para completar la venta del artículo: ${articuloProcesado.articulo.nombre}`);
        }
      });

      // Paso 4: Asignar los nuevos artículos de ventas
      this.articulosVentas = nuevosArticulosVentas;
      this.calcularCantidadPrecioUnitario();
    });
  }

  /**
   En lugar de seleccionar artículos por orden cronológico, el Promedio Ponderado calcula un costo promedio unitario que se actualiza cada vez que ingresan artículos nuevos al inventario.
   */
  calcularCosteoPP(): void {
    // Restaurar stock original
    this.articulosVentas.forEach(av => av.articulo.stockActual += av.cantidad);

    // Compactar artículos
    const articulosVentasProcesados: ArticulosVentas[] = [];
    this.articulosVentas.forEach(articuloVenta => {
      const articuloEncontrado = articulosVentasProcesados.find(
        av => av.articulo.nombre === articuloVenta.articulo.nombre && av.venta?.id === articuloVenta.venta?.id
      );

      if (articuloEncontrado) {
        articuloEncontrado.cantidad += articuloVenta.cantidad;
      } else {
        articulosVentasProcesados.push({
          cantidad: articuloVenta.cantidad,
          venta: articuloVenta.venta,
          articulo: articuloVenta.articulo,
          precioVenta: articuloVenta.precioVenta,
          subtotal: 0,
        });
      }
    });

    // Obtener artículos del servicio
    this.articulosService.getArticulos().subscribe(articulos => {
      const articulosDelBackend = [...articulos];
      const nuevosArticulosVentas: ArticulosVentas[] = [];

      // Calcular costo promedio
      const costoPromedioArray: number[] = articulosDelBackend.map(articulo => {
        const totalCosto = articulo.stockActual * articulo.precioUnitario;
        return articulo.stockActual > 0 ? totalCosto / articulo.stockActual : 0;
      });

      articulosVentasProcesados.forEach((articuloProcesado, index) => {
        const articuloBackend = articulosDelBackend.find(
          a => a.nombre === articuloProcesado.articulo.nombre
        );

        if (articuloBackend) {
          const costoPromedio = costoPromedioArray[articulosDelBackend.indexOf(articuloBackend)];
          const cantidadPorVender = Math.min(articuloBackend.stockActual, articuloProcesado.cantidad);

          nuevosArticulosVentas.push({
            cantidad: cantidadPorVender,
            subtotal: cantidadPorVender * costoPromedio,
            precioVenta: articuloProcesado.precioVenta,
            venta: articuloProcesado.venta,
            articulo: articuloBackend,
          });

          articuloBackend.stockActual -= cantidadPorVender;
        }
      });

      this.articulosVentas = nuevosArticulosVentas;
      this.calcularCantidadPrecioUnitario();
    });
  }

  calcularCantidadPrecioUnitario(): void {
    // Paso 5: Calcular los totales por venta.id
    const resultadosVentas: { [key: number]: number } = {};

    this.articulosVentas.forEach(nuevoArticuloVenta => {
      if (nuevoArticuloVenta.venta?.id) {
        const ventaId = nuevoArticuloVenta.venta.id;
        const valor = nuevoArticuloVenta.cantidad * nuevoArticuloVenta.articulo.precioUnitario;

        // Sumar el valor al resultado actual para la venta correspondiente
        if (resultadosVentas[ventaId]) {
          resultadosVentas[ventaId] += valor;
        } else {
          resultadosVentas[ventaId] = valor;
        }
      }
    });

    // Imprimir los resultados
    console.log("Resultados acumulados por venta.id:", resultadosVentas);

    this.cuentaAsientosService.getCuentaAsientosByMonth(this.mesSeleccionado).subscribe((cuentaAsientos) => {
      this.cuentaAsientos = cuentaAsientos;

      // Crear un array con los valores de resultadosVentas
      const valoresVentas = Object.values(resultadosVentas);

      let indexValor = 0; // Índice para recorrer los valores de resultadosVentas
      let contador = 0;

      // Recorrer cada cuentaAsiento
      this.cuentaAsientos.forEach(cuentaAsiento => {
        // Si la cuenta es 'CMV' o 'Mercaderías'
        if (cuentaAsiento.cuenta.nombre === 'CMV' || cuentaAsiento.cuenta.nombre === 'Mercaderias') {
          // Asignar el valor de resultadosVentas, y solo usar el valor cada dos veces
          if (cuentaAsiento.debe > 0) {
            cuentaAsiento.debe = valoresVentas[indexValor];
          } else {
            cuentaAsiento.haber = valoresVentas[indexValor];
          }
          if (contador === 1) {
            indexValor++;
            contador = 0;
          } else {
            contador++;
          }
        }
      });

      // Imprimir los resultados después de asignar valores
      console.log("Cuenta Asientos actualizados:", this.cuentaAsientos);
    });
  }

}

// PP = (Cantidad en Inventario x Precio de Compra) / Cantidad Total en Inventario

/**
 Obtener todos los ArticulosVentas dado un mes (articuloVenta.venta.fecha)
 Almacenar por cada ArticuloVenta, Articulo en un array (si un mismo articulo.id aparece varias veces, tener en el array solo el de mayor stockActual).
 Generar un array de tres elementos que contenga del ArticuloVenta, cantidad, venta, articulo.
 Si hay una secuencia de ArticuloVenta que tenga el mismo articulo.nombre, almacenar en el array de tres elementos la suma de las cantidades, la venta, y el articulo (no almacenar dos veces el mismo articulo).

 Generar nuevos articulosVentas locales, asignándole del array de tres elementos la venta; Si el método de costeo es UEPS, del array de Articulo si hay varios artículos con articulo.nombre, asignar a articulosVentas el Articulo con fechaCreacion más reciente, luego asignarle la venta a la que pertenece en cuestión.
 Consideraciones del anterior punto:
 Luego de asignarle el articulo a articulosVentas, debe restarse stockActual del array de Articulo del articulo correspondiente (en caso de que cantidad > articulo.stockActual restarle solo el stock que tenga).
 Si cantidad > articulo.stockActual, buscar otro Articulo del array de articulo con el mismo articulo.nombre, que tenga fechaCreación más reciente y que tenga stockActual > 0, agregar un nuevo articuloVenta con lo que habia sobrado de cantidad (esto puede ser recursivo y puede que aún no alcance).
*/
