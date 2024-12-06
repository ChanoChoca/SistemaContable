package com.chanochoca.app.contable.service;

import com.chanochoca.app.contable.models.entity.Asiento;
import com.chanochoca.app.contable.models.entity.CuentaAsiento;
import com.chanochoca.app.contable.repository.AsientoRepository;
import com.chanochoca.app.contable.repository.CuentaAsientoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class CuentaAsientoServiceImpl implements CuentaAsientoService {

    private final CuentaAsientoRepository cuentaAsientoRepository;
    private final AsientoRepository asientoRepository;

    public CuentaAsientoServiceImpl(CuentaAsientoRepository cuentaAsientoRepository, AsientoRepository asientoRepository) {
        this.cuentaAsientoRepository = cuentaAsientoRepository;
        this.asientoRepository = asientoRepository;
    }

    @Override
    @Transactional
    public List<CuentaAsiento> crearCuentasAsientos(List<CuentaAsiento> cuentasAsientos, Asiento asiento) {
        if (cuentasAsientos.isEmpty()) {
            return cuentasAsientos;
        }

        asientoRepository.save(asiento);

        // Guardar los CuentaAsiento asociados
        for (CuentaAsiento cuentaAsiento : cuentasAsientos) {
            cuentaAsiento.setAsiento(asiento);
            cuentaAsiento.getAsiento().setUsuarioEmail(asiento.getUsuarioEmail());
            cuentaAsientoRepository.save(cuentaAsiento);
        }

        return cuentasAsientos;
    }

    @Override
    public boolean existsByAsientoId(Long asientoId) {
        return cuentaAsientoRepository.existsByAsiento_Id(asientoId);
    }

    @Override
    public boolean existsByCuentaId(Long cuentaId) {
        return cuentaAsientoRepository.existsByCuenta_Id(cuentaId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CuentaAsiento> libroDiario(int page, int size, Date fechaInicial, Date fechaFinal) {
        Pageable pageable = PageRequest.of(page, size);

        return cuentaAsientoRepository.findByAsientoFechaBetween(fechaInicial, fechaFinal, pageable);
    }

    @Override
    public List<CuentaAsiento> libroDiarioSinPaginado(Date fechaInicio, Date fechaFin) {
        return cuentaAsientoRepository.findByAsientoFechaBetween(fechaInicio, fechaFin);
    }

    @Override
    public List<CuentaAsiento> libroMayor(Long cuentaId, Date fechaInicio, Date fechaFin) {
        if (cuentaId == null || fechaInicio == null || fechaFin == null) {
            throw new IllegalArgumentException("Los parámetros cuentaId, fechaInicio y fechaFin no pueden ser nulos.");
        }

        return cuentaAsientoRepository.findByCuenta_IdAndAsiento_FechaBetween(cuentaId, fechaInicio, fechaFin);
    }
}
