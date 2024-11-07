package com.chanochoca.app.contable.models;

import java.math.BigDecimal;

public class MovimientoLibroDiarioDTO {
    private String descripcion;
    private boolean esDebito;
    private BigDecimal monto;

    public MovimientoLibroDiarioDTO() {
    }

    public MovimientoLibroDiarioDTO(String descripcion, boolean esDebito, BigDecimal monto) {
        this.descripcion = descripcion;
        this.esDebito = esDebito;
        this.monto = monto;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public boolean isEsDebito() {
        return esDebito;
    }

    public void setEsDebito(boolean esDebito) {
        this.esDebito = esDebito;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }
}
