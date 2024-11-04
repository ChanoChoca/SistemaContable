import {Component, OnInit} from '@angular/core';
import { ReportesService } from '../services/reportes.service';
import { AsientoContable } from '../models/asiento.model';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {DatePipe} from "@angular/common";
import {Page} from "../models/page.model";
import {jsPDF} from "jspdf";
import autoTable from "jspdf-autotable";

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
  asientos: AsientoContable[] = [];
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

  // Buscar asientos contables entre dos fechas
  buscarAsientos(): void {
    const { fechaInicio, fechaFin } = this.filtroForm.value;
    this.reportesService.getLibroDiario(this.currentPage, this.pageSize, fechaInicio, fechaFin)
      .subscribe((data: Page<AsientoContable>) => {
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
        doc.text('Libro Diario', 14, 22);

        // Crear el encabezado de la tabla
        const columns = ['ID', 'Fecha', 'Movimientos', 'Debe', 'Haber'];

        // Preparar los datos de la tabla
        const rows = asientos.flatMap(asiento =>
          asiento.movimientos.map((movimiento, index) => {
            const fecha = asiento.fecha ? new Date(asiento.fecha).toLocaleDateString() : '-----';
            const descripcion = movimiento.descripcion || '';
            const debe = movimiento.esDebito ? movimiento.monto : '';
            const haber = movimiento.esDebito ? '' : movimiento.monto;

            return index === 0 ?
              [asiento.id || '', fecha, descripcion, debe, haber] :
              ['', '', descripcion, debe, haber];
          })
        );

        // Usar autotable para agregar la tabla al PDF
        autoTable(doc, {
          head: [columns],
          body: rows,
          startY: 30,
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
