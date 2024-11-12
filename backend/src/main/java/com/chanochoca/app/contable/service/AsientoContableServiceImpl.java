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
        updateAsientoDetails(asientoExistente, asientoContable);
        List<MovimientoContable> nuevosMovimientos = createMovimientos(asientoContable, asientoExistente);

        clearExistingMovimientos(asientoExistente);
        addNewMovimientos(asientoExistente, nuevosMovimientos);

        return asientoContableRepository.save(asientoExistente);
    }

    @Override
    @Transactional
    public AsientoContable createAsiento(AsientoContable asientoContable) {
        AsientoContable asiento = new AsientoContable();
        asiento.setFecha(asientoContable.getFecha());
        asiento.setUsuarioEmail(asientoContable.getUsuarioEmail());

        List<MovimientoContable> movimientos = createMovimientos(asientoContable, asiento);

        if (movimientos.isEmpty()) {
            throw new IllegalArgumentException("El asiento contable debe tener al menos un movimiento contable.");
        }

        addNewMovimientos(asiento, movimientos);

        return asientoContableRepository.save(asiento);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AsientoContable> findById(Long id) {
        return asientoContableRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AsientoContableDTO> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AsientoContable> asientosContables = asientoContableRepository.findAll(pageable);

        return asientosContables.map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AsientoLibroDiarioDTO> libroDiario(int page, int size, LocalDate fechaInicial, LocalDate fechaFinal) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AsientoContable> asientos = asientoContableRepository.findByFechaBetween(fechaInicial, fechaFinal, pageable);

        return asientos.map(this::convertToLibroDiarioDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AsientoContable> libroDiarioSinPaginado(LocalDate fechaInicial, LocalDate fechaFinal) {
        Iterable<AsientoContable> asientosIterable = asientoContableRepository.findByFechaBetween(fechaInicial, fechaFinal);
        List<AsientoContable> asientosList = new ArrayList<>();
        asientosIterable.forEach(asientosList::add);
        return asientosList;
    }

    private void updateAsientoDetails(AsientoContable asientoExistente, AsientoContable asientoContable) {
        asientoExistente.setFecha(asientoContable.getFecha());
        asientoExistente.setUsuarioEmail(asientoContable.getUsuarioEmail());
    }

    private List<MovimientoContable> createMovimientos(AsientoContable asientoContable, AsientoContable asientoExistente) {
        return asientoContable.getMovimientos().stream()
                .map(dto -> {
                    MovimientoContable movimiento = new MovimientoContable();
                    movimiento.setDescripcion(dto.getDescripcion());
                    movimiento.setCuenta(dto.getCuenta());
                    movimiento.setMonto(dto.getMonto());
                    movimiento.setTipoMovimiento(dto.getTipoMovimiento());

                    movimiento.setAsiento(asientoExistente);
                    return movimiento;
                }).collect(Collectors.toList());
    }

    private void clearExistingMovimientos(AsientoContable asientoExistente) {
        asientoExistente.getMovimientos().clear();
        asientoContableRepository.save(asientoExistente);
    }

    private void addNewMovimientos(AsientoContable asientoExistente, List<MovimientoContable> nuevosMovimientos) {
        for (MovimientoContable movimiento : nuevosMovimientos) {
            movimiento.setAsiento(asientoExistente);
            asientoExistente.getMovimientos().add(movimiento);
        }
    }

    private AsientoContableDTO convertToDTO(AsientoContable asiento) {
        return new AsientoContableDTO(
                asiento.getId(),
                asiento.getFecha(),
                asiento.getUsuarioEmail()
        );
    }

    private AsientoLibroDiarioDTO convertToLibroDiarioDTO(AsientoContable asiento) {
        List<MovimientoLibroDiarioDTO> movimientosDTO = asiento.getMovimientos().stream()
                .map(movimiento -> new MovimientoLibroDiarioDTO(
                        movimiento.getDescripcion(),
                        movimiento.getTipoMovimiento(),
                        movimiento.getMonto()
                ))
                .collect(Collectors.toList());

        return new AsientoLibroDiarioDTO(asiento.getId(), asiento.getFecha(), movimientosDTO);
    }

    @Override
    public void deleteById(Long id) {
        asientoContableRepository.deleteById(id);
    }
}
