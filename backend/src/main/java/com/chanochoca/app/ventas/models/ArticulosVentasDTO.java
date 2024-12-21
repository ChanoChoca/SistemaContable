package com.chanochoca.app.ventas.models;

import com.chanochoca.app.ventas.models.entity.ArticulosVentas;
import com.chanochoca.app.ventas.models.entity.Cuotas;
import com.chanochoca.app.ventas.models.entity.Pagos;
import com.chanochoca.app.ventas.models.entity.Ventas;

import java.util.List;

public class ArticulosVentasDTO {
    private Ventas venta;
    private List<ArticulosVentas> articulosVentas;
    private List<Pagos> formasDePago;
    private List<Cuotas> cuotas;

    public Ventas getVenta() {
        return venta;
    }

    public void setVenta(Ventas venta) {
        this.venta = venta;
    }

    public List<ArticulosVentas> getArticulosVentas() {
        return articulosVentas;
    }

    public void setArticulosVentas(List<ArticulosVentas> articulosVentas) {
        this.articulosVentas = articulosVentas;
    }

    public List<Pagos> getFormasDePago() {
        return formasDePago;
    }

    public void setFormasDePago(List<Pagos> formasDePago) {
        this.formasDePago = formasDePago;
    }

    public List<Cuotas> getCuotas() {
        return cuotas;
    }

    public void setCuotas(List<Cuotas> cuotas) {
        this.cuotas = cuotas;
    }
}
