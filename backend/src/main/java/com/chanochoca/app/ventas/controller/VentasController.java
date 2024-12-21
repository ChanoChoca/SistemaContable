package com.chanochoca.app.ventas.controller;

import com.chanochoca.app.ventas.models.entity.Ventas;
import com.chanochoca.app.ventas.service.VentasService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequestMapping("/api/ventas")
public class VentasController {

    private final VentasService ventasService;

    public VentasController(VentasService ventasService) {
        this.ventasService = ventasService;
    }

    @GetMapping
    public ResponseEntity<List<Ventas>> getVentas() {
        return ResponseEntity.ok().body(ventasService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ventas> getVentasById(@PathVariable Long id) {
        return ResponseEntity.ok(ventasService.getVentaById(id));
    }

    @GetMapping("/clienteEmail")
    public ResponseEntity<List<Ventas>> getVentasByClienteEmail(@RequestParam String userEmail) {
        return ResponseEntity.ok(ventasService.getVentasByClienteEmail(userEmail));
    }
}
