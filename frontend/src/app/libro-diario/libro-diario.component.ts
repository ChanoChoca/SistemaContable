import {Component, OnInit} from '@angular/core';
import {ReportesService} from '../services/reportes.service';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {DatePipe} from "@angular/common";
import {Page} from "../models/page.model";
import {jsPDF} from "jspdf";
import autoTable from "jspdf-autotable";
import {CuentaAsiento} from "../models/cuenta-asiento.model";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faDownload} from "@fortawesome/free-solid-svg-icons/faDownload";
import {faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons/faMagnifyingGlass";
import {faEraser} from "@fortawesome/free-solid-svg-icons/faEraser";

@Component({
  selector: 'app-libro-diario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    FaIconComponent
  ],
  templateUrl: './libro-diario.component.html',
  styleUrl: './libro-diario.component.css'
})
export class LibroDiarioComponent implements OnInit {
  cuentaAsientos: CuentaAsiento[] = [];
  fechaInicio: Date = new Date('2024-12-01T21:00:00');
  fechaFin: Date = new Date('2024-09-01T21:00:00');
  currentPage: number = 0;
  pageSize: number = 3;
  totalPages: number = 0;

  totalDebe: number = 0;
  totalHaber: number = 0;

  filtroForm: FormGroup;

  constructor(
    private reportesService: ReportesService,
    private fb: FormBuilder
  ) {
    this.filtroForm = this.fb.group({
      fechaInicio: [this.fechaInicio],
      fechaFin: [this.fechaFin]
    });
  }

  ngOnInit(): void {
    this.buscarCuentaAsientos();
  }

  // Buscar asientos contables entre dos fechas
  buscarCuentaAsientos(): void {
    let { fechaInicio, fechaFin } = this.filtroForm.value;

    if (fechaInicio) {
      fechaInicio = new Date(fechaInicio);
    }
    if (fechaFin) {
      fechaFin = new Date(fechaFin);
    }

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      console.error('Fechas inválidas');
      return;
    }

    this.reportesService.getLibroDiario(this.currentPage, this.pageSize, fechaInicio.toISOString(), fechaFin.toISOString())
      .subscribe((data: Page<CuentaAsiento>) => {
        // Filtrar cuentas activas
        //TODO: Quitar filtro de activas, ya que puede variar el monto de debe y haber.
        this.cuentaAsientos = data.content.filter(cuentaAsiento => cuentaAsiento.cuenta.activa);
        this.totalPages = data.page.totalPages;
      });

    this.reportesService.getAllAsientos(fechaInicio.toISOString(), fechaFin.toISOString())
      .subscribe((data: CuentaAsiento[]) => {
        // Filtrar cuentas activas
        const filteredAsientos = data.filter(cuentaAsiento => cuentaAsiento.cuenta.activa);

        // Calcular totales
        this.totalDebe = filteredAsientos.reduce((sum, item) => sum + (item.debe || 0), 0);
        this.totalHaber = filteredAsientos.reduce((sum, item) => sum + (item.haber || 0), 0);
      });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.buscarCuentaAsientos();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.buscarCuentaAsientos();
  }

  clearFilters(): void {
    this.filtroForm.reset();
    this.fechaInicio = new Date();
    this.fechaFin = new Date();
    this.onSearch();
  }

  // Método para determinar el tipo de asiento
  determinarTipoAsiento(cuentaAsiento: CuentaAsiento): string {
    const modificativo = cuentaAsiento.debe > 0 || cuentaAsiento.haber > 0;
    return modificativo ? 'Modificativa' : 'Permutativa';
  }

  // Función para imprimir el libro diario
  imprimirLibroDiario(): void {
    let { fechaInicio, fechaFin } = this.filtroForm.value;

    fechaInicio = fechaInicio ? new Date(fechaInicio) : null;
    fechaFin = fechaFin ? new Date(fechaFin) : null;

    if (!fechaInicio || !fechaFin || isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      console.error('Fechas inválidas. Verifique los valores de fecha.');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Libro Diario', 14, 20);

    const agregarUnDia = (fecha: Date): string => {
      const date = new Date(fecha);
      date.setDate(date.getDate() + 1);
      return date.toLocaleDateString('es-ES');
    };

    const fechaInicioTexto = agregarUnDia(fechaInicio);
    const fechaFinTexto = agregarUnDia(fechaFin);

    doc.setFontSize(12);
    doc.text(`Periodo: ${fechaInicioTexto} - ${fechaFinTexto}`, 14, 35);

    const columns = ['ID', 'Operación', 'Movimientos', 'Debe', 'Haber', 'Tipo'];

    this.reportesService.getAllAsientos(fechaInicio.toISOString(), fechaFin.toISOString())
      .subscribe({
        next: (asientos: CuentaAsiento[]) => {
          // Filtrar cuentas activas
          const filteredAsientos = asientos.filter(cuentaAsiento => cuentaAsiento.cuenta.activa);

          const rows = [];
          let lastId: number | null = null;
          let lastFecha: string | null = null;
          let lastTipoAsiento: string | null = null;

          filteredAsientos.forEach(cuentaAsiento => {
            const asiento = cuentaAsiento.asiento;
            const fecha = asiento.fecha ? agregarUnDia(new Date(asiento.fecha)) : '';
            const tipoAsiento = this.determinarTipoAsiento(cuentaAsiento);

            // Mostrar fecha y tipo cuando el ID cambia
            const id = asiento.id !== lastId ? asiento.id : '';
            const fechaMostrada = asiento.id !== lastId ? fecha : '';  // Mostrar fecha solo cuando el ID cambia
            const tipoAsientoMostrado = asiento.id !== lastId ? tipoAsiento : '';  // Mostrar tipo solo cuando el ID cambia

            rows.push([
              id,
              fechaMostrada,
              cuentaAsiento.cuenta.nombre,
              cuentaAsiento.debe,
              cuentaAsiento.haber,
              tipoAsientoMostrado
            ]);

            // Actualizamos las variables para el siguiente asiento
            lastId = asiento.id!;
            lastFecha = fecha;
            lastTipoAsiento = tipoAsiento;
          });

          // Agregar totales
          rows.push(['', '', '', this.totalDebe, this.totalHaber, '', '']);

          // Generar la tabla
          autoTable(doc, {
            head: [columns],
            body: rows,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
            styles: { cellPadding: 3, fontSize: 10 },
            margin: { top: 10 },
          });

          doc.save('libro_diario.pdf');
        },
        error: (err) => {
          console.error('Error al obtener los asientos para el PDF:', err);
        }
      });
  }

  protected readonly faDownload = faDownload;
  protected readonly faMagnifyingGlass = faMagnifyingGlass;
  protected readonly faEraser = faEraser;
}
