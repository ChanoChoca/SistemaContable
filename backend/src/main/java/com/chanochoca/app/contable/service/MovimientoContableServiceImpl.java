package com.chanochoca.app.contable.service;

import com.chanochoca.app.contable.models.MovimientoLibroMayorDTO;
import com.chanochoca.app.contable.models.entity.MovimientoContable;
import com.chanochoca.app.contable.repository.MovimientoContableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MovimientoContableServiceImpl implements MovimientoContableService {

    private final MovimientoContableRepository movimientoRepository;

    public MovimientoContableServiceImpl(MovimientoContableRepository cuentaRepository) {
        this.movimientoRepository = cuentaRepository;
    }

    @Override
    @Transactional
    public MovimientoContable save(MovimientoContable asientoContable) {
        return movimientoRepository.save(asientoContable);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MovimientoContable> findById(Long id) {
        return movimientoRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovimientoContable> findAll() {
        return (List<MovimientoContable>) movimientoRepository.findAll();
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        movimientoRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovimientoLibroMayorDTO> libroMayor(Long cuentaId, LocalDate fechaInicio, LocalDate fechaFin) {
        List<MovimientoContable> movimientos = movimientoRepository.findByAsiento_FechaBetweenAndCuenta_Id(fechaInicio, fechaFin, cuentaId);
        return movimientos.stream()
                .map(movimiento -> new MovimientoLibroMayorDTO(
                        movimiento.getAsiento().getFecha(),
                        movimiento.getDescripcion(),
                        movimiento.isEsDebito(),
                        movimiento.getMonto()))
                .collect(Collectors.toList());
    }
}
