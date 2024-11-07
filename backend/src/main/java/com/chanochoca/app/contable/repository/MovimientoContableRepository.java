package com.chanochoca.app.contable.repository;

import com.chanochoca.app.contable.models.entity.MovimientoContable;
import org.springframework.data.repository.CrudRepository;

import java.time.LocalDate;
import java.util.List;

public interface MovimientoContableRepository extends CrudRepository<MovimientoContable, Long> {
    List<MovimientoContable> findByAsiento_FechaBetweenAndCuenta_Id(LocalDate fechaInicio, LocalDate fechaFin, Long cuentaId);

    List<MovimientoContable> findByCuenta_Id(Long cuentaId);
}
