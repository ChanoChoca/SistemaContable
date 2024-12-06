package com.chanochoca.app.contable.models;

import com.chanochoca.app.contable.models.entity.Asiento;
import com.chanochoca.app.contable.models.entity.CuentaAsiento;

import java.util.List;

public class AsientoCuentasDTO {
    private Asiento asiento;
    private List<CuentaAsiento> cuentasAfectadas;

    // Getters y Setters
    public Asiento getAsiento() {
        return asiento;
    }

    public void setAsiento(Asiento asiento) {
        this.asiento = asiento;
    }

    public List<CuentaAsiento> getCuentasAfectadas() {
        return cuentasAfectadas;
    }

    public void setCuentasAfectadas(List<CuentaAsiento> cuentasAfectadas) {
        this.cuentasAfectadas = cuentasAfectadas;
    }
}

