package com.chanochoca.app.contable.service;

import com.chanochoca.app.contable.models.entity.AsientoContable;
import com.chanochoca.app.contable.models.entity.MovimientoContable;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AsientoContableService {

    AsientoContable createAsientoContable(AsientoContable asiento, List<MovimientoContable> movimientos);

    AsientoContable updateAsientoContable(AsientoContable asientoExistente, List<MovimientoContable> nuevosMovimientos);

    AsientoContable save(AsientoContable AsientoContable);

    Optional<AsientoContable> findById(Long id);

    Page<AsientoContable> findAll(int page, int size);

    Page<AsientoContable> libroDiario(int page, int size, LocalDate fechaInicial, LocalDate fechaFinal);

    List<AsientoContable> libroDiarioSinPaginado(LocalDate fechaInicial, LocalDate fechaFinal);

    void deleteById(Long id);
}
