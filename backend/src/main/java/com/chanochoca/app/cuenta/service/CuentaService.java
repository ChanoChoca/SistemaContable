package com.chanochoca.app.cuenta.service;

import com.chanochoca.app.cuenta.models.NewCuentaDTO;
import com.chanochoca.app.cuenta.models.entity.Cuenta;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface CuentaService {

    // Crear una nueva cuenta contable
    Cuenta createCuenta(NewCuentaDTO newCuentaDTO);

    // Obtener una cuenta por su ID
    Cuenta obtenerCuentaPorId(Long id);

    // Obtener una cuenta por su código único
    Optional<Cuenta> obtenerCuentaPorCodigo(String codigo);

    // Listar todas las cuentas contables
    List<Cuenta> obtenerTodasLasCuentas();

    // Actualizar una cuenta existente
    Cuenta actualizarCuenta(Long id, Cuenta cuentaActualizada);

    // Eliminar una cuenta por su ID
    void eliminarCuenta(Long id);

    Page<Cuenta> getAccountTree(int page, int size, String nombre);

    Cuenta deactivateCuenta(Long id);

    void updateSaldoCuenta(Long idCuenta, Long saldo);
}
