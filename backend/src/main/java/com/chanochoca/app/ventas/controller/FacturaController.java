package com.chanochoca.app.ventas.controller;

import com.chanochoca.app.ventas.models.FacturaRequest;
import com.chanochoca.app.ventas.models.FacturaResponse;
import com.chanochoca.app.ventas.service.AfipService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/facturas")
public class FacturaController {

    private final AfipService afipService;

    public FacturaController(AfipService afipService) {
        this.afipService = afipService;
    }

    @PostMapping("/generar")
    public FacturaResponse generarFactura(@RequestBody FacturaRequest facturaRequest) {
        System.out.println("Factura " + facturaRequest.getImpIVA() + " " + facturaRequest.getImpNeto() + " " + facturaRequest.getImpTotal());
        try {
            return afipService.generarFactura(facturaRequest);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error generando la factura", e);
        }
    }
}

