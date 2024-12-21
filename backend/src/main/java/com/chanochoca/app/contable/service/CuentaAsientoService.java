package com.chanochoca.app.contable.service;

import com.chanochoca.app.contable.models.entity.Asiento;
import com.chanochoca.app.contable.models.entity.CuentaAsiento;
import org.springframework.data.domain.Page;

import java.util.Date;
import java.util.List;

public interface CuentaAsientoService {
    List<CuentaAsiento> crearCuentasAsientos(List<CuentaAsiento> cuentasAsientos, Asiento asiento);

    boolean existsByAsientoId(Long asientoId);

    boolean existsByCuentaId(Long cuentaId);

    Page<CuentaAsiento> libroDiario(int page, int size, Date fechaInicial, Date fechaFinal);

    List<CuentaAsiento> libroDiarioSinPaginado(Date fechaInicio, Date fechaFin);

    List<CuentaAsiento> libroMayor(Long cuentaId, Date fechaInicio, Date fechaFin);

    List<CuentaAsiento> obtenerVentasPorMes(String mes);

    List<CuentaAsiento> findByMonth(String mes);
}
