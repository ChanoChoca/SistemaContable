package com.chanochoca.app.ventas.models;

public class FacturaRequest {
    private double impTotal;
    private double impNeto;
    private double impIVA;

    // Getters y setters
    public double getImpTotal() {
        return impTotal;
    }

    public void setImpTotal(double impTotal) {
        this.impTotal = impTotal;
    }

    public double getImpNeto() {
        return impNeto;
    }

    public void setImpNeto(double impNeto) {
        this.impNeto = impNeto;
    }

    public double getImpIVA() {
        return impIVA;
    }

    public void setImpIVA(double impIVA) {
        this.impIVA = impIVA;
    }
}
