import {Component, OnInit} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {Ventas} from "../../models/ventas";
import {VentasService} from "../../services/ventas.service";
import {faXmark} from "@fortawesome/free-solid-svg-icons/faXmark";
import {Chart} from "@antv/g2";

@Component({
  selector: 'app-informe-ventas',
  standalone: true,
  imports: [
    FaIconComponent
  ],
  templateUrl: './informe-ventas.component.html',
  styleUrl: './informe-ventas.component.css'
})
export class InformeVentasComponent implements OnInit {
  ventas: Ventas[] = [];
  ventasPorMes: { [mes: string]: { total: number; crecimiento: number; porcentaje: number } } = {};
  ventasOrdenadasPorMes: string[] = []; // Meses ordenados cronológicamente

  constructor(private ventasService: VentasService) {
  }

  ngOnInit() {
    this.obtenerVentas();
  }

  obtenerVentas() {
    this.ventasService.getVentas().subscribe({
      next: (data) => {
        this.ventas = data;
        this.agruparYCalcularVentas();
      },
      error: (err) => console.error('Error al obtener ventas', err)
    });
  }

  agruparYCalcularVentas() {
    const yearActual = new Date().getFullYear();  // Obtener el año actual
    const agrupadoPorMes: { [mes: string]: number } = {}; // Para almacenar la suma total por mes

    // Filtrar las ventas del año actual
    const ventasDelAnioActual = this.ventas.filter(venta => new Date(venta.fecha).getFullYear() === yearActual);

    // Agrupar y sumar ventas por mes
    ventasDelAnioActual.forEach((venta) => {
      const mes = new Date(venta.fecha).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!agrupadoPorMes[mes]) agrupadoPorMes[mes] = 0;
      agrupadoPorMes[mes] += venta.monto; // Sumar monto
    });

    // Ordenar las claves (meses) cronológicamente
    const mesesOrdenados = Object.keys(agrupadoPorMes).sort((a, b) =>
      new Date(a).getTime() - new Date(b).getTime()
    );

    // Calcular crecimiento y porcentaje
    mesesOrdenados.forEach((mes, index) => {
      const totalActual = agrupadoPorMes[mes];
      const totalAnterior = index > 0 ? agrupadoPorMes[mesesOrdenados[index - 1]] : 0;

      const crecimiento = totalActual - totalAnterior;
      const porcentaje = totalAnterior > 0 ? (crecimiento / totalAnterior) * 100 : 0; // Evitar dividir por 0

      // Actualizar el objeto ventasPorMes
      this.ventasPorMes[mes] = {
        total: totalActual, // Suma total del mes
        crecimiento,
        porcentaje,
      };
    });

    this.ventasOrdenadasPorMes = mesesOrdenados;

    // Transformar los datos en un formato adecuado para el gráfico
    const data = this.ventasOrdenadasPorMes.map((mes) => ({
      mes,
      total: this.ventasPorMes[mes].total,
    }));

    // Procesar gráfico (actualizar o crear el gráfico aquí)
    this.actualizarGrafico(data);
  }

  actualizarGrafico(data: any[]) {
    const chart = new Chart({
      container: 'ventas',
      autoFit: true
    })

    chart.interval().data(data).encode('x', 'mes').encode('y', 'total');

    chart.render();
  }

  protected readonly faXmark = faXmark;
}
