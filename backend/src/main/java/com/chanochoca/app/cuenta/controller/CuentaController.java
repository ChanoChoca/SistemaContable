package com.chanochoca.app.cuenta.controller;

import com.chanochoca.app.cuenta.models.NewCuentaDTO;
import com.chanochoca.app.cuenta.models.entity.Cuenta;
import com.chanochoca.app.cuenta.service.CuentaService;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cuentas")
public class CuentaController {

    private final CuentaService cuentaService;

    public CuentaController(CuentaService cuentaService) {
        this.cuentaService = cuentaService;
    }

    @PostMapping
    public ResponseEntity<Cuenta> createCuenta(@Valid @RequestBody NewCuentaDTO newCuentaDTO) {

        System.out.println("Aquí la cuenta: " + newCuentaDTO.getNombre());

        Cuenta savedCuenta = new Cuenta();
        savedCuenta.setNombre(newCuentaDTO.getNombre());
        savedCuenta.setCodigo(newCuentaDTO.getCodigo());
        savedCuenta.setCuentaPadre(newCuentaDTO.getCuentaPadre());
        savedCuenta.setSubCuentas(newCuentaDTO.getSubCuentas());
        savedCuenta.setActiva(newCuentaDTO.isActiva());
        savedCuenta.setEliminada(newCuentaDTO.isEliminada());

        cuentaService.save(savedCuenta);

        return ResponseEntity.ok(savedCuenta);
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
        Optional<Cuenta> existingCuenta = cuentaService.findById(id);
        if (existingCuenta.isPresent()) {
            cuenta.setId(existingCuenta.get().getId());
            Cuenta updatedCuenta = cuentaService.save(cuenta);
            return new ResponseEntity<>(updatedCuenta, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCuenta(@PathVariable Long id) {
        cuentaService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Cuenta>> getCuentasByNombre(@RequestParam String nombre) {
        List<Cuenta> cuentas = cuentaService.findByNombre(nombre);
        return new ResponseEntity<>(cuentas, HttpStatus.OK);
    }
}
