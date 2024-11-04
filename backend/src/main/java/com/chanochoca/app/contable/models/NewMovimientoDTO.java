package com.chanochoca.app.contable.models;

import com.chanochoca.app.contable.models.entity.AsientoContable;
import com.chanochoca.app.cuenta.models.entity.Cuenta;

public class NewMovimientoDTO {

    private String descripcion;

    private Cuenta cuenta;

    private AsientoContable asiento;

    private double monto;

    private boolean esDebito;


    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Cuenta getCuenta() {
        return cuenta;
    }

    public void setCuenta(Cuenta cuenta) {
        this.cuenta = cuenta;
    }

    public AsientoContable getAsiento() {
        return asiento;
    }

    public void setAsiento(AsientoContable asiento) {
        this.asiento = asiento;
    }

    public double getMonto() {
        return monto;
    }

    public void setMonto(double monto) {
        this.monto = monto;
    }

    public boolean isEsDebito() {
        return esDebito;
    }

    public void setEsDebito(boolean esDebito) {
        this.esDebito = esDebito;
    }
}
