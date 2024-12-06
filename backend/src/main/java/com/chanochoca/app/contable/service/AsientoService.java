package com.chanochoca.app.contable.service;

import com.chanochoca.app.contable.models.entity.Asiento;
import org.springframework.data.domain.Page;

import java.util.Date;

public interface AsientoService {
    Page<Asiento> findAll(int page, int size);
    Date obtenerUltimaFecha();

//    Asiento updateAsiento(Long id, Asiento asiento);
//
    Asiento createAsiento(Asiento asiento);

    void deleteById(Long id);
//
//    Optional<Asiento> findById(Long id);
//
//    Page<AsientoContableDTO> findAll(int page, int size);
//
//    Page<AsientoLibroDiarioDTO> libroDiario(int page, int size, LocalDate fechaInicial, LocalDate fechaFinal);
//    List<Asiento> libroDiarioSinPaginado(LocalDate fechaInicial, LocalDate fechaFinal);
//
//    void deleteById(Long id);
}
