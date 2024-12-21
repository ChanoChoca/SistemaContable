package com.chanochoca.app.ventas.controller;

import com.chanochoca.app.ventas.models.ArticulosVentasDTO;
import com.chanochoca.app.ventas.models.entity.ArticulosVentas;
import com.chanochoca.app.ventas.service.ArticulosVentasService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articulos-ventas")
public class ArticulosVentasController {

    private final ArticulosVentasService articulosVentasService;

    public ArticulosVentasController(ArticulosVentasService articulosVentasService) {
        this.articulosVentasService = articulosVentasService;
    }

    @PostMapping
    public ResponseEntity<List<ArticulosVentas>> crearCuentasAsientos(@RequestBody ArticulosVentasDTO articulosVentasDTO) {
        // Llamar al servicio para procesar tanto el asiento como las cuentas afectadas
        List<ArticulosVentas> createdArticulosVentas = articulosVentasService.crearCuentasAsientos(articulosVentasDTO.getArticulosVentas(), articulosVentasDTO.getFormasDePago(), articulosVentasDTO.getCuotas(), articulosVentasDTO.getVenta());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdArticulosVentas);
    }

    @GetMapping
    public ResponseEntity<List<ArticulosVentas>> listarArticulosVentas() {
        List<ArticulosVentas> articulosVentas = articulosVentasService.getAll();
        return ResponseEntity.ok().body(articulosVentas);
    }

    @GetMapping("get-by-month")
    public List<ArticulosVentas> getArticulosVentasByMonth(@RequestParam String mes) {
        return articulosVentasService.findByMonth(mes);
    }
}
