package com.chanochoca.app.ventas.service;

import com.chanochoca.app.ventas.models.entity.Ventas;
import com.chanochoca.app.ventas.repository.VentasRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VentasServiceImpl implements VentasService {

    private final VentasRepository ventasRepository;

    public VentasServiceImpl(VentasRepository ventasRepository) {
        this.ventasRepository = ventasRepository;
    }

    @Override
    public List<Ventas> findAll() {
        return (List<Ventas>) ventasRepository.findAll();
    }

    @Override
    public Ventas getVentaById(Long id) {
        Optional<Ventas> venta = ventasRepository.findById(id);
        return venta.orElse(null);
    }

    @Override
    public List<Ventas> getVentasByClienteEmail(String userEmail) {
        return ventasRepository.findVentasByClienteEmail(userEmail);
    }

    @Override
    public Ventas findById(long ventaId) {
        return ventasRepository.findById(ventaId).get();
    }
}
