package com.chanochoca.app.ventas.service;

import com.chanochoca.app.ventas.models.NewPagoDTO;
import com.chanochoca.app.ventas.models.entity.Pagos;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface PagosService {
    List<Pagos> findAll();

    List<Pagos> createPagos(List<NewPagoDTO> pagos);

    List<Pagos> findByVentaId(Long ventaId);
}
