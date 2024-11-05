package com.chanochoca.app.cuenta.models;

import com.chanochoca.app.cuenta.models.entity.Cuenta;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class NewCuentaDTO {

    private String nombre;

    private String codigo;

    private BigDecimal saldo;

    private Cuenta cuentaPadre;

    private List<Cuenta> subCuentas = new ArrayList<>();

    private boolean activa;

    private boolean eliminada;

    public NewCuentaDTO() {
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public BigDecimal getSaldo() {
        return saldo;
    }

    public void setSaldo(BigDecimal saldo) {
        this.saldo = saldo;
    }

    public Cuenta getCuentaPadre() {
        return cuentaPadre;
    }

    public void setCuentaPadre(Cuenta cuentaPadre) {
        this.cuentaPadre = cuentaPadre;
    }

    public List<Cuenta> getSubCuentas() {
        return subCuentas;
    }

    public void setSubCuentas(List<Cuenta> subCuentas) {
        this.subCuentas = subCuentas;
    }

    public boolean isActiva() {
        return activa;
    }

    public void setActiva(boolean activa) {
        this.activa = activa;
    }

    public boolean isEliminada() {
        return eliminada;
    }

    public void setEliminada(boolean eliminada) {
        this.eliminada = eliminada;
    }
}
