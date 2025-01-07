package com.chanochoca.app.contable.controller;

import com.chanochoca.app.contable.models.AsientoCuentasDTO;
import com.chanochoca.app.contable.models.entity.CuentaAsiento;
import com.chanochoca.app.contable.service.CuentaAsientoService;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/cuenta-asiento")
public class CuentaAsientoController {

    private final CuentaAsientoService cuentaAsientoService;

    public CuentaAsientoController(CuentaAsientoService cuentaAsientoService) {
        this.cuentaAsientoService = cuentaAsientoService;
    }

    @GetMapping("/exists-asiento/{asientoId}")
    public ResponseEntity<Boolean> checkIfAsientoIdExists(@PathVariable Long asientoId) {
        boolean exists = cuentaAsientoService.existsByAsientoId(asientoId);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/exists-cuenta/{cuentaId}")
    public ResponseEntity<Boolean> checkIfCuentaIdExists(@PathVariable Long cuentaId) {
        boolean exists = cuentaAsientoService.existsByCuentaId(cuentaId);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/libro-diario")
    public ResponseEntity<Page<CuentaAsiento>> libroDiario(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date fechaFin) {

        Page<CuentaAsiento> cuentaAsientos = cuentaAsientoService.libroDiario(page, size, fechaInicio, fechaFin);
        return ResponseEntity.ok(cuentaAsientos);
    }

    @GetMapping("/libro-diario-sin-paginado")
    public ResponseEntity<List<CuentaAsiento>> getAllCuentas(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date fechaInicio,
                                                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date fechaFin) {
        List<CuentaAsiento> cuentaAsientos = cuentaAsientoService.libroDiarioSinPaginado(fechaInicio, fechaFin);
        return ResponseEntity.ok(cuentaAsientos);
    }

    @GetMapping("/libro-mayor")
    public ResponseEntity<List<CuentaAsiento>> libroMayor(@RequestParam(required = false) Long cuentaId,
                                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date fechaInicio,
                                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date fechaFin) {
        List<CuentaAsiento> cuentaAsientos = cuentaAsientoService.libroMayor(cuentaId, fechaInicio, fechaFin);
        return ResponseEntity.ok(cuentaAsientos);
    }

    @GetMapping("/ventas")
    public ResponseEntity<List<CuentaAsiento>> ventas(@RequestParam("mes") String mes) {
        // Llamar al servicio para obtener las ventas para el mes
        List<CuentaAsiento> cuentaAsientos = cuentaAsientoService.obtenerVentasPorMes(mes);

        if (cuentaAsientos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(cuentaAsientos);
    }

    @GetMapping("/costeo")
    public List<CuentaAsiento> getArticulosVentasByMonth(@RequestParam String mes) {
        return cuentaAsientoService.findByMonth(mes);
    }

    @PostMapping
    public ResponseEntity<List<CuentaAsiento>> crearCuentasAsientos(@RequestBody AsientoCuentasDTO asientoConCuentasDTO) {
        // Llamar al servicio para procesar tanto el asiento como las cuentas afectadas
        List<CuentaAsiento> createdCuentasAsientos = cuentaAsientoService.crearCuentasAsientos(asientoConCuentasDTO.getCuentasAfectadas(), asientoConCuentasDTO.getAsiento());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCuentasAsientos);
    }
}
