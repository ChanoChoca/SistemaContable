package com.chanochoca.app.ventas.controller;

import com.chanochoca.app.ventas.models.entity.Cuotas;
import com.chanochoca.app.ventas.service.CuotasService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/cuotas")
public class CuotasController {

    private final CuotasService cuotasService;

    public CuotasController(CuotasService cuotasService) {
        this.cuotasService = cuotasService;
    }

    @GetMapping("/get-by-client")
    public ResponseEntity<List<Cuotas>> getCuentasByClient(@RequestParam String email) {
        return ResponseEntity.ok(cuotasService.getCuotasByEmail(email));
    }

    @PutMapping
    public ResponseEntity<Cuotas> updateCuota(@RequestBody Cuotas cuota) {
        return ResponseEntity.ok(cuotasService.updateCuota(cuota));
    }
}
