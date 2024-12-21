package com.chanochoca.app.ventas.repository;

import com.chanochoca.app.ventas.models.entity.Articulos;
import org.springframework.data.repository.CrudRepository;

public interface ArticulosRepository extends CrudRepository<Articulos, Long> {
    boolean existsByNombre(String nombre);
}
