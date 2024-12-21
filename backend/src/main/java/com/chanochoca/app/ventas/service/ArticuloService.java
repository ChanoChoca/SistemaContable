package com.chanochoca.app.ventas.service;

import com.chanochoca.app.ventas.models.entity.Articulos;

import java.util.List;

public interface ArticuloService {

    Articulos createArticulo(Articulos articulo);

    List<Articulos> getArticulos();

    Articulos getArticuloById(Long id);

    Articulos updateArticulo(Long id, Articulos articulo);

    boolean existsByNombre(String nombre);
}
