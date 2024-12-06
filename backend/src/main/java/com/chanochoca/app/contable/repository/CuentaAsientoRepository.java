package com.chanochoca.app.contable.repository;

import com.chanochoca.app.contable.models.entity.CuentaAsiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;

import java.util.Date;
import java.util.List;

public interface CuentaAsientoRepository extends CrudRepository<CuentaAsiento, Long> {
    boolean existsByAsiento_Id(Long asientoId);

    boolean existsByCuenta_Id(Long cuentaId);

    Page<CuentaAsiento> findByAsientoFechaBetween(Date fecha1, Date asiento_fecha2, Pageable pageable);

    List<CuentaAsiento> findByAsientoFechaBetween(Date fecha1, Date asiento_fecha2);

    List<CuentaAsiento> findByCuenta_IdAndAsiento_FechaBetween(Long cuentaId, Date fechaInicio, Date fechaFin);
}
