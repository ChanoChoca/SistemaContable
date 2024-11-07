package com.chanochoca.app.contable.models;

import java.math.BigDecimal;
import java.time.LocalDate;

public class MovimientoLibroMayorDTO {
    private LocalDate fecha;
    private String descripcion;
    private boolean esDebito;
    private BigDecimal monto;

    // Constructor, getters, y setters
    public MovimientoLibroMayorDTO(LocalDate fecha, String descripcion, boolean esDebito, BigDecimal monto) {
        this.fecha = fecha;
        this.descripcion = descripcion;
        this.esDebito = esDebito;
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
