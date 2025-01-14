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
import {ArcaService} from "../services/arca.service";
import {ArticulosVentas} from "../models/articulos-ventas";
import {FormsModule} from "@angular/forms";
import QRCode from "qrcode";

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    RouterLink,
    FaIconComponent,
    FormsModule
  ],
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit {
  ventas: Ventas[] = [];
  articulosVentas: ArticulosVentas[] = [];
  pagos: Pagos[] = [];
  pagosFiltrados: { [ventaId: number]: Pagos[] } = {};
  cargandoPagos = true;
  authService = inject(AuthService);

  modalVisible = false; // Para controlar la visibilidad del modal
  selectedCbteTipo: number = 1; // Factura A por defecto
  ventaId: number = 0; // Id de la venta seleccionada

  constructor(
    private ventasService: VentasService,
    private pagosService: PagosService,
    private articulosVentasService: ArticulosVentasService,
    private arcaService: ArcaService
  ) {}

  ngOnInit(): void {
    this.cargarVentas();
    this.cargarPagos();
  }

  cargarVentas(): void {
    this.ventasService.getVentas().subscribe({
      next: (ventas) => {
        const userEmail = this.authService.getAuthenticatedUserEmail(); // Obtener el correo del usuario autenticado
        this.ventas = ventas.filter((venta) => venta.vendedor?.email === userEmail); // Filtrar por vendedor
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
  formatearFechaVto(fecha: number): string {
    const fechaStr = fecha.toString();
    const año = fechaStr.substring(0, 4);
    const mes = fechaStr.substring(4, 6);
    const día = fechaStr.substring(6, 8);
    return `${día}/${mes}/${año}`;
  }

  abrirModal(ventaId: number): void {
    this.ventaId = ventaId;
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
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
                doc.text(`Vendedor: ${venta.vendedor?.email}`, 10, 40);
                // Dejarlo como está
                // doc.text(`N° Comprobante: ${venta.nroComprobante}`, 10, 50);
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

  // Función para imprimir la factura electrónica
  imprimirFacturaElectronica(ventaId: number, cbteTipo: number): void {
    // Obtener el comprobante de la venta
    this.arcaService.obtenerComprobante(ventaId, cbteTipo).subscribe({
      next: (comprobante) => {
        // Llamar a obtenerFactura si es necesario para obtener más datos de la factura
        this.arcaService.obtenerFactura(cbteTipo, comprobante.comprobanteNro).subscribe({
          next: (factura) => {
            console.log('Factura:', factura);
            this.articulosVentasService.getArticulosVentasByVentaId(ventaId).subscribe(articulosVentas => {
              this.articulosVentas = articulosVentas;
              console.log(articulosVentas)
              this.pagosService.getPagosByVentaId(ventaId).subscribe(pagos => {
                const pagosList = pagos.map(pago => pago.cuenta.nombre).join(", ");                // Crear instancia de jsPDF
                const doc = new jsPDF();

                const pdfWidth = doc.internal.pageSize.getWidth();

                const resultGet = factura["soap:Envelope"]["soap:Body"]["FECompConsultarResponse"]["FECompConsultarResult"]["ResultGet"];
                //Datos a incluir (izquierda)
                doc.setFontSize(20)
                doc.text(`SSAA`, 10, 10);
                doc.setFontSize(10)
                doc.text(`Razón social: SSAA`, 10, 20)
                doc.text(`Domicilio Comercial: Calle falsa 123`, 10, 30)
                doc.text(`Condición Frente al IVA: Responsable inscripto`, 10, 40)

                //Datos a incluir (medio)
                const tipoComprobanteMap = {
                  1: 'A',
                  6: 'B',
                  11: 'C',
                  51: 'M'
                };
                const tipoComprobante = tipoComprobanteMap[resultGet.CbteTipo as keyof typeof tipoComprobanteMap] || resultGet.CbteTipo;
                doc.setFontSize(25);
                doc.text(`${tipoComprobante}`, pdfWidth/2 - 3, 17);
                doc.line(pdfWidth/2 - 7, 5, pdfWidth/2 + 7, 5); // Línea superior
                doc.line(pdfWidth/2 + 7, 5, pdfWidth/2 + 7, 22); // Línea derecha
                doc.line(pdfWidth/2 + 7, 22, pdfWidth/2 - 7, 22); // Línea inferior
                doc.line(pdfWidth/2 - 7, 22, pdfWidth/2 - 7, 5); // Línea izquierda

                //Datos a incluir (derecha)
                doc.setFontSize(20)
                doc.text(`Factura`, pdfWidth/2 + 20, 10)
                doc.setFontSize(10)
                doc.text(`Punto de venta: ${resultGet.PtoVta}`, pdfWidth/2 + 20, 20)
                doc.text(`Comp. Nro: ${comprobante.comprobanteNro}`, pdfWidth/2 + 60, 20)
                doc.text(`Fecha de Emisión: ${this.formatearFechaVto(resultGet.CbteFch)}`, pdfWidth/2 + 20, 30)
                doc.text(`CUIT: 20429631778`, pdfWidth/2 + 20, 40)
                doc.text(`Fecha de Inicio de Actividades: 30/08/2024`, pdfWidth/2 + 20, 50)

                doc.line(0, 60, pdfWidth, 60);
                doc.line(0, 62, pdfWidth, 62);

                // doc.text(`Período Facturado Desde: ${resultGet.FchServDesde} Hasta: ${resultGet.FchServHasta}`, 10, 72);
                // doc.text(`Fecha de Vto. para el pago: ${resultGet.FchVtoPago}`, pdfWidth/2 + 20, 72)

                // doc.line(0, 82, pdfWidth, 82);
                // doc.line(0, 84, pdfWidth, 84);

                //Datos a incluir (izquierda)
                if (resultGet.DocNro !== 0) {
                  doc.text(`CUIL/CUIT: ${resultGet.DocNro}`, 10, 72);
                }
                if(resultGet.CbteTipo === 1 || resultGet.CbteTipo === 51) {
                  //Factura A receptor: Monotributista, Responsable Inscripto
                  doc.text(`Condición Frente al IVA: Responsable Inscripto`, 10, 82);
                } else if (resultGet.CbteTipo === 6) {
                  //Factura B receptor: (Consumidor final (APLICA IVA) / Exento), Turista del extranjero
                  doc.text(`Condición Frente al IVA: Consumidor Final`, 10, 82);
                } else {
                  //Factura T receptor: Monotributista, Responsable Inscripto
                  doc.text(`Condición Frente al IVA: Responsable Inscripto`, 10, 82);
                }
                //TODO: PERIODO FACTURADO (innecesario)
                doc.text(`Condición de venta: ${pagosList}`, 10, 92)

                //Datos a incluir (derecha)
                doc.text(`Apellido y Nombre / Razón social: ${comprobante.venta.cliente?.firstName} ${comprobante.venta.cliente?.lastName}`, pdfWidth/2 - 40, 72);
                doc.text(`Domicilio: ${comprobante.venta.cliente!.direccion}`, pdfWidth/2 - 10, 82);

                doc.line(0, 96, pdfWidth, 96);

                // Tabla de artículos
                const tableData = this.articulosVentas.map((articulo) => ([
                  articulo.articulo.nombre, // Nombre del artículo
                  articulo.cantidad, // Cantidad
                  articulo.precioVenta.toFixed(2), // Precio de venta
                  articulo.subtotal.toFixed(2), // Subtotal
                ]));

                autoTable(doc, {
                  head: [['Artículo', 'Cantidad', 'Precio Unitario', 'Subtotal']],
                  body: tableData,
                  headStyles: {
                    fillColor: '#2a9d8f',
                  },
                  tableLineWidth: 0.5,
                  startY: 98,
                  didDrawPage: (data) => {
                    // Esto se ejecuta después de que la tabla ha sido dibujada
                    const tableHeight = data.cursor!.y;
                    // Ahora puedes usar tableHeight para posicionar el siguiente contenido
                    doc.setLineWidth(0.5);
                    doc.line(0, tableHeight + 2, pdfWidth, tableHeight + 2);

                    doc.text(`Subtotal: $${resultGet.ImpNeto.toFixed(2)}`, pdfWidth / 2 + 30, tableHeight + 12);
                    doc.text(`Importe Otros Tributos: $${resultGet.ImpIVA.toFixed(2)}`, pdfWidth / 2 + 30, tableHeight + 22);
                    doc.text(`Importe total: $${resultGet.ImpTotal.toFixed(2)}`, pdfWidth / 2 + 30, tableHeight + 32);

                    doc.line(0, tableHeight + 42, pdfWidth, tableHeight + 42);
                    doc.text(`CAE Nº: ${resultGet.CodAutorizacion}`, pdfWidth / 2 + 30, tableHeight + 52);
                    doc.text(`Fecha de Vto. de CAE: ${this.formatearFechaVto(resultGet.FchVto)}`, pdfWidth / 2 + 30, tableHeight + 62);

                    const fechaString = resultGet.CbteFch.toString();
                    const fechaFormateada = `${fechaString.slice(0, 4)}-${fechaString.slice(4, 6)}-${fechaString.slice(6, 8)}`;

                    // Datos variables (debe ser obtenido de la respuesta de AFIP)
                    const datos = {
                      ver: 1,
                      fecha: fechaFormateada,
                      cuit: 20429631778,
                      ptoVta: resultGet.PtoVta,
                      tipoCmp: resultGet.CbteTipo,
                      nroCmp: comprobante.comprobanteNro,
                      importe: resultGet.ImpTotal,
                      moneda: resultGet.MonId,
                      ctz: 1,
                      //DocTipo puede ser 80 o 99
                      //En caso de que DocTipo sea 99, DocNro será 0.
                      tipoDocRec: resultGet.DocTipo || null, // Solo si aplica
                      nroDocRec: resultGet.DocNro || null, // Solo si aplica
                      tipoCodAut: 'E',
                      codAut: resultGet.CodAutorizacion,
                    };

                    // Generar la URL del QR
                    const base64Data = this.encodeBase64(datos);
                    const urlQR = `https://www.afip.gob.ar/fe/qr/?p=${base64Data}`;

                    // Cargar la imagen de tu aplicación
                    const imagePath = 'assets/images/arca.png';
                    const img = new Image();
                    img.src = imagePath;

                    img.onload = function () {
                      // Agregar la imagen al PDF
                      doc.addImage(img, 'PNG', 40, tableHeight + 50, 590/7, 60/7);

                      doc.text('Comprobante Autorizado', 40, tableHeight + 50 + (60 / 7) + 6);
                      doc.setFontSize(8)
                      doc.text('Esta Administración Federal no se responsabiliza por los datos ingresados en el detalle de la operación', 40, tableHeight + 50 + (60 / 10) + 16);

                      // Generar el código QR y agregarlo al PDF
                      QRCode.toDataURL(urlQR, function (err, url) {
                        if (err) {
                          console.error('Error generando el QR:', err);
                        } else {
                          doc.addImage(url, 'PNG', 10, tableHeight + 46, 30, 30);

                          // Descargar el PDF
                          doc.save(`Factura_${resultGet.CbteDesde}.pdf`);
                        }
                      });
                    };
                  }
                });
              });
            });
          },
          error: (err) => {
            console.error('Error al obtener la factura:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener el comprobante:', err);
      }
    });

    // Cerrar el modal después de la operación
    this.cerrarModal();
  }

  encodeBase64(jsonData: object): string {
    const jsonString = JSON.stringify(jsonData);
    return btoa(jsonString); // Convierte el JSON a Base64
  }

  protected readonly faDownload = faDownload;
}
