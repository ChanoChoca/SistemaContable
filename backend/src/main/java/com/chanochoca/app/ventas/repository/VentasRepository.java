package com.chanochoca.app.ventas.repository;

import com.chanochoca.app.ventas.models.entity.Ventas;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VentasRepository extends CrudRepository<Ventas, Long> {
    @Query("SELECT v FROM Ventas v WHERE v.cliente.email = :email")
    List<Ventas> findVentasByClienteEmail(@Param("email") String email);

    @Query("SELECT MAX(v.nroComprobante) FROM Ventas v")
    Integer findMaxNroComprobante();
}
