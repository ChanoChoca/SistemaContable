package com.chanochoca.app.ventas.models.entity;

import com.chanochoca.app.cuenta.models.entity.Cuenta;
import jakarta.persistence.*;

@Entity
public class Pagos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int cantidad;

    @ManyToOne
    @JoinColumn(name = "cuentas_id", nullable = false)
    private Cuenta cuenta;

    @ManyToOne
    @JoinColumn(name = "ventas_id")
    private Ventas venta;

    @ManyToOne
    @JoinColumn(name = "cuotas_id")
    private Cuotas cuota;

    public Pagos() {
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

    public Cuenta getCuenta() {
        return cuenta;
    }

    public void setCuenta(Cuenta cuenta) {
        this.cuenta = cuenta;
    }

    public Ventas getVenta() {
        return venta;
    }

    public void setVenta(Ventas venta) {
        this.venta = venta;
    }

    public Cuotas getCuota() {
        return cuota;
    }

    public void setCuota(Cuotas cuota) {
        this.cuota = cuota;
    }
}
