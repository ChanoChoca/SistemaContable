package com.chanochoca.app.ventas.service;

import com.chanochoca.app.ventas.models.entity.ArticulosVentas;
import com.chanochoca.app.ventas.models.entity.Cuotas;
import com.chanochoca.app.ventas.models.entity.Pagos;
import com.chanochoca.app.ventas.models.entity.Ventas;

import java.util.List;

public interface ArticulosVentasService {
    List<ArticulosVentas> crearCuentasAsientos(List<ArticulosVentas> articulosVentas, List<Pagos> formasDePago, List<Cuotas> cuotas, Ventas venta);

    List<ArticulosVentas> findByMonth(String mes);

    List<ArticulosVentas> getAll();

    List<ArticulosVentas> findByVentaId(Long ventaId);
}
