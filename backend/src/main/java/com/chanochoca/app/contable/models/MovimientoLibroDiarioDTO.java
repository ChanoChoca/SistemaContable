package com.chanochoca.app.contable.models;

import com.chanochoca.app.contable.models.entity.TipoMovimiento;

import java.math.BigDecimal;

public class MovimientoLibroDiarioDTO {
    private String descripcion;
    private String tipoMovimiento;
    private BigDecimal monto;

    public MovimientoLibroDiarioDTO(String descripcion, String tipoMovimiento, BigDecimal monto) {
        this.descripcion = descripcion;
        this.tipoMovimiento = tipoMovimiento;
        this.monto = monto;
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
