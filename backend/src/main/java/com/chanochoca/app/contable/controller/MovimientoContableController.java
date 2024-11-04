package com.chanochoca.app.contable.controller;

import com.chanochoca.app.contable.models.NewMovimientoDTO;
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
    public ResponseEntity<MovimientoContable> createCuenta(@Valid @RequestBody NewMovimientoDTO newMovimientoDTO) {

        MovimientoContable movimientoContable = new MovimientoContable();
        movimientoContable.setCuenta(newMovimientoDTO.getCuenta());

        AsientoContable asiento = asientoContableService.findById(newMovimientoDTO.getAsiento().getId())
                .orElseThrow(() -> new RuntimeException("Asiento no encontrado"));

        movimientoContable.setAsiento(asiento);
        movimientoContable.setMonto(newMovimientoDTO.getMonto());
        movimientoContable.setEsDebito(newMovimientoDTO.isEsDebito());

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
    public ResponseEntity<List<MovimientoContable>> getAllCuentas() {
        List<MovimientoContable> cuentas = movimientoContableService.findAll();
        return new ResponseEntity<>(cuentas, HttpStatus.OK);
    }

    @GetMapping("/libro-mayor")
    public ResponseEntity<List<MovimientoContable>> libroMayor(@RequestParam(required = false) Long cuentaId,
                                                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
                                                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        List<MovimientoContable> movimientosContables = movimientoContableService.libroMayor(cuentaId, fechaInicio, fechaFin);
        movimientosContables.forEach(movimiento -> {
            System.out.println("-----Por cada movimiento2-----");
            System.out.println("Fecha " + movimiento.getAsiento().getFecha());
            System.out.println("Email " + movimiento.getAsiento().getUsuarioEmail());
            System.out.println("Cuenta " + movimiento.getCuenta().getNombre());
        });
        return ResponseEntity.ok(movimientosContables);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCuenta(@PathVariable Long id) {
        movimientoContableService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
