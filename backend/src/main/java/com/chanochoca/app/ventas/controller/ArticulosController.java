package com.chanochoca.app.ventas.controller;

import com.chanochoca.app.ventas.models.entity.Articulos;
import com.chanochoca.app.ventas.service.ArticuloService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articulos")
public class ArticulosController {

    private final ArticuloService articuloService;

    public ArticulosController(ArticuloService articuloService) {
        this.articuloService = articuloService;
    }

    @GetMapping
    public ResponseEntity<List<Articulos>> getArticulos() {
        return ResponseEntity.ok(articuloService.getArticulos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Articulos> getArticuloById(@PathVariable Long id) {
        return ResponseEntity.ok(articuloService.getArticuloById(id));
    }

    @GetMapping("/check-nombre")
    public ResponseEntity<Boolean> checkArticuloNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(articuloService.existsByNombre(nombre));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Articulos> updateArticulo(@PathVariable Long id, @RequestBody Articulos articulo) {
        return ResponseEntity.ok(articuloService.updateArticulo(id, articulo));
    }

    @PostMapping
    public ResponseEntity<Articulos> createArticulo(@RequestBody Articulos articulo) {
        return ResponseEntity.ok(articuloService.createArticulo(articulo));
    }
}
