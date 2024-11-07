package com.chanochoca.app.cuenta.service;

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
    public CuentaServiceImpl(CuentaRepository cuentaRepository) {
        this.cuentaRepository = cuentaRepository;
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

        cuentaRepository.save(savedCuenta);
        return savedCuenta;
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




    @Override
    @Transactional
    public Cuenta save(Cuenta cuenta) {
        return cuentaRepository.save(cuenta);
    }
    @Override
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
    public void deleteById(Long id) {
        cuentaRepository.deleteById(id);
    }
    @Override
    public List<Cuenta> findByNombre(String nombre) {
        return cuentaRepository.findByNombre(nombre);
    }
    @Override
    @Transactional(readOnly = true)
    public Page<Cuenta> getAccountTree(int page, int size, String nombre) {
        Pageable pageable = PageRequest.of(page, size);
        return cuentaRepository.findByNombreContainingAndCuentaPadreIsNull(nombre, pageable);
    }
}
