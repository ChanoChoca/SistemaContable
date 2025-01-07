package com.chanochoca.app.contable.service;

import com.chanochoca.app.contable.models.entity.Asiento;
import com.chanochoca.app.contable.models.entity.CuentaAsiento;
import com.chanochoca.app.contable.repository.AsientoRepository;
import com.chanochoca.app.contable.repository.CuentaAsientoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class CuentaAsientoServiceImpl implements CuentaAsientoService {

    private final CuentaAsientoRepository cuentaAsientoRepository;
    private final AsientoRepository asientoRepository;

    public CuentaAsientoServiceImpl(CuentaAsientoRepository cuentaAsientoRepository, AsientoRepository asientoRepository) {
        this.cuentaAsientoRepository = cuentaAsientoRepository;
        this.asientoRepository = asientoRepository;
    }

    @Override
    @Transactional
    public List<CuentaAsiento> crearCuentasAsientos(List<CuentaAsiento> cuentasAsientos, Asiento asiento) {
        if (cuentasAsientos.isEmpty()) {
            return cuentasAsientos;
        }

        asientoRepository.save(asiento);

        // Guardar los CuentaAsiento asociados
        for (CuentaAsiento cuentaAsiento : cuentasAsientos) {
            cuentaAsiento.setAsiento(asiento);
            cuentaAsiento.getAsiento().setUsuario(asiento.getUsuario());
            cuentaAsientoRepository.save(cuentaAsiento);
        }

        return cuentasAsientos;
    }

    @Override
    public boolean existsByAsientoId(Long asientoId) {
        return cuentaAsientoRepository.existsByAsiento_Id(asientoId);
    }

    @Override
    public boolean existsByCuentaId(Long cuentaId) {
        return cuentaAsientoRepository.existsByCuenta_Id(cuentaId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CuentaAsiento> libroDiario(int page, int size, Date fechaInicial, Date fechaFinal) {
        Pageable pageable = PageRequest.of(page, size);

        return cuentaAsientoRepository.findByAsientoFechaBetween(fechaInicial, fechaFinal, pageable);
    }

    @Override
    public List<CuentaAsiento> libroDiarioSinPaginado(Date fechaInicio, Date fechaFin) {
        return cuentaAsientoRepository.findByAsientoFechaBetween(fechaInicio, fechaFin);
    }

    @Override
    public List<CuentaAsiento> libroMayor(Long cuentaId, Date fechaInicio, Date fechaFin) {
        if (cuentaId == null || fechaInicio == null || fechaFin == null) {
            throw new IllegalArgumentException("Los parámetros cuentaId, fechaInicio y fechaFin no pueden ser nulos.");
        }

        return cuentaAsientoRepository.findByCuenta_IdAndAsiento_FechaBetween(cuentaId, fechaInicio, fechaFin);
    }

    @Override
    public List<CuentaAsiento> obtenerVentasPorMes(String mes) {
        // Parsear el mes a una fecha (suponiendo formato 'yyyy-MM' como '2024-05')
        LocalDate fechaInicio = LocalDate.parse("2024-" + mes + "-01");  // Primer día del mes
        LocalDate fechaFin = fechaInicio.withDayOfMonth(fechaInicio.lengthOfMonth());  // Último día del mes

        // Convertir LocalDate a Date
        Date fechaInicioDate = java.sql.Date.valueOf(fechaInicio);
        Date fechaFinDate = java.sql.Date.valueOf(fechaFin);

        // Usar el repositorio para obtener los CuentaAsiento por CuentaId y el rango de fechas
        return cuentaAsientoRepository.findValidCuentaAsientosByMonth(fechaInicioDate, fechaFinDate);
    }

    @Override
    public List<CuentaAsiento> findByMonth(String mes) {
        System.out.println("Consultando...");
        // Mapeamos el nombre del mes al número correspondiente (1-12)
        Map<String, Integer> mesesMap = new HashMap<>();
        mesesMap.put("Enero", 1);
        mesesMap.put("Febrero", 2);
        mesesMap.put("Marzo", 3);
        mesesMap.put("Abril", 4);
        mesesMap.put("Mayo", 5);
        mesesMap.put("Junio", 6);
        mesesMap.put("Julio", 7);
        mesesMap.put("Agosto", 8);
        mesesMap.put("Septiembre", 9);
        mesesMap.put("Octubre", 10);
        mesesMap.put("Noviembre", 11);
        mesesMap.put("Diciembre", 12);

        // Convertimos el mes a su valor numérico
        Integer mesNumero = mesesMap.get(mes);

        // Verificamos si el mes es válido
        if (mesNumero == null) {
            throw new IllegalArgumentException("Mes no válido");
        }

        // Filtramos los artículos de venta por el mes de la fecha de la venta
        return cuentaAsientoRepository.findByAsientoMonth(mesNumero);
    }
}
