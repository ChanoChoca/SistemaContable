package com.chanochoca.app.cuenta.repository;

import com.chanochoca.app.cuenta.models.entity.Cuenta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface CuentaRepository extends CrudRepository<Cuenta, Long> {
    List<Cuenta> findByNombre(String nombre);

    Page<Cuenta> findByNombreContaining(String nombre, Pageable pageable);

    List<Cuenta> findByCuentaPadreIsNull();

    Page<Cuenta> findByNombreContainingAndCuentaPadreIsNull(String nombre, Pageable pageable);

    Optional<Cuenta> findByCodigo(String codigo);
}
