package com.chanochoca.app.ventas.repository;

import com.chanochoca.app.ventas.models.entity.Comprobantes;
import org.springframework.data.repository.CrudRepository;

public interface ComprobantesRepository extends CrudRepository<Comprobantes, Long> {

    Comprobantes findByVentaIdAndComprobanteTipo(Long ventaId, int comprobanteTipo);
}
