package com.chanochoca.app.ventas.models;

public class ComprobanteRequest {

    private int cbteTipo;
    private long docNro;
    private double impNeto;
    private long ventaId;

    // Getters y setters
    public int getCbteTipo() {
        return cbteTipo;
    }

    public void setCbteTipo(int cbteTipo) {
        this.cbteTipo = cbteTipo;
    }

    public long getDocNro() {
        return docNro;
    }

    public void setDocNro(long docNro) {
        this.docNro = docNro;
    }

    public double getImpNeto() {
        return impNeto;
    }

    public void setImpNeto(double impNeto) {
        this.impNeto = impNeto;
    }

    public long getVentaId() {
        return ventaId;
    }

    public void setVentaId(long ventaId) {
        this.ventaId = ventaId;
    }
}