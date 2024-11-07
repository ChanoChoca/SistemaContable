package com.chanochoca.app.contable.service;

import com.chanochoca.app.contable.models.MovimientoLibroMayorDTO;
import com.chanochoca.app.contable.models.entity.MovimientoContable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MovimientoContableService {

    MovimientoContable save(MovimientoContable movimientoContable);

    Optional<MovimientoContable> findById(Long id);

    List<MovimientoContable> findAll();

    void deleteById(Long id);

    List<MovimientoLibroMayorDTO> libroMayor(Long cuentaId, LocalDate fechaInicio, LocalDate fechaFin);
}
