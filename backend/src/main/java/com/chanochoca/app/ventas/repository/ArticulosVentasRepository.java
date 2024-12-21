package com.chanochoca.app.ventas.repository;

import com.chanochoca.app.ventas.models.entity.ArticulosVentas;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticulosVentasRepository extends CrudRepository<ArticulosVentas, Long> {

    @Query("SELECT av FROM ArticulosVentas av WHERE MONTH(av.venta.fecha) = :mes")
    List<ArticulosVentas> findByVenta_FechaMonth(@Param("mes") int mes);
}
