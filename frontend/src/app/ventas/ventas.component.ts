import { Component, inject, OnInit } from '@angular/core';
import { Ventas } from "../models/ventas";
import { RouterLink } from "@angular/router";
import { AuthService } from "../core/auth/auth.service";
import { faDownload } from "@fortawesome/free-solid-svg-icons/faDownload";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Pagos } from "../models/pagos";
import {PagosService} from "../services/pagos.service";
import {VentasService} from "../services/ventas.service";
import {ArticulosVentasService} from "../services/articulos-ventas.service";

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    RouterLink,
    FaIconComponent
  ],
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit {
  ventas: Ventas[] = [];
  pagos: Pagos[] = [];
  pagosFiltrados: { [ventaId: number]: Pagos[] } = {};
  cargandoPagos = true;
  authService = inject(AuthService);

  constructor(
    private ventasService: VentasService,
    private pagosService: PagosService,
    private articulosVentasService: ArticulosVentasService
  ) {}

  ngOnInit(): void {
    this.cargarVentas();
    this.cargarPagos();
  }

  cargarVentas(): void {
    this.ventasService.getVentas().subscribe({
      next: (ventas) => {
        const userEmail = this.authService.getAuthenticatedUserEmail(); // Obtener el correo del usuario autenticado
        this.ventas = ventas.filter((venta) => venta.vendedorEmail === userEmail); // Filtrar por vendedor
      },
      error: (err) => {
        console.error('Error al cargar las ventas', err);
      }
    });
  }

  cargarPagos(): void {
    this.pagosService.getPagos().subscribe({
      next: (pagos) => {
        this.pagos = pagos;
        this.pagos.forEach((pago) => {
          const ventaId = pago.venta?.id;
          if (ventaId) {
            if (!this.pagosFiltrados[ventaId]) {
              this.pagosFiltrados[ventaId] = [];
            }
            this.pagosFiltrados[ventaId].push(pago);
          }
        });
        this.cargandoPagos = false;
      },
      error: (err) => {
        console.error('Error al cargar los pagos', err);
        this.cargandoPagos = false;
      }
    });
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  imprimirFacturaVenta(ventaId: number): void {
    this.ventasService.getVentaById(ventaId).subscribe({
      next: (venta) => {
        // Obtener los pagos relacionados con la venta
        this.pagosService.getPagos().subscribe({
          next: (pagos) => {
            // Filtrar los pagos de esta venta
            const pagosVenta = pagos.filter(pago => pago.venta?.id === ventaId);

            // Obtener los artículos vendidos relacionados con la venta
            this.articulosVentasService.getArticulosVentas().subscribe({
              next: (articulosVentas) => {
                // Filtrar artículos que correspondan a esta venta
                const articulosDeVenta = articulosVentas.filter(av => av.venta?.id === ventaId);

                const doc = new jsPDF();
                const rows: (string | number)[][] = [];
                doc.setFontSize(16);
                doc.text(`Factura de Venta N° ${venta.nroFactura}`, 10, 10);

                doc.setFontSize(12);
                doc.text(`Fecha: ${new Date(venta.fecha).toLocaleDateString()}`, 10, 20);
                doc.text(`Cliente: ${venta.cliente?.email || 'N/A'}`, 10, 30);
                doc.text(`Vendedor: ${venta.vendedorEmail}`, 10, 40);
                doc.text(`N° Comprobante: ${venta.nroComprobante}`, 10, 50);
                doc.text(`Formas de Pago:`, 10, 60);

                let yPosition = 70;
                pagosVenta.forEach((pago: Pagos) => {
                  doc.text(`- Cuenta: ${pago.cuenta.nombre}, Cantidad: ${pago.cantidad}`, 10, yPosition);
                  yPosition += 10;
                });

                // Agregar filas de artículos vendidos
                articulosDeVenta.forEach(articuloVenta => {
                  const nombre = articuloVenta.articulo.nombre;
                  const cantidad = articuloVenta.cantidad;
                  const precioVenta = articuloVenta.precioVenta;
                  const subTotal = articuloVenta.subtotal;
                  rows.push([nombre, cantidad, precioVenta, subTotal]);
                });

                const columns = ['Artículo', 'Cantidad', 'Precio Venta', 'Subtotal'];

                autoTable(doc, {
                  head: [columns],
                  body: rows,
                  startY: yPosition + 10,
                });

                // Calcular y mostrar el total
                const total = articulosDeVenta.reduce((sum, av) => sum + av.subtotal, 0);
                yPosition += rows.length * 10 + 20;
                doc.text(`Total: $${total.toFixed(2)}`, 10, yPosition);

                doc.save(`Factura_Venta_${venta.nroFactura}.pdf`);
              },
              error: (err) => {
                console.error('Error al cargar los artículos vendidos', err);
              }
            });
          },
          error: (err) => {
            console.error('Error al cargar los pagos', err);
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar la venta', err);
      }
    });
  }

  protected readonly faDownload = faDownload;
}
