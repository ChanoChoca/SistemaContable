import { Component, OnInit } from '@angular/core';
import { ReportesService } from '../services/reportes.service';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DatePipe} from "@angular/common";
import {MovimientoContable} from "../models/movimiento.model";
import {Cuenta} from "../models/cuenta.model";
import {CuentaService} from "../services/cuenta.service";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // Asegúrate de importar esto para generar tablas

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
  movimientos: MovimientoContable[] = [];
  cuentas: Cuenta[] = [];
  filtroForm: FormGroup;
  saldoAcumulativo: number[] = [];

  constructor(
    private cuentaService: CuentaService,
    private reportesService: ReportesService,
    private fb: FormBuilder
  ) {
    this.filtroForm = this.fb.group({
      cuentaId: [''], // Add cuentaId to the form
      fechaInicio: [''],
      fechaFin: ['']
    });
  }

  ngOnInit(): void {
    this.cargarCuentas(); // Cargar las cuentas al iniciar
  }

  // Método para cargar las cuentas
  cargarCuentas(): void {
    this.cuentaService.getCuentas().subscribe(cuentas => {
      this.cuentas = cuentas; // Ajusta según la estructura de respuesta de tu API
    });
  }

  // Buscar asientos contables para una cuenta específica entre dos fechas
  buscarMovimientos(): void {
    const { cuentaId, fechaInicio, fechaFin } = this.filtroForm.value;

    if (!cuentaId || !fechaInicio || !fechaFin) {
      console.warn('Debe seleccionar una cuenta y proporcionar fechas válidas.');
      return;
    }

    this.reportesService.getLibroMayor(cuentaId, fechaInicio, fechaFin)
      .subscribe((data: MovimientoContable[]) => {
        this.movimientos = data;
        this.calcularSaldoAcumulativo();
      }, error => {
        console.error('Error fetching movements:', error);
      });

  }

  // Método para calcular el saldo acumulativo de los movimientos
  calcularSaldoAcumulativo(): void {
    let saldo = 0;
    this.saldoAcumulativo = this.movimientos.map(movimiento => {
      if (movimiento.esDebito) {
        saldo += movimiento.monto;
      } else {
        saldo -= movimiento.monto;
      }
      return saldo; // Retorna el saldo después de cada movimiento
    });
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

    // Agregar un título al documento
    doc.setFontSize(16);
    doc.text('Libro Mayor', 14, 22);

    // Crear el encabezado de la tabla
    const columns = ['Fecha', 'Operación', 'Debe', 'Haber', 'Saldo', 'Cuenta'];

    // Preparar los datos de la tabla
    const rows = this.movimientos.map((movimiento, index) => {
      const fecha = movimiento.asiento.fecha ? new Date(movimiento.asiento.fecha).toLocaleDateString() : '-----';
      const descripcion = movimiento.descripcion;
      const debe = movimiento.esDebito ? movimiento.monto : 0;
      const haber = movimiento.esDebito ? 0 : movimiento.monto;
      const saldo = this.saldoAcumulativo[index];
      const cuenta = movimiento.asiento.usuarioEmail || '-----' ;

      return [fecha, descripcion, debe, haber, saldo, cuenta];
    });

    // Usar autotable para agregar la tabla al PDF
    autoTable(doc, {
      head: [columns], // Usar las columnas como encabezado
      body: rows, // Usar los datos de la tabla
      startY: 30, // Posición Y donde se comenzará la tabla
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] }, // Color de fondo del encabezado
      styles: { cellPadding: 3, fontSize: 10 },
      margin: { top: 10 },
    });

    doc.save('libro_mayor.pdf');
  }
}
