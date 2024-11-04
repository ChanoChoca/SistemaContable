package com.chanochoca.app.cuenta.repository;

import com.chanochoca.app.cuenta.models.entity.Cuenta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface CuentaRepository extends CrudRepository<Cuenta, Long> {
    List<Cuenta> findByNombre(String nombre);

    Page<Cuenta> findByNombreContaining(String nombre, Pageable pageable);
}
