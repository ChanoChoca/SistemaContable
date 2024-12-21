package com.chanochoca.app.contable.repository;

import com.chanochoca.app.contable.models.entity.CuentaAsiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface CuentaAsientoRepository extends CrudRepository<CuentaAsiento, Long> {
    boolean existsByAsiento_Id(Long asientoId);

    boolean existsByCuenta_Id(Long cuentaId);

    Page<CuentaAsiento> findByAsientoFechaBetween(Date fecha1, Date asiento_fecha2, Pageable pageable);

    List<CuentaAsiento> findByAsientoFechaBetween(Date fecha1, Date asiento_fecha2);

    List<CuentaAsiento> findByCuenta_IdAndAsiento_FechaBetween(Long cuentaId, Date fechaInicio, Date fechaFin);

    @Query("SELECT ca FROM CuentaAsiento ca " +
            "WHERE ca.asiento.fecha BETWEEN :fechaInicio AND :fechaFin " +
            "AND ca.asiento.id IN (" +
            "   SELECT ca2.asiento.id FROM CuentaAsiento ca2 " +
            "   WHERE ca2.cuenta.nombre IN ('Ventas', 'CMV', 'Mercaderias') " +
            "   GROUP BY ca2.asiento.id " +
            "   HAVING COUNT(DISTINCT ca2.cuenta.nombre) >= 2" +
            ")")
    List<CuentaAsiento> findValidCuentaAsientosByMonth(@Param("fechaInicio") Date fechaInicio, @Param("fechaFin") Date fechaFin);

    @Query("SELECT ca FROM CuentaAsiento ca " +
            "WHERE MONTH(ca.asiento.fecha) = :mes " +
            "AND ca.asiento.id IN (" +
            "   SELECT ca2.asiento.id FROM CuentaAsiento ca2 " +
            "   WHERE ca2.cuenta.nombre IN ('Ventas', 'CMV', 'Mercaderias') " +
            "   GROUP BY ca2.asiento.id " +
            "   HAVING COUNT(DISTINCT ca2.cuenta.nombre) >= 2" +
            ")")
    List<CuentaAsiento> findByAsientoMonth(@Param("mes") Integer mes);
}
