package com.chanochoca.app.cuenta.controller;

import com.chanochoca.app.cuenta.models.NewCuentaDTO;
import com.chanochoca.app.cuenta.models.entity.Cuenta;
import com.chanochoca.app.cuenta.service.CuentaService;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/cuentas")
public class CuentaController {

    private final CuentaService cuentaService;

    public CuentaController(CuentaService cuentaService) {
        this.cuentaService = cuentaService;
    }

    @PostMapping
    public ResponseEntity<Cuenta> createCuenta(@Valid @RequestBody NewCuentaDTO newCuentaDTO) {
        try {
            Cuenta savedCuenta = cuentaService.createCuenta(newCuentaDTO);
            return ResponseEntity.ok(savedCuenta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<Cuenta> getCuentaById(@PathVariable Long id) {
        Optional<Cuenta> cuenta = cuentaService.findById(id);
        return cuenta.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<Page<Cuenta>> getAllCuentas(@RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "1") int size,
                                                      @RequestParam(defaultValue = "") String nombre) {
        Page<Cuenta> cuentas = cuentaService.findAll(page, size, nombre);

        return ResponseEntity.ok(cuentas);
    }

    @GetMapping("/cuentas-sin-paginado")
    public ResponseEntity<List<Cuenta>> getAllCuentas() {
        List<Cuenta> cuentas = cuentaService.findCuentasSinPaginado();
        return ResponseEntity.ok(cuentas);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cuenta> updateCuenta(@PathVariable Long id, @RequestBody Cuenta cuenta) {
        try {
            Cuenta updatedCuenta = cuentaService.updateCuenta(id, cuenta);
            return new ResponseEntity<>(updatedCuenta, HttpStatus.OK);
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCuenta(@PathVariable Long id) {
        try {
            cuentaService.deleteCuenta(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Cuenta>> getCuentasByNombre(@RequestParam String nombre) {
        List<Cuenta> cuentas = cuentaService.findByNombre(nombre);
        return new ResponseEntity<>(cuentas, HttpStatus.OK);
    }

    @GetMapping("/tree")
    public ResponseEntity<Page<Cuenta>> getAccountTree(@RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "1") int size,
                                                       @RequestParam(defaultValue = "") String nombre) {

        Page<Cuenta> accountTree = cuentaService.getAccountTree(page, size, nombre);
        return ResponseEntity.ok(accountTree);
    }
}
