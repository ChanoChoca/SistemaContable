package com.chanochoca.app.contable.service;

import com.chanochoca.app.contable.models.entity.MovimientoContable;
import com.chanochoca.app.contable.repository.MovimientoContableRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class MovimientoContableServiceImpl implements MovimientoContableService {

    private final MovimientoContableRepository cuentaRepository;

    public MovimientoContableServiceImpl(MovimientoContableRepository cuentaRepository) {
        this.cuentaRepository = cuentaRepository;
    }

    @Override
    public MovimientoContable save(MovimientoContable asientoContable) {
        return cuentaRepository.save(asientoContable);
    }

    @Override
    public Optional<MovimientoContable> findById(Long id) {
        return cuentaRepository.findById(id);
    }

    @Override
    public List<MovimientoContable> findAll() {
        return (List<MovimientoContable>) cuentaRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        cuentaRepository.deleteById(id);
    }

    @Override
    public List<MovimientoContable> libroMayor(Long cuentaId, LocalDate fechaInicio, LocalDate fechaFin) {
        return cuentaRepository.findByAsiento_FechaBetweenAndCuenta_Id(fechaInicio, fechaFin, cuentaId);
    }
}
