package com.chanochoca.app.contable.controller;

import com.chanochoca.app.contable.models.AsientoContableDTO;
import com.chanochoca.app.contable.models.AsientoLibroDiarioDTO;
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

    @PutMapping("/{id}")
    public ResponseEntity<AsientoContable> updateAsiento(
            @PathVariable Long id,
            @RequestBody AsientoContable asientoContable) {

        Optional<AsientoContable> asientoExistenteOpt = asientoContableService.findById(id);
        if (!asientoExistenteOpt.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        AsientoContable asientoExistente = asientoExistenteOpt.get();
        asientoExistente.setFecha(asientoContable.getFecha());
        asientoExistente.setUsuarioEmail(asientoContable.getUsuarioEmail());

        List<MovimientoContable> nuevosMovimientos = asientoContable.getMovimientos().stream()
                .map(dto -> {
                    MovimientoContable movimiento = new MovimientoContable();
                    movimiento.setDescripcion(dto.getDescripcion());
                    movimiento.setCuenta(dto.getCuenta());
                    movimiento.setMonto(dto.getMonto());
                    movimiento.setEsDebito(dto.isEsDebito());
                    movimiento.setAsiento(asientoExistente);
                    return movimiento;
                }).collect(Collectors.toList());

        AsientoContable actualizado = asientoContableService.updateAsientoContable(asientoExistente, nuevosMovimientos);
        return ResponseEntity.ok(actualizado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AsientoContable> getAsientoById(@PathVariable Long id) {
        Optional<AsientoContable> cuenta = asientoContableService.findById(id);
        return cuenta.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<Page<AsientoContableDTO>> getAllAsientos(@RequestParam(defaultValue = "0") int page,
                                                                   @RequestParam(defaultValue = "1") int size) {
        Page<AsientoContableDTO> asientosContables = asientoContableService.findAll(page, size);
        return ResponseEntity.ok(asientosContables);
    }


    @GetMapping("/libro-diario")
    public ResponseEntity<Page<AsientoLibroDiarioDTO>> libroDiario(@RequestParam(defaultValue = "0") int page,
                                                                       @RequestParam(defaultValue = "1") int size,
                                                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
                                                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        Page<AsientoLibroDiarioDTO> asientosContables = asientoContableService.libroDiario(page, size, fechaInicio, fechaFin);
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
