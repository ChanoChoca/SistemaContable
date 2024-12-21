package com.chanochoca.app.ventas.repository;

import com.chanochoca.app.ventas.models.entity.Cuotas;
import com.chanochoca.app.ventas.models.entity.Ventas;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CuotasRepository extends CrudRepository<Cuotas, Long> {

    // Buscar cuotas pendientes por email del cliente
    @Query("SELECT c FROM Cuotas c WHERE c.venta.cliente.email = :email AND c.estadoPago = 'Pendiente'")
    List<Cuotas> findPendingCuotasByClientEmail(@Param("email") String email);

    @Query("SELECT c FROM Cuotas c WHERE c.venta = :venta")
    List<Cuotas> findByVenta(@Param("venta") Ventas venta);
}
