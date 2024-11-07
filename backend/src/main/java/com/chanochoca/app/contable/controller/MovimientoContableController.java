package com.chanochoca.app.contable.controller;

import com.chanochoca.app.contable.models.MovimientoLibroMayorDTO;
import com.chanochoca.app.contable.models.entity.AsientoContable;
import com.chanochoca.app.contable.models.entity.MovimientoContable;
import com.chanochoca.app.contable.service.AsientoContableService;
import com.chanochoca.app.contable.service.MovimientoContableService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/movimientos-contables")
public class MovimientoContableController {

    private final MovimientoContableService movimientoContableService;
    private final AsientoContableService asientoContableService;

    public MovimientoContableController(MovimientoContableService cuentaService, AsientoContableService asientoService) {
        this.movimientoContableService = cuentaService;
        this.asientoContableService = asientoService;
    }

    @PostMapping
    public ResponseEntity<MovimientoContable> createMovimiento(@Valid @RequestBody MovimientoContable movimientoContable) {

        AsientoContable asiento = asientoContableService.findById(movimientoContable.getAsiento().getId())
                .orElseThrow(() -> new RuntimeException("Asiento no encontrado"));

        movimientoContable.setAsiento(asiento);

        MovimientoContable savedCuenta = movimientoContableService.save(movimientoContable);
        return new ResponseEntity<>(savedCuenta, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovimientoContable> getCuentaById(@PathVariable Long id) {
        Optional<MovimientoContable> cuenta = movimientoContableService.findById(id);
        return cuenta.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<MovimientoContable>> getAllMovimientos() {
        List<MovimientoContable> cuentas = movimientoContableService.findAll();
        return new ResponseEntity<>(cuentas, HttpStatus.OK);
    }

    @GetMapping("/libro-mayor")
    public ResponseEntity<List<MovimientoLibroMayorDTO>> libroMayor(@RequestParam(required = false) Long cuentaId,
                                                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
                                                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        List<MovimientoLibroMayorDTO> movimientosContables = movimientoContableService.libroMayor(cuentaId, fechaInicio, fechaFin);
        return ResponseEntity.ok(movimientosContables);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovimiento(@PathVariable Long id) {
        movimientoContableService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
