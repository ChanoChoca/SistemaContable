package com.chanochoca.app.contable.models;

import com.chanochoca.app.contable.models.entity.TipoMovimiento;

import java.math.BigDecimal;
import java.time.LocalDate;

public class MovimientoLibroMayorDTO {
    private LocalDate fecha;
    private String descripcion;
    private String tipoMovimiento;
    private BigDecimal monto;

    public MovimientoLibroMayorDTO(LocalDate fecha, String descripcion, String tipoMovimiento, BigDecimal monto) {
        this.fecha = fecha;
        this.descripcion = descripcion;
        this.tipoMovimiento = tipoMovimiento;
        this.monto = monto;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getTipoMovimiento() {
        return tipoMovimiento;
    }

    public void setTipoMovimiento(String tipoMovimiento) {
        this.tipoMovimiento = tipoMovimiento;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }
}
