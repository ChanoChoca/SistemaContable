package com.chanochoca.app.contable.controller;

import com.chanochoca.app.contable.models.entity.Asiento;
import com.chanochoca.app.contable.service.AsientoService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

@RestController
@RequestMapping("/api/asientos-contables")
public class AsientoController {

    private final AsientoService asientoService;

    public AsientoController(AsientoService asientoService) {
        this.asientoService = asientoService;
    }

    @GetMapping
    public ResponseEntity<Page<Asiento>> getAllAsientos(@RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "1") int size) {
        Page<Asiento> asientosContables = asientoService.findAll(page, size);
        return ResponseEntity.ok(asientosContables);
    }

    @GetMapping("/ultima-fecha")
    public ResponseEntity<Date> getFecha() {
        Date ultimaFecha = asientoService.obtenerUltimaFecha();
        if (ultimaFecha != null) {
            return ResponseEntity.ok(ultimaFecha);
        } else {
            return ResponseEntity.noContent().build(); // Devuelve 204 si no hay fecha registrada
        }
    }

    @PostMapping
    public ResponseEntity<Asiento> createAsiento(@Valid @RequestBody Asiento asiento) {
        try {
            Asiento savedAsiento = asientoService.createAsiento(asiento);
            return new ResponseEntity<>(savedAsiento, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsiento(@PathVariable Long id) {
        asientoService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
