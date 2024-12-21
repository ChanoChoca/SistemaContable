// import {Component, OnInit} from '@angular/core';
// import {FacturaService} from "../services/facturas.service";
// import {FacturaResponse} from "../models/facutura-response";
//
// @Component({
//   selector: 'app-factura',
//   standalone: true,
//   imports: [],
//   templateUrl: './factura.component.html',
//   styleUrl: './factura.component.css'
// })
// export class FacturaComponent implements OnInit {
//   facturaResponse: FacturaResponse | undefined;
//
//   constructor(private facturaService: FacturaService) {}
//
//   ngOnInit() {
//     this.generarFactura();
//   }
//
//   // generarFactura(): void {
//   //   const facturaData = {
//   //     impTotal: 121,
//   //     impNeto: 100,
//   //     impIVA: 21,
//   //   };
//   //
//   //   this.facturaService.generarFactura(facturaData).subscribe(factura => {
//   //     this.facturaResponse = factura;
//   //   });
//   // }
//   generarFactura(): void {
//     const facturaData = {
//       impTotal: 121,
//       impNeto: 100,
//       impIVA: 21,
//     };
//
//     this.facturaService.generarFactura(facturaData).subscribe(factura => {
//       this.facturaResponse = factura;
//     });
//   }
//
//   imprimirFactura(): void {
//     if (!this.facturaResponse) {
//       console.error('No se ha generado la factura aún.');
//       return;
//     }
//
//     // Verifica que haya al menos un elemento en FECAEDetResponse
//     const detalle = this.facturaResponse.FECAESolicitarResult.FeDetResp.FECAEDetResponse[0];
//     if (!detalle) {
//       console.error('No hay detalles de la factura disponibles.');
//       return;
//     }
//
//     // Abre una nueva ventana para imprimir
//     const ventanaImpresion = window.open('', '', 'width=800,height=600');
//     if (ventanaImpresion) {
//       ventanaImpresion.document.write(`
//       <html>
//         <head>
//           <title>Factura</title>
//         </head>
//         <body>
//           <h1>Factura</h1>
//           <p>CAE: ${detalle.CAE}</p>
//           <p>Vencimiento CAE: ${detalle.CAEFchVto}</p>
//         </body>
//       </html>
//     `);
//       ventanaImpresion.document.close();
//       ventanaImpresion.print();
//     }
//   }
// }
