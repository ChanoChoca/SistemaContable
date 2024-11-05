package com.chanochoca.app.contable.service;

import com.chanochoca.app.contable.models.entity.AsientoContable;
import com.chanochoca.app.contable.models.entity.MovimientoContable;
import com.chanochoca.app.contable.repository.AsientoContableRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AsientoContableServiceImpl implements AsientoContableService {

    private final AsientoContableRepository asientoContableRepository;

    public AsientoContableServiceImpl(AsientoContableRepository asientoContableRepository) {
        this.asientoContableRepository = asientoContableRepository;
    }

    @Override
    @Transactional
    public AsientoContable createAsientoContable(AsientoContable asiento, List<MovimientoContable> movimientos) {

        if (movimientos == null || movimientos.isEmpty()) {
            throw new IllegalArgumentException("El asiento contable debe tener al menos un movimiento contable.");
        }

        for (MovimientoContable movimiento: movimientos) {
            movimiento.setAsiento(asiento);
            asiento.addMovimiento(movimiento);
        }

        return asientoContableRepository.save(asiento);
    }

    @Override
    @Transactional
    public AsientoContable updateAsientoContable(AsientoContable asientoExistente, List<MovimientoContable> nuevosMovimientos) {
        // Limpiar los movimientos existentes del asiento
        asientoExistente.getMovimientos().clear();
        asientoContableRepository.save(asientoExistente); // Guarda para reflejar la limpieza en la base de datos

        // Agregar los nuevos movimientos
        for (MovimientoContable movimiento : nuevosMovimientos) {
            movimiento.setAsiento(asientoExistente);
            asientoExistente.getMovimientos().add(movimiento);
        }

        // Guardar el asiento con los nuevos movimientos
        return asientoContableRepository.save(asientoExistente);
    }

    public AsientoContable crearAsientoContable(AsientoContable asiento, List<MovimientoContable> movimientos) {
        for (MovimientoContable movimiento : movimientos) {
            asiento.addMovimiento(movimiento);
        }
        return asientoContableRepository.save(asiento);
    }

    @Override
    public AsientoContable save(AsientoContable asientoContable) {
        return asientoContableRepository.save(asientoContable);
    }

    @Override
    public Optional<AsientoContable> findById(Long id) {
        return asientoContableRepository.findById(id);
    }

    @Override
    public Page<AsientoContable> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return asientoContableRepository.findAll(pageable);
    }

    @Override
    public Page<AsientoContable> libroDiario(int page, int size, LocalDate fechaInicial, LocalDate fechaFinal) {
        Pageable pageable = PageRequest.of(page, size);
        return asientoContableRepository.findByFechaBetween(fechaInicial, fechaFinal, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AsientoContable> libroDiarioSinPaginado(LocalDate fechaInicial, LocalDate fechaFinal) {
        Iterable<AsientoContable> asientosIterable = asientoContableRepository.findByFechaBetween(fechaInicial, fechaFinal);
        List<AsientoContable> asientosList = new ArrayList<>();
        asientosIterable.forEach(asientosList::add);
        return asientosList;
    }

    @Override
    public void deleteById(Long id) {
        asientoContableRepository.deleteById(id);
    }
}