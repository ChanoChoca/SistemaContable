import { Component, OnInit } from '@angular/core';
import { ReportesService } from '../services/reportes.service';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DatePipe} from "@angular/common";
import {Cuenta} from "../models/cuenta.model";
import {CuentaService} from "../services/cuenta.service";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {CuentaAsiento} from "../models/cuenta-asiento.model";
import {faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons/faMagnifyingGlass";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faEraser} from "@fortawesome/free-solid-svg-icons/faEraser";
import {faDownload} from "@fortawesome/free-solid-svg-icons/faDownload";

@Component({
  selector: 'app-libro-mayor',
  standalone: true,
    imports: [
        DatePipe,
        FormsModule,
        ReactiveFormsModule,
        FaIconComponent
    ],
  templateUrl: './libro-mayor.component.html',
  styleUrl: './libro-mayor.component.css'
})
export class LibroMayorComponent implements OnInit {
  cuentaAsientos: CuentaAsiento[] = [];
  cuentas: Cuenta[] = [];
  saldoCuenta: number = 0;
  filtroForm: FormGroup;
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
      // Filtrar cuentas activas antes de procesarlas
      const cuentasActivas = cuentas.filter(cuenta => cuenta.activa);
      this.cuentas = this.flattenCuentas(cuentasActivas);
    });
  }

  flattenCuentas(cuentas: Cuenta[]): Cuenta[] {
    const result: Cuenta[] = [];

    const agregarCuentaUnica = (cuenta: Cuenta) => {
      if (!result.some(c => c.id === cuenta.id)) {
        result.push(cuenta);
      }
    };

    const procesarCuentas = (cuentas: Cuenta[]) => {
      cuentas.forEach(cuenta => {
        agregarCuentaUnica(cuenta);

        // Continuar procesando las subCuentas activas
        if (cuenta.subCuentas && cuenta.subCuentas.length > 0) {
          const subCuentasActivas = cuenta.subCuentas.filter(subCuenta => subCuenta.activa);
          procesarCuentas(subCuentasActivas);
        }
      });
    };

    procesarCuentas(cuentas);
    return result;
  }

  buscarCuentaAsientos(): void {
    const { cuentaId, fechaInicio, fechaFin } = this.filtroForm.value;

    if (!cuentaId || !fechaInicio || !fechaFin) {
      console.warn('Debe seleccionar una cuenta y proporcionar fechas válidas.');
      return;
    }

    this.busquedaRealizada = true;  // Marcar que se ha realizado una búsqueda

    this.cuentaService.getCuentaById(parseInt(cuentaId, 10)).subscribe(cuenta => {
      this.nombreCuentaSeleccionada = cuenta ? cuenta.nombre : 'Cuenta Desconocida';
      this.saldoCuenta = cuenta.saldoActual;

      // Convertir las fechas a formato ISO si son válidas
      const fechaInicioISO = new Date(fechaInicio).toISOString();
      const fechaFinISO = new Date(fechaFin).toISOString();

      this.reportesService.getLibroMayor(cuentaId, fechaInicioISO, fechaFinISO)
        .subscribe((data: CuentaAsiento[]) => {
          this.cuentaAsientos = data;
        }, error => {
          console.error('Error fetching movements:', error);
        });
    });
  }

  onSearch(): void {
    this.buscarCuentaAsientos();
  }

  clearFilters(): void {
    this.filtroForm.reset();
    this.cuentaAsientos = [];
  }

  calcularSaldoInicial(): number {
    if (!this.cuentaAsientos || this.cuentaAsientos.length === 0) {
      return 0; // O algún valor por defecto
    }

    const primerAsiento = this.cuentaAsientos[0];
    if (primerAsiento.debe > 0) {
      return primerAsiento.saldo - primerAsiento.debe;
    } else {
      return primerAsiento.saldo + primerAsiento.haber;
    }
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
    let saldoInicial = 0;
    let saldoFinal = 0;

    const rows = [];

    // Si no hay cuentaAsientos, usar saldoCuenta como saldo inicial y final
    if (this.cuentaAsientos.length === 0) {
      saldoInicial = saldoFinal = this.saldoCuenta;
      rows.push(['', 'Saldo inicial', '', '', saldoInicial]);
      rows.push(['', 'Saldo final', '', '', saldoFinal]);
    } else {
      // Si hay cuentaAsientos, calcular los saldos
      saldoInicial = this.calcularSaldoInicial();
      rows.push(['', 'Saldo inicial', '', '', saldoInicial]);

      this.cuentaAsientos.forEach((cuentaAsiento) => {
        const fecha = cuentaAsiento.asiento.fecha ? agregarUnDia(cuentaAsiento.asiento.fecha) : '';
        const descripcion = `${cuentaAsiento.cuenta.nombre}`;
        const debe = cuentaAsiento.debe === 0 ? '' : cuentaAsiento.debe;
        const haber = cuentaAsiento.haber === 0 ? '' : cuentaAsiento.haber;
        const saldo = cuentaAsiento.saldo;

        rows.push([fecha, descripcion, debe, haber, saldo]);
      });

      // Agregar fila de saldo final si hay cuentaAsientos
      saldoFinal = this.cuentaAsientos.at(-1)?.saldo ?? saldoInicial; // Si no hay último asiento, usar saldoInicial
      rows.push(['', 'Saldo final', '', '', saldoFinal]);
    }

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

    protected readonly faMagnifyingGlass = faMagnifyingGlass;
  protected readonly faEraser = faEraser;
    protected readonly faDownload = faDownload;
}
