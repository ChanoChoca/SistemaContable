package com.chanochoca.app.contable.service;

import com.chanochoca.app.contable.models.AsientoContableDTO;
import com.chanochoca.app.contable.models.AsientoLibroDiarioDTO;
import com.chanochoca.app.contable.models.MovimientoLibroDiarioDTO;
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
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AsientoContableServiceImpl implements AsientoContableService {

    private final AsientoContableRepository asientoContableRepository;

    public AsientoContableServiceImpl(AsientoContableRepository asientoContableRepository) {
        this.asientoContableRepository = asientoContableRepository;
    }

    @Override
    @Transactional
    public AsientoContable updateAsiento(Long id, AsientoContable asientoContable) {
        Optional<AsientoContable> asientoExistenteOpt = asientoContableRepository.findById(id);
        if (!asientoExistenteOpt.isPresent()) {
            throw new NoSuchElementException("AsientoContable not found");
        }

        AsientoContable asientoExistente = asientoExistenteOpt.get();
        asientoExistente.setFecha(asientoContable.getFecha());
        asientoExistente.setUsuarioEmail(asientoContable.getUsuarioEmail());

        List<MovimientoContable> nuevosMovimientos = asientoContable.getMovimientos().stream()
                .map(dto -> {
                    MovimientoContable movimiento = new MovimientoContable();
                    movimiento.setDescripcion(dto.getDescripcion());
                    movimiento.setCuenta(dto.getCuenta());
                    movimiento.setMonto(dto.getMonto());
                    movimiento.setEsDebito(dto.isEsDebito());
                    movimiento.setAsiento(asientoExistente);
                    return movimiento;
                }).collect(Collectors.toList());

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

    @Override
    @Transactional
    public AsientoContable createAsiento(AsientoContable asientoContable) {
        AsientoContable asiento = new AsientoContable();
        asiento.setFecha(asientoContable.getFecha());
        asiento.setUsuarioEmail(asientoContable.getUsuarioEmail());

        List<MovimientoContable> movimientos = asientoContable.getMovimientos().stream()
                .map(dto -> {
                    MovimientoContable movimiento = new MovimientoContable();
                    movimiento.setDescripcion(dto.getDescripcion());
                    movimiento.setCuenta(dto.getCuenta());
                    movimiento.setMonto(dto.getMonto());
                    movimiento.setEsDebito(dto.isEsDebito());
                    movimiento.setAsiento(asiento);
                    return movimiento;
                }).collect(Collectors.toList());

        if (movimientos.isEmpty()) {
            throw new IllegalArgumentException("El asiento contable debe tener al menos un movimiento contable.");
        }

        for (MovimientoContable movimiento : movimientos) {
            asiento.addMovimiento(movimiento);
        }

        return asientoContableRepository.save(asiento);
    }

    @Override
    public Optional<AsientoContable> findById(Long id) {
        return asientoContableRepository.findById(id);
    }

    @Override
    public Page<AsientoContableDTO> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AsientoContable> asientosContables = asientoContableRepository.findAll(pageable);

        // Mapear los AsientosContables a DTOs optimizados
        Page<AsientoContableDTO> asientosDTO = asientosContables.map(asiento -> new AsientoContableDTO(
                asiento.getId(),
                asiento.getFecha(),
                asiento.getUsuarioEmail()
        ));

        return asientosDTO;
    }

    @Override
    public Page<AsientoLibroDiarioDTO> libroDiario(int page, int size, LocalDate fechaInicial, LocalDate fechaFinal) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AsientoContable> asientos = asientoContableRepository.findByFechaBetween(fechaInicial, fechaFinal, pageable);

        return asientos.map(asiento -> {
            List<MovimientoLibroDiarioDTO> movimientosDTO = asiento.getMovimientos().stream()
                    .map(movimiento -> new MovimientoLibroDiarioDTO(
                            movimiento.getDescripcion(),
                            movimiento.isEsDebito(),
                            movimiento.getMonto()
                    ))
                    .collect(Collectors.toList());

            return new AsientoLibroDiarioDTO(asiento.getId(), asiento.getFecha(), movimientosDTO);
        });
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

    public AsientoContable crearAsientoContable(AsientoContable asiento, List<MovimientoContable> movimientos) {
        for (MovimientoContable movimiento : movimientos) {
            asiento.addMovimiento(movimiento);
        }
        return asientoContableRepository.save(asiento);
    }
}
