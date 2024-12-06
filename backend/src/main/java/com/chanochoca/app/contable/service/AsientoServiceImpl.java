package com.chanochoca.app.contable.service;

import com.chanochoca.app.contable.models.entity.Asiento;
import com.chanochoca.app.contable.repository.AsientoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class AsientoServiceImpl implements AsientoService {

    private final AsientoRepository asientoRepository;

    public AsientoServiceImpl(AsientoRepository asientoRepository) {
        this.asientoRepository = asientoRepository;
    }

    @Override
    public Date obtenerUltimaFecha() {
        return asientoRepository.findTopByOrderByFechaDesc()
                .map(asiento -> asiento.getFecha())
                .orElse(null);
    }

//    @Override
//    @Transactional
//    public Asiento updateAsiento(Long id, Asiento asiento) {
//        Optional<Asiento> asientoExistenteOpt = asientoContableRepository.findById(id);
//        if (!asientoExistenteOpt.isPresent()) {
//            throw new NoSuchElementException("AsientoContable not found");
//        }
//
//        Asiento asientoExistente = asientoExistenteOpt.get();
//        updateAsientoDetails(asientoExistente, asiento);
//        List<CuentaAsiento> nuevosMovimientos = createMovimientos(asiento, asientoExistente);
//
//        clearExistingMovimientos(asientoExistente);
//        addNewMovimientos(asientoExistente, nuevosMovimientos);
//
//        return asientoContableRepository.save(asientoExistente);
//    }
//
    @Override
    @Transactional
    public Asiento createAsiento(Asiento asiento) {
        return asientoRepository.save(asiento);
    }

    @Override
    public void deleteById(Long id) {
        asientoRepository.deleteById(id);
    }

    //
//    @Override
//    @Transactional(readOnly = true)
//    public Optional<Asiento> findById(Long id) {
//        return asientoContableRepository.findById(id);
//    }
//
    @Override
    @Transactional(readOnly = true)
    public Page<Asiento> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return asientoRepository.findAll(pageable);
    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public Page<AsientoLibroDiarioDTO> libroDiario(int page, int size, LocalDate fechaInicial, LocalDate fechaFinal) {
//        Pageable pageable = PageRequest.of(page, size);
//        Page<Asiento> asientos = asientoContableRepository.findByFechaBetween(fechaInicial, fechaFinal, pageable);
//
//        return asientos.map(this::convertToLibroDiarioDTO);
//    }
//
//    @Override
//    @Transactional(readOnly = true)
//    public List<Asiento> libroDiarioSinPaginado(LocalDate fechaInicial, LocalDate fechaFinal) {
//        Iterable<Asiento> asientosIterable = asientoContableRepository.findByFechaBetween(fechaInicial, fechaFinal);
//        List<Asiento> asientosList = new ArrayList<>();
//        asientosIterable.forEach(asientosList::add);
//        return asientosList;
//    }
//
//    private void updateAsientoDetails(Asiento asientoExistente, Asiento asiento) {
//        asientoExistente.setFecha(asiento.getFecha());
//        asientoExistente.setUsuarioEmail(asiento.getUsuarioEmail());
//    }
//
//    private List<CuentaAsiento> createMovimientos(Asiento asiento, Asiento asientoExistente) {
//        return asiento.getMovimientos().stream()
//                .map(dto -> {
//                    CuentaAsiento movimiento = new CuentaAsiento();
//                    movimiento.setCuenta(dto.getCuenta());
//                    movimiento.setMonto(dto.getMonto());
//                    movimiento.setTipoMovimiento(dto.getTipoMovimiento());
//
//                    movimiento.setAsiento(asientoExistente);
//                    return movimiento;
//                }).collect(Collectors.toList());
//    }
//
//    private void clearExistingMovimientos(Asiento asientoExistente) {
//        asientoExistente.getMovimientos().clear();
//        asientoContableRepository.save(asientoExistente);
//    }
//
//    private void addNewMovimientos(Asiento asientoExistente, List<CuentaAsiento> nuevosMovimientos) {
//        for (CuentaAsiento movimiento : nuevosMovimientos) {
//            movimiento.setAsiento(asientoExistente);
//            asientoExistente.getMovimientos().add(movimiento);
//        }
//    }
//
//    private AsientoContableDTO convertToDTO(Asiento asiento) {
//        return new AsientoContableDTO(
//                asiento.getId(),
//                asiento.getFecha(),
//                asiento.getUsuarioEmail()
//        );
//    }
//
//    private AsientoLibroDiarioDTO convertToLibroDiarioDTO(Asiento asiento) {
//        List<MovimientoLibroDiarioDTO> movimientosDTO = asiento.getMovimientos().stream()
//                .map(movimiento -> new MovimientoLibroDiarioDTO(
//                        movimiento.getTipoMovimiento(),
//                        movimiento.getMonto()
//                ))
//                .collect(Collectors.toList());
//
//        return new AsientoLibroDiarioDTO(asiento.getId(), asiento.getFecha(), movimientosDTO);
//    }
//
//    @Override
//    public void deleteById(Long id) {
//        asientoContableRepository.deleteById(id);
//    }
}
