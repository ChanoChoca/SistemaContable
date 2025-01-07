package com.chanochoca.app.ventas.service;

import com.chanochoca.app.ventas.models.entity.Comprobantes;
import com.chanochoca.app.ventas.repository.ComprobantesRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ComprobantesService {

    private final ComprobantesRepository comprobantesRepository;

    public ComprobantesService(ComprobantesRepository comprobantesRepository) {
        this.comprobantesRepository = comprobantesRepository;
    }

    public List<Comprobantes> createComprobantes(List<Comprobantes> comprobantesList) {
        return (List<Comprobantes>) comprobantesRepository.saveAll(comprobantesList);
    }

    public Comprobantes findComprobanteByVentaIdAndCbteTipo(Long ventaId, int cbteTipo) {
        return this.comprobantesRepository.findByVentaIdAndComprobanteTipo(ventaId, cbteTipo);
    }
}
