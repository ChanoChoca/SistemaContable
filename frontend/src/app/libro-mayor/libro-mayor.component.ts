import { Component, OnInit } from '@angular/core';
import { ReportesService } from '../services/reportes.service';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DatePipe} from "@angular/common";
import {MovimientoContable, MovimientoContableLibroMayor} from "../models/movimiento.model";
import {Cuenta} from "../models/cuenta.model";
import {CuentaService} from "../services/cuenta.service";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Fecha (movimiento), operacion (movimiento), debe, haber
// Se tendrá un saldo inicial y un saldo final
// La operación representa una sumatoria de varios movimientos con el mismo nombre.

@Component({
  selector: 'app-libro-mayor',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './libro-mayor.component.html',
  styleUrl: './libro-mayor.component.css'
})
export class LibroMayorComponent implements OnInit {
  movimientos: MovimientoContableLibroMayor[] = []; // Cambia el tipo de MovimientoContable a AsientoContableLibroMayor
  cuentas: Cuenta[] = [];
  filtroForm: FormGroup;
  saldoAcumulativo: number[] = [];
  nombreCuentaSeleccionada: string = '';
  busquedaRealizada: boolean = false;

  constructor(
    private cuentaService: CuentaService,
    private reportesService: ReportesService,
    private fb: FormBuilder
  ) {
    this.filtroForm = this.fb.group({
      cuentaId: [''],
      fechaInicio: [''],
      fechaFin: ['']
    });
  }

  ngOnInit(): void {
    this.cargarCuentas();
  }

  cargarCuentas(): void {
    this.cuentaService.getCuentas().subscribe(cuentas => {
      this.cuentas = this.flattenCuentas(cuentas);
    });
  }

  flattenCuentas(cuentas: Cuenta[]): Cuenta[] {
    let result: Cuenta[] = [];

    cuentas.forEach(cuenta => {
      result.push(cuenta);
      if (cuenta.subCuentas && cuenta.subCuentas.length > 0) {
        result = result.concat(this.flattenCuentas(cuenta.subCuentas));
      }
    });

    return result;
  }

  buscarMovimientos(): void {
    const { cuentaId, fechaInicio, fechaFin } = this.filtroForm.value;

    if (!cuentaId || !fechaInicio || !fechaFin) {
      console.warn('Debe seleccionar una cuenta y proporcionar fechas válidas.');
      return;
    }

    this.busquedaRealizada = true;  // Marcar que se ha realizado una búsqueda

    this.cuentaService.getCuentaById(parseInt(cuentaId, 10)).subscribe(cuenta => {
      this.nombreCuentaSeleccionada = cuenta ? cuenta.nombre : 'Cuenta Desconocida';

      this.reportesService.getLibroMayor(cuentaId, fechaInicio, fechaFin)
        .subscribe((data: MovimientoContableLibroMayor[]) => {
          this.movimientos = data;
          if (this.movimientos.length === 0) {
            this.saldoAcumulativo = [cuenta.saldo];
          } else {
            this.calcularSaldoAcumulativo();
          }
        }, error => {
          console.error('Error fetching movements:', error);
        });
    });
  }

  calcularSaldoAcumulativo(): void {
    let saldo = this.obtenerSaldoInicial();
    this.saldoAcumulativo = [saldo];

    this.movimientos.forEach(movimiento => {
      if (['+A', '-P', 'R-'].includes(movimiento.tipoMovimiento)) {
        saldo += movimiento.monto;
      } else {
        saldo -= movimiento.monto;
      }
      this.saldoAcumulativo.push(saldo);
    });
  }

  obtenerSaldoInicial(): number {
    const cuentaSeleccionada = this.cuentas.find(cuenta => cuenta.id === parseInt(this.filtroForm.value.cuentaId, 10));
    return cuentaSeleccionada ? cuentaSeleccionada.saldo : 0;
  }

  onSearch(): void {
    this.buscarMovimientos();
  }

  clearFilters(): void {
    this.filtroForm.reset();
    this.movimientos = [];
    this.saldoAcumulativo = [];
  }

  imprimirLibroMayor(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Libro Mayor', 14, 20);

    const agregarUnDia = (fecha: string | Date): string => {
      const date = new Date(fecha);
      date.setDate(date.getDate() + 1); // Aumenta un día a la fecha
      return date.toLocaleDateString('es-ES'); // Devuelve la fecha con el formato adecuado
    };

    const { fechaInicio, fechaFin } = this.filtroForm.value;
    const fechaInicioTexto = fechaInicio ? agregarUnDia(fechaInicio) : 'N/A';
    const fechaFinTexto = fechaFin ? agregarUnDia(fechaFin) : 'N/A';

    doc.setFontSize(12);
    doc.text(`Cuenta: ${this.nombreCuentaSeleccionada} | Periodo: ${fechaInicioTexto} - ${fechaFinTexto}`, 14, 35);

    const columns = ['Fecha', 'Operación', 'Debe', 'Haber', 'Saldo'];
    const saldoInicial = this.obtenerSaldoInicial();
    const rows = [];

    // Agregar fila de saldo inicial
    rows.push(['', 'Saldo inicial', '', '', saldoInicial]);

    this.movimientos.forEach((movimiento, index) => {
      const fecha = movimiento.fecha ? new Date(movimiento.fecha).toLocaleDateString() : '';
      const descripcion = `${movimiento.descripcion} (${movimiento.tipoMovimiento})`;
      const debe = ['+A', '-P', 'R-'].includes(movimiento.tipoMovimiento) ? movimiento.monto : '';
      const haber = ['-A', '+P', 'R+'].includes(movimiento.tipoMovimiento) ? movimiento.monto : '';
      const saldo = this.saldoAcumulativo[index + 1]; // Siguiente saldo después del movimiento

      rows.push([fecha, descripcion, debe, haber, saldo]);
    });

    // Agregar fila de saldo final
    const saldoFinal = this.saldoAcumulativo[this.saldoAcumulativo.length - 1];
    rows.push(['', 'Saldo final', '', '', saldoFinal]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
      styles: { cellPadding: 3, fontSize: 10 },
      margin: { top: 10 },
    });

    doc.save('libro_mayor.pdf');
  }
}
