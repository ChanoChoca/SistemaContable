package com.chanochoca.app.cuenta.service;

import com.chanochoca.app.contable.models.entity.AsientoContable;
import com.chanochoca.app.contable.models.entity.MovimientoContable;
import com.chanochoca.app.contable.repository.AsientoContableRepository;
import com.chanochoca.app.contable.repository.MovimientoContableRepository;
import com.chanochoca.app.cuenta.models.NewCuentaDTO;
import com.chanochoca.app.cuenta.models.entity.Cuenta;
import com.chanochoca.app.cuenta.repository.CuentaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class CuentaServiceImpl implements CuentaService {

    private final CuentaRepository cuentaRepository;
    private final MovimientoContableRepository movimientoRepository;
    private final AsientoContableRepository asientoRepository;

    public CuentaServiceImpl(CuentaRepository cuentaRepository, MovimientoContableRepository movimientoRepository, AsientoContableRepository asientoRepository) {
        this.cuentaRepository = cuentaRepository;
        this.movimientoRepository = movimientoRepository;
        this.asientoRepository = asientoRepository;
    }

    @Override
    @Transactional
    public void deleteCuenta(Long id) {
        Optional<Cuenta> cuentaOptional = cuentaRepository.findById(id);

        if (cuentaOptional.isPresent()) {
            Cuenta cuentaAEliminar = cuentaOptional.get();
            deleteMovimientos(cuentaAEliminar);
            updateCuentaPadreAndSubCuentas(cuentaAEliminar);
            cuentaRepository.deleteById(id);
        } else {
            throw new NoSuchElementException("Cuenta not found");
        }
    }

    @Override
    @Transactional
    public Cuenta updateCuenta(Long id, Cuenta cuenta) {
        Optional<Cuenta> existingCuenta = cuentaRepository.findById(id);
        if (existingCuenta.isPresent()) {
            Cuenta currentCuenta = existingCuenta.get();
            updateCuentaPadre(currentCuenta, cuenta);
            updateSubCuentas(currentCuenta, cuenta);
            updateCuentaDetails(currentCuenta, cuenta);
            return cuentaRepository.save(currentCuenta);
        } else {
            throw new NoSuchElementException("Cuenta not found");
        }
    }

    @Override
    @Transactional
    public Cuenta createCuenta(NewCuentaDTO newCuentaDTO) {
        Cuenta savedCuenta = new Cuenta();
        savedCuenta.setNombre(newCuentaDTO.getNombre());
        savedCuenta.setCodigo(newCuentaDTO.getCodigo());
        savedCuenta.setSaldo(newCuentaDTO.getSaldo());
        savedCuenta.setActiva(newCuentaDTO.isActiva());
        savedCuenta.setEliminada(newCuentaDTO.isEliminada());

        savedCuenta.setCuentaPadre(null);
        savedCuenta.setSubCuentas(null);

        cuentaRepository.save(savedCuenta);

        setCuentaPadre(newCuentaDTO, savedCuenta);
        setSubCuentas(newCuentaDTO, savedCuenta);

        cuentaRepository.save(savedCuenta);
        return savedCuenta;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Cuenta> findById(Long id) {
        return cuentaRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Cuenta> findAll(int page, int size, String nombre) {
        Pageable pageable = PageRequest.of(page, size);
        return cuentaRepository.findByNombreContaining(nombre, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Cuenta> findCuentasSinPaginado() {
        Iterable<Cuenta> cuentasIterable = cuentaRepository.findByCuentaPadreIsNull();
        List<Cuenta> cuentasList = new ArrayList<>();
        cuentasIterable.forEach(cuentasList::add);
        return cuentasList;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Cuenta> findByNombre(String nombre) {
        return cuentaRepository.findByNombre(nombre);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Cuenta> getAccountTree(int page, int size, String nombre) {
        Pageable pageable = PageRequest.of(page, size);
        return cuentaRepository.findByNombreContainingAndCuentaPadreIsNull(nombre, pageable);
    }

    private void deleteMovimientos(Cuenta cuentaAEliminar) {
        List<MovimientoContable> movimientosAEliminar = movimientoRepository.findByCuenta_Id(cuentaAEliminar.getId());
        for (MovimientoContable movimiento : movimientosAEliminar) {
            if (movimiento.getId() == null) {
                continue;
            }

            AsientoContable asiento = movimiento.getAsiento();
            asiento.removeMovimiento(movimiento);
            asientoRepository.save(asiento);

            movimiento.setCuenta(null);
            movimiento.setAsiento(null);
            movimientoRepository.save(movimiento);
            movimientoRepository.delete(movimiento);
        }
    }

    private void updateCuentaPadreAndSubCuentas(Cuenta cuentaAEliminar) {
        if (cuentaAEliminar.getCuentaPadre() != null) {
            Cuenta cuentaPadre = cuentaAEliminar.getCuentaPadre();
            if (cuentaAEliminar.getSubCuentas() != null && !cuentaAEliminar.getSubCuentas().isEmpty()) {
                for (Cuenta subCuenta : cuentaAEliminar.getSubCuentas()) {
                    subCuenta.setCuentaPadre(cuentaPadre);
                    cuentaRepository.save(subCuenta);
                    cuentaPadre.addSubCuenta(subCuenta);
                }
                cuentaRepository.save(cuentaPadre);
            } else {
                cuentaPadre.removeSubCuenta(cuentaAEliminar);
                cuentaRepository.save(cuentaPadre);
            }
        } else if (cuentaAEliminar.getSubCuentas() != null && !cuentaAEliminar.getSubCuentas().isEmpty()) {
            for (Cuenta subCuenta : cuentaAEliminar.getSubCuentas()) {
                subCuenta.setCuentaPadre(null);
                cuentaRepository.save(subCuenta);
            }
        }
    }

    private void updateCuentaPadre(Cuenta currentCuenta, Cuenta cuenta) {
        if (!Objects.equals(currentCuenta.getCuentaPadre(), cuenta.getCuentaPadre())) {
            Cuenta cuentaPadreAntigua = currentCuenta.getCuentaPadre();
            Cuenta cuentaPadreNueva = cuenta.getCuentaPadre();

            if (hasCyclicHierarchy(currentCuenta, cuentaPadreNueva)) {
                throw new IllegalArgumentException("Cyclic hierarchy detected");
            }

            if (cuentaPadreAntigua != null) {
                cuentaPadreAntigua.removeSubCuenta(currentCuenta);
                cuentaRepository.save(cuentaPadreAntigua);
            }

            if (cuentaPadreNueva != null) {
                cuentaPadreNueva.addSubCuenta(cuenta);
                cuentaRepository.save(cuentaPadreNueva);
            }
        }
    }

    private void updateSubCuentas(Cuenta currentCuenta, Cuenta cuenta) {
        if (!Objects.equals(currentCuenta.getSubCuentas(), cuenta.getSubCuentas())) {
            if (currentCuenta.getSubCuentas() != null) {
                if (hasCyclicHierarchyInSubcuentas(currentCuenta, cuenta.getSubCuentas())) {
                    throw new IllegalArgumentException("Cyclic hierarchy detected in subaccounts");
                }

                for (Cuenta subCuenta : currentCuenta.getSubCuentas()) {
                    if (subCuenta != null) {
                        subCuenta.setCuentaPadre(null);
                        cuentaRepository.save(subCuenta);
                    }
                }
            }

            if (cuenta.getSubCuentas() != null) {
                for (Cuenta subCuenta : cuenta.getSubCuentas()) {
                    if (subCuenta != null) {
                        subCuenta.setCuentaPadre(cuenta);
                        cuentaRepository.save(subCuenta);
                    }
                }
            }
        }
    }

    private void updateCuentaDetails(Cuenta currentCuenta, Cuenta cuenta) {
        currentCuenta.setNombre(cuenta.getNombre());
        currentCuenta.setCodigo(cuenta.getCodigo());
        currentCuenta.setSaldo(cuenta.getSaldo());
        currentCuenta.setCuentaPadre(cuenta.getCuentaPadre());
        currentCuenta.setSubCuentas(cuenta.getSubCuentas());
        currentCuenta.setActiva(cuenta.isActiva());
        currentCuenta.setEliminada(cuenta.isEliminada());
    }

    private void setCuentaPadre(NewCuentaDTO newCuentaDTO, Cuenta savedCuenta) {
        if (newCuentaDTO.getCuentaPadre() != null) {
            Optional<Cuenta> cuentaPadreOpt = cuentaRepository.findById(newCuentaDTO.getCuentaPadre().getId());
            if (cuentaPadreOpt.isPresent()) {
                Cuenta cuentaPadre = cuentaPadreOpt.get();
                savedCuenta.setCuentaPadre(cuentaPadre);

                if (hasCyclicHierarchy(savedCuenta, cuentaPadre)) {
                    throw new IllegalArgumentException("Cyclic hierarchy detected");
                }

                cuentaPadre.addSubCuenta(savedCuenta);
                cuentaRepository.save(cuentaPadre);
            } else {
                throw new IllegalArgumentException("Parent account not found");
            }
        }
    }

    private void setSubCuentas(NewCuentaDTO newCuentaDTO, Cuenta savedCuenta) {
        if (newCuentaDTO.getSubCuentas() != null && !newCuentaDTO.getSubCuentas().contains(null)) {
            List<Cuenta> subCuentasPersistidas = new ArrayList<>();

            for (Cuenta subCuenta : newCuentaDTO.getSubCuentas()) {
                if (hasCyclicHierarchy(savedCuenta, subCuenta)) {
                    throw new IllegalArgumentException("Cyclic hierarchy detected in subaccount");
                }

                Optional<Cuenta> subCuentaOpt = cuentaRepository.findById(subCuenta.getId());

                if (subCuentaOpt.isPresent()) {
                    Cuenta subCuentaExistente = subCuentaOpt.get();
                    subCuentaExistente.setCuentaPadre(savedCuenta);
                    subCuentasPersistidas.add(subCuentaExistente);

                    cuentaRepository.save(subCuentaExistente);
                } else {
                    throw new IllegalArgumentException("Subaccount not found");
                }
            }

            savedCuenta.setSubCuentas(subCuentasPersistidas);
        }
    }

    private boolean hasCyclicHierarchy(Cuenta cuenta, Cuenta potentialParent) {
        Cuenta current = potentialParent;
        while (current != null) {
            if (current.equals(cuenta)) {
                return true;
            }
            current = current.getCuentaPadre();
        }
        return false;
    }

    private boolean hasCyclicHierarchyInSubcuentas(Cuenta cuenta, List<Cuenta> subCuentas) {
        for (Cuenta subCuenta : subCuentas) {
            if (subCuenta != null && (subCuenta.equals(cuenta) || hasCyclicHierarchy(cuenta, subCuenta))) {
                return true;
            }
        }
        return false;
    }
}
