package com.chanochoca.app.cuenta.service;

import com.chanochoca.app.cuenta.models.NewCuentaDTO;
import com.chanochoca.app.cuenta.models.entity.Cuenta;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

public interface CuentaService {
    void deleteCuenta(Long id);
    Cuenta updateCuenta(Long id, Cuenta cuenta);
    Cuenta createCuenta(NewCuentaDTO newCuentaDTO);

    Optional<Cuenta> findById(Long id);

    Page<Cuenta> findAll(int page, int size, String nombre);

    List<Cuenta> findCuentasSinPaginado();

    List<Cuenta> findByNombre(String nombre);

    Page<Cuenta> getAccountTree(int page, int size, String nombre);
}
