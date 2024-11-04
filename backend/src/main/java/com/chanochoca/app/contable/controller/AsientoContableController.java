package com.chanochoca.app.contable.controller;

import com.chanochoca.app.contable.models.entity.AsientoContable;
import com.chanochoca.app.contable.models.entity.MovimientoContable;
import com.chanochoca.app.contable.service.AsientoContableService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/asientos-contables")
public class AsientoContableController {

    private final AsientoContableService asientoContableService;
    public AsientoContableController(AsientoContableService asientoContableService) {
        this.asientoContableService = asientoContableService;
    }

    @PostMapping
    public ResponseEntity<AsientoContable> createAsiento(@Valid @RequestBody AsientoContable asientoContable) {

        AsientoContable asiento = new AsientoContable();
        asiento.setFecha(asientoContable.getFecha());
        asiento.setUsuarioEmail(asientoContable.getUsuarioEmail());

        List<MovimientoContable> movimientos = asientoContable.getMovimientos().stream()
                .map(dto -> {
                    MovimientoContable movimiento = new MovimientoContable();
                    movimiento.setDescripcion(dto.getDescripcion());
                    movimiento.setCuenta(dto.getCuenta());
                    movimiento.setMonto(dto.getMonto());
                    movimiento.setEsDebito(dto.isEsDebito());
                    movimiento.setAsiento(asiento);
                    return movimiento;
                }).collect(Collectors.toList());

        AsientoContable savedCuenta = asientoContableService.createAsientoContable(asiento, movimientos);

        return new ResponseEntity<>(savedCuenta, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AsientoContable> getAsientoById(@PathVariable Long id) {
        Optional<AsientoContable> cuenta = asientoContableService.findById(id);
        return cuenta.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<Page<AsientoContable>> getAllAsientos(@RequestParam(defaultValue = "0") int page,
                                                               @RequestParam(defaultValue = "1") int size) {
        Page<AsientoContable> asientosContables = asientoContableService.findAll(page, size);

        return ResponseEntity.ok(asientosContables);
    }

    @GetMapping("/libro-diario")
    public ResponseEntity<Page<AsientoContable>> libroDiario(@RequestParam(defaultValue = "0") int page,
                                                             @RequestParam(defaultValue = "1") int size,
                                                             @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
                                                             @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        Page<AsientoContable> asientosContables = asientoContableService.libroDiario(page, size, fechaInicio, fechaFin);
        return ResponseEntity.ok(asientosContables);
    }

    @GetMapping("/libro-diario-sin-paginado")
    public ResponseEntity<List<AsientoContable>> getAllCuentas(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
                                                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        List<AsientoContable> cuentas = asientoContableService.libroDiarioSinPaginado(fechaInicio, fechaFin);
        return ResponseEntity.ok(cuentas);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsiento(@PathVariable Long id) {
        asientoContableService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
