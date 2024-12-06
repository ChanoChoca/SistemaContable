package com.chanochoca.app.cuenta.controller;

import com.chanochoca.app.cuenta.models.NewCuentaDTO;
import com.chanochoca.app.cuenta.models.entity.Cuenta;

import com.chanochoca.app.cuenta.service.CuentaService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/cuentas")
public class CuentaController {

    private final CuentaService cuentaService;

    public CuentaController(CuentaService cuentaService) {
        this.cuentaService = cuentaService;
    }

    // Obtener una cuenta por ID
    @GetMapping("/{id}")
    public ResponseEntity<Cuenta> obtenerCuentaPorId(@PathVariable Long id) {
        Cuenta cuenta = cuentaService.obtenerCuentaPorId(id);
        return ResponseEntity.ok(cuenta);
    }

    // Obtener una cuenta por su código
    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<Cuenta> obtenerCuentaPorCodigo(@PathVariable String codigo) {
        return cuentaService.obtenerCuentaPorCodigo(codigo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Listar todas las cuentas
    @GetMapping
    public ResponseEntity<List<Cuenta>> obtenerTodasLasCuentas() {
        List<Cuenta> cuentas = cuentaService.obtenerTodasLasCuentas();
        return ResponseEntity.ok(cuentas);
    }

    @GetMapping("/tree")
    public ResponseEntity<Page<Cuenta>> cuentasTree(@RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "1") int size,
                                                    @RequestParam(defaultValue = "") String nombre) {
        Page<Cuenta> accountTree = cuentaService.getAccountTree(page, size, nombre);
        return ResponseEntity.ok(accountTree);
    }

    // Crear una nueva cuenta
    @PostMapping
    public ResponseEntity<Cuenta> crearCuenta(@RequestBody NewCuentaDTO newCuentaDTO) {
        Cuenta nuevaCuenta = cuentaService.createCuenta(newCuentaDTO);
        return new ResponseEntity<>(nuevaCuenta, HttpStatus.CREATED);
    }

    // Actualizar una cuenta por ID
    @PutMapping("/{id}")
    public ResponseEntity<Cuenta> actualizarCuenta(@PathVariable Long id, @RequestBody Cuenta cuenta) {
        Cuenta cuentaActualizada = cuentaService.actualizarCuenta(id, cuenta);
        return ResponseEntity.ok(cuentaActualizada);
    }

    // Eliminar una cuenta por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCuenta(@PathVariable Long id) {
        cuentaService.eliminarCuenta(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Cuenta> deactivateCuenta(@PathVariable Long id) {
        Cuenta cuenta = cuentaService.deactivateCuenta(id);
        return ResponseEntity.ok(cuenta);
    }

    @PutMapping("/{idCuenta}/actualizar")
    public ResponseEntity<Cuenta> updateSaldoCuenta(@PathVariable Long idCuenta, @RequestBody Map<String, Long> body) {
        Long saldo = body.get("saldo");
        cuentaService.updateSaldoCuenta(idCuenta, saldo);
        return ResponseEntity.ok().build();
    }
}
