package com.chanochoca.app.cuenta.service;

import com.chanochoca.app.cuenta.models.entity.Cuenta;
import com.chanochoca.app.cuenta.repository.CuentaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CuentaServiceImpl implements CuentaService {

    private final CuentaRepository cuentaRepository;

    public CuentaServiceImpl(CuentaRepository cuentaRepository) {
        this.cuentaRepository = cuentaRepository;
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
        Iterable<Cuenta> cuentasIterable = cuentaRepository.findAll();
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
}
