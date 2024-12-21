package com.chanochoca.app.ventas.service;

import com.chanochoca.app.ventas.models.entity.ArticulosVentas;
import com.chanochoca.app.ventas.models.entity.Cuotas;
import com.chanochoca.app.ventas.models.entity.Pagos;
import com.chanochoca.app.ventas.models.entity.Ventas;
import com.chanochoca.app.ventas.repository.ArticulosVentasRepository;
import com.chanochoca.app.ventas.repository.CuotasRepository;
import com.chanochoca.app.ventas.repository.PagosRepository;
import com.chanochoca.app.ventas.repository.VentasRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ArticulosVentasServiceImpl implements ArticulosVentasService {

    private final ArticulosVentasRepository articulosVentasRepository;
    private final VentasRepository ventasRepository;
    private final CuotasRepository cuotasRepository;
    private final PagosRepository pagosRepository;

    public ArticulosVentasServiceImpl(ArticulosVentasRepository articulosVentasRepository, VentasRepository ventasRepository, CuotasRepository cuotasRepository, PagosRepository pagosRepository) {
        this.articulosVentasRepository = articulosVentasRepository;
        this.ventasRepository = ventasRepository;
        this.cuotasRepository = cuotasRepository;
        this.pagosRepository = pagosRepository;
    }

    @Override
    public List<ArticulosVentas> crearCuentasAsientos(List<ArticulosVentas> articulosVentas, List<Pagos> formasDePago, List<Cuotas> cuotas, Ventas venta) {
        if (articulosVentas.isEmpty()) {
            return articulosVentas;
        }

        venta.setNroComprobante(getNextNroComprobante());
        venta.setNroFactura(getNextNroComprobante());
        Ventas ventaGuardada = ventasRepository.save(venta);

        if (!cuotas.isEmpty()) {
            for (Cuotas cuota : cuotas) {
                cuota.setVenta(ventaGuardada);
                cuotasRepository.save(cuota);
            }
        }
        if (!formasDePago.isEmpty()) {
            for (Pagos forma : formasDePago) {
                forma.setVenta(ventaGuardada);
                forma.setCuota(null);
                pagosRepository.save(forma);
            }
        }

        // Guardar los CuentaAsiento asociados
        for (ArticulosVentas articuloVenta : articulosVentas) {
            articuloVenta.setVenta(ventaGuardada);
            articuloVenta.getVenta().setCliente(ventaGuardada.getCliente());
            articuloVenta.getVenta().setVendedorEmail(ventaGuardada.getVendedorEmail());
            articulosVentasRepository.save(articuloVenta);
        }

        return articulosVentas;
    }

    @Override
    public List<ArticulosVentas> findByMonth(String mes) {
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
        return articulosVentasRepository.findByVenta_FechaMonth(mesNumero);
    }

    @Override
    public List<ArticulosVentas> getAll() {
        return (List<ArticulosVentas>) articulosVentasRepository.findAll();
    }

    // Método para obtener el siguiente número de comprobante
    private int getNextNroComprobante() {
        Integer maxNroComprobante = ventasRepository.findMaxNroComprobante();  // Ahora devuelve un Integer
        return (maxNroComprobante != null) ? maxNroComprobante + 1 : 1;  // Si es null, empezar desde 1
    }
}
