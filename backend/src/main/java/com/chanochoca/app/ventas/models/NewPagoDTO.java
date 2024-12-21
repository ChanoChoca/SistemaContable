package com.chanochoca.app.ventas.models;

import com.chanochoca.app.cuenta.models.entity.Cuenta;
import com.chanochoca.app.ventas.models.entity.Cuotas;
import com.chanochoca.app.ventas.models.entity.Ventas;

public class NewPagoDTO {

    private Long id;

    private int cantidad;

    private Cuenta cuenta;

    private Ventas venta;

    private Cuotas cuota;

    public NewPagoDTO() {
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
