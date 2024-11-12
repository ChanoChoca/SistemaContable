import {Component, OnInit} from '@angular/core';
import { ReportesService } from '../services/reportes.service';
import { AsientoContable } from '../models/asiento.model';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {DatePipe} from "@angular/common";
import {Page} from "../models/page.model";
import {jsPDF} from "jspdf";
import autoTable from "jspdf-autotable";
import {AsientoContableLibroMayor} from "../models/asiento.model";

// Fecha, movimiento, debe, haber, saldo
// Puede haber más de un movimiento por fecha

@Component({
  selector: 'app-libro-diario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './libro-diario.component.html',
  styleUrl: './libro-diario.component.css'
})
export class LibroDiarioComponent implements OnInit {
  asientos: AsientoContableLibroMayor[] = [];
  fechaInicio: string = '2000-01-01';
  fechaFin: string = '2024-11-01';
  currentPage: number = 0;
  pageSize: number = 3;
  totalPages: number = 0;

  filtroForm: FormGroup;

  constructor(
    private reportesService: ReportesService,
    private fb: FormBuilder
  ) {
    this.filtroForm = this.fb.group({
      fechaInicio: [''],
      fechaFin: ['']
    });
  }

  ngOnInit(): void {
    this.buscarAsientos();
  }

  // Método para determinar el tipo de asiento
  determinarTipoAsiento(asiento: AsientoContable | AsientoContableLibroMayor): string {
    // Convertimos a AsientoContable si es AsientoContableLibroMayor
    const movimientos = 'movimientos' in asiento ? asiento.movimientos : [];

    const tieneMovimientoModificativo = movimientos.some(mov => ['R+', 'R-'].includes(mov.tipoMovimiento));
    return tieneMovimientoModificativo ? 'Modificativa' : 'Permutativa';
  }

  // Método para calcular el total de la columna "Debe"
  calcularTotalDebe(): number {
    return this.asientos.flatMap(asiento => asiento.movimientos)
      .filter(movimiento => ['+A', '-P', 'R-'].includes(movimiento.tipoMovimiento))
      .reduce((total, movimiento) => total + movimiento.monto, 0);
  }

  // Método para calcular el total de la columna "Haber"
  calcularTotalHaber(): number {
    return this.asientos.flatMap(asiento => asiento.movimientos)
      .filter(movimiento => ['-A', '+P', 'R+'].includes(movimiento.tipoMovimiento))
      .reduce((total, movimiento) => total + movimiento.monto, 0);
  }

  // Buscar asientos contables entre dos fechas
  buscarAsientos(): void {
    const { fechaInicio, fechaFin } = this.filtroForm.value;
    this.reportesService.getLibroDiario(this.currentPage, this.pageSize, fechaInicio, fechaFin)
      .subscribe((data: Page<AsientoContableLibroMayor>) => {
        this.asientos = data.content;
        this.totalPages = data.page.totalPages;
      });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.buscarAsientos();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.buscarAsientos();
  }

  clearFilters(): void {
    this.filtroForm.reset();
    this.fechaInicio = '';
    this.fechaFin = '';
    this.onSearch();
  }

  imprimirLibroDiario(): void {
    const { fechaInicio, fechaFin } = this.filtroForm.value;

    this.reportesService.getAllAsientos(fechaInicio, fechaFin)
      .subscribe((asientos: AsientoContable[]) => {
        const doc = new jsPDF();

        // Agregar un título al documento
        doc.setFontSize(16);
        doc.text('Libro Diario', 14, 20);

        const fechaInicioTexto = fechaInicio ? new Date(fechaInicio).toLocaleDateString() : 'N/A';
        const fechaFinTexto = fechaFin ? new Date(fechaFin).toLocaleDateString() : 'N/A';

        // Imprimir la cuenta y el periodo en una sola línea
        doc.setFontSize(12);
        doc.text(`Periodo: ${fechaInicioTexto} - ${fechaFinTexto}`, 14, 35);

        // Crear el encabezado de la tabla
        const columns = ['ID', 'Fecha', 'Movimientos', 'Debe', 'Haber', 'Tipo'];

        // Preparar los datos de la tabla
        const rows = asientos.flatMap(asiento =>
          asiento.movimientos.map((movimiento, index) => {
            const fecha = asiento.fecha ? new Date(asiento.fecha).toLocaleDateString() : '-----';

            // Ajustar la descripción para incluir el tipo de movimiento entre paréntesis
            const descripcion = `${movimiento.descripcion} (${movimiento.tipoMovimiento})`;

            const debe = ['+A', '-P', 'R-'].includes(movimiento.tipoMovimiento) ? movimiento.monto : '';
            const haber = ['-A', '+P', 'R+'].includes(movimiento.tipoMovimiento) ? movimiento.monto : '';

            // Determinar el tipo de asiento (solo en la primera fila del asiento)
            const tipoAsiento = index === 0 ? this.determinarTipoAsiento(asiento) : '';

            return index === 0
              ? [asiento.id || '', fecha, descripcion, debe, haber, tipoAsiento]
              : ['', '', descripcion, debe, haber, ''];
          })
        );

        // Agregar las sumas al final del PDF
        const totalDebe = this.calcularTotalDebe();
        const totalHaber = this.calcularTotalHaber();

        rows.push(['', '', '', totalDebe, totalHaber, '']);

        // Usar autotable para agregar la tabla al PDF
        autoTable(doc, {
          head: [columns],
          body: rows,
          startY: 45,
          theme: 'grid',
          headStyles: { fillColor: [22, 160, 133] },
          styles: { cellPadding: 3, fontSize: 10 },
          margin: { top: 10 },
        });

        // Guardar el documento como un archivo PDF
        doc.save('libro_diario.pdf');
      });
  }
}
