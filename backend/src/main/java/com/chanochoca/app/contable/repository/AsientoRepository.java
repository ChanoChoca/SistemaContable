package com.chanochoca.app.contable.repository;

import com.chanochoca.app.contable.models.entity.Asiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AsientoRepository extends CrudRepository<Asiento, Long> {

    Page<Asiento> findAll(Pageable pageable);

    Page<Asiento> findByFechaBetween(LocalDate fechaInicio, LocalDate  fechaFin, Pageable pageable);

    List<Asiento> findByFechaBetween(LocalDate fechaInicio, LocalDate  fechaFin);

    Optional<Asiento> findTopByOrderByFechaDesc();
}
