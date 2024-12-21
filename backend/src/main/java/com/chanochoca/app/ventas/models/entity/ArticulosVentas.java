package com.chanochoca.app.ventas.models.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
public class ArticulosVentas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int cantidad;

    private BigDecimal subtotal;

    private BigDecimal precioVenta;

    @ManyToOne
    @JoinColumn(name = "ventas_id", nullable = false)
    private Ventas venta;

    @ManyToOne
    @JoinColumn(name = "articulos_id", nullable = false)
    private Articulos articulo;

    public ArticulosVentas() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getPrecioVenta() {
        return precioVenta;
    }

    public void setPrecioVenta(BigDecimal precioVenta) {
        this.precioVenta = precioVenta;
    }

    public Ventas getVenta() {
        return venta;
    }

    public void setVenta(Ventas venta) {
        this.venta = venta;
    }

    public Articulos getArticulo() {
        return articulo;
    }

    public void setArticulo(Articulos articulo) {
        this.articulo = articulo;
    }
}
