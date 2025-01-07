package com.chanochoca.app.ventas.controller;

import com.chanochoca.app.ventas.models.ComprobanteRequest;
import com.chanochoca.app.ventas.models.entity.Comprobantes;
import com.chanochoca.app.ventas.service.ComprobantesService;
import com.chanochoca.app.ventas.service.WsfeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wsfe")
public class ArcaController {

    private final WsfeService wsfeService;
    private final ComprobantesService comprobantesService;

    public ArcaController(WsfeService wsfeService, ComprobantesService comprobantesService) {
        this.wsfeService = wsfeService;
        this.comprobantesService = comprobantesService;
    }

    @PostMapping("/crear-comprobantes")
    public ResponseEntity<Boolean> crearFacturas(@RequestBody List<ComprobanteRequest> comprobantes) {
        // Llamar al servicio para procesar la lista de comprobantes
        wsfeService.crearComprobante(comprobantes);
        return ResponseEntity.ok(true);
    }

    @GetMapping("/factura")
    public ResponseEntity<String> getFactura(@RequestParam int cbteTipo, @RequestParam Long cbteNro) {
        return ResponseEntity.ok().body(wsfeService.consultarComprobante(cbteTipo, cbteNro));
    }

    @GetMapping("/comprobante")
    public ResponseEntity<Comprobantes> getComprobante(@RequestParam Long ventaId, @RequestParam int comprobanteTipo) {
        return ResponseEntity.ok().body(
                this.comprobantesService.findComprobanteByVentaIdAndCbteTipo(ventaId, comprobanteTipo));
    }
}
