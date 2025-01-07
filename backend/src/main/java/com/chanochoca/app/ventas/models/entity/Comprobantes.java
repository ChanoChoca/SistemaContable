package com.chanochoca.app.ventas.models.entity;

import com.chanochoca.app.user.models.entity.User;
import jakarta.persistence.*;

@Entity
public class Comprobantes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int comprobanteNro;

    private int comprobanteTipo;

    @ManyToOne
    @JoinColumn(name = "ventas_id", nullable = false)
    private Ventas venta;

    public Comprobantes(int comprobanteNro, int comprobanteTipo, Ventas venta) {
        this.comprobanteNro = comprobanteNro;
        this.comprobanteTipo = comprobanteTipo;
        this.venta = venta;
    }

    public Comprobantes() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getComprobanteNro() {
        return comprobanteNro;
    }

    public void setComprobanteNro(int comprobanteNro) {
        this.comprobanteNro = comprobanteNro;
    }

    public int getComprobanteTipo() {
        return comprobanteTipo;
    }

    public void setComprobanteTipo(int comprobanteTipo) {
        this.comprobanteTipo = comprobanteTipo;
    }

    public Ventas getVenta() {
        return venta;
    }

    public void setVenta(Ventas venta) {
        this.venta = venta;
    }
}
