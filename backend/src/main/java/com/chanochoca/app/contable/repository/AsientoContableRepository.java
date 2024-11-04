package com.chanochoca.app.contable.repository;

import com.chanochoca.app.contable.models.entity.AsientoContable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;

import java.time.LocalDate;
import java.util.List;

public interface AsientoContableRepository extends CrudRepository<AsientoContable, Long> {

    Page<AsientoContable> findAll(Pageable pageable);

    Page<AsientoContable> findByFechaBetween(LocalDate fechaInicio, LocalDate  fechaFin, Pageable pageable);

    List<AsientoContable> findByFechaBetween(LocalDate fechaInicio, LocalDate  fechaFin);
}
