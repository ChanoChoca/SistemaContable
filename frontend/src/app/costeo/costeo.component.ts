import {Component, OnInit} from '@angular/core';
import {Articulos} from "../models/articulos";
import {Ventas} from "../models/ventas";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-costeo',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './costeo.component.html',
  styleUrl: './costeo.component.css'
})
export class CosteoComponent implements OnInit {
  articulos: Articulos[] = [];
  ventas: Ventas[] = [];
  metodoCosteo: string = 'FIFO'; // Inicializamos con un método de costeo
  costoCalculado: number = 0;

  constructor() { }

  ngOnInit(): void {
    this.cargarDatosDesdeLocalStorage();
  }

  // Cargar datos desde el LocalStorage
  cargarDatosDesdeLocalStorage(): void {
    const articulosData = localStorage.getItem('articulos');
    const ventasData = localStorage.getItem('ventas');

    if (articulosData) {
      this.articulos = JSON.parse(articulosData);
    }

    if (ventasData) {
      this.ventas = JSON.parse(ventasData);
    }
  }

  // Función para calcular el costo según el método de costeo seleccionado
  calcularCosto(): void {
    if (this.metodoCosteo === 'FIFO') {
      this.costoCalculado = this.calcularCostoFIFO();
    } else if (this.metodoCosteo === 'LIFO') {
      this.costoCalculado = this.calcularCostoLIFO();
    } else {
      this.costoCalculado = this.calcularCostoPromedio();
    }
  }

  // Método de costeo FIFO (First In, First Out)
  calcularCostoFIFO(): number {
    let costoTotal = 0;
    this.ventas.forEach(venta => {
      let cantidadRestante = venta.monto; // Suponemos que monto es la cantidad de productos vendidos
      this.articulos.forEach(articulo => {
        if (cantidadRestante > 0) {
          const cantidadVenta = Math.min(cantidadRestante, articulo.stockActual);
          costoTotal += cantidadVenta * articulo.precioUnitario;
          cantidadRestante -= cantidadVenta;
        }
      });
    });
    return costoTotal;
  }

  // Método de costeo LIFO (Last In, First Out)
  calcularCostoLIFO(): number {
    let costoTotal = 0;
    this.ventas.forEach(venta => {
      let cantidadRestante = venta.monto; // Suponemos que monto es la cantidad de productos vendidos
      for (let i = this.articulos.length - 1; i >= 0; i--) {
        const articulo = this.articulos[i];
        if (cantidadRestante > 0) {
          const cantidadVenta = Math.min(cantidadRestante, articulo.stockActual);
          costoTotal += cantidadVenta * articulo.precioUnitario;
          cantidadRestante -= cantidadVenta;
        }
      }
    });
    return costoTotal;
  }

  // Método de costeo Promedio
  calcularCostoPromedio(): number {
    let costoTotal = 0;
    let cantidadTotal = 0;
    this.articulos.forEach(articulo => {
      costoTotal += articulo.precioUnitario * articulo.stockActual;
      cantidadTotal += articulo.stockActual;
    });
    return costoTotal / cantidadTotal;
  }
}
