package com.chanochoca.app.ventas.service;

import com.chanochoca.app.ventas.models.entity.Ventas;

import java.util.List;

public interface VentasService {
    List<Ventas> findAll();

    Ventas getVentaById(Long id);

    List<Ventas> getVentasByClienteEmail(String userEmail);

    Ventas findById(long ventaId);
}
