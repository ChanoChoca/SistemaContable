package com.chanochoca.app.ventas.repository;

import com.chanochoca.app.ventas.models.entity.Pagos;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface PagosRepository extends CrudRepository<Pagos, Long> {

    List<Pagos> getByVenta_Id(Long ventaId);
}
