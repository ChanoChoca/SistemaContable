package com.chanochoca.app.ventas.service;

import com.chanochoca.app.ventas.models.NewPagoDTO;
import com.chanochoca.app.ventas.models.entity.Pagos;
import com.chanochoca.app.ventas.repository.PagosRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PagosServiceImpl implements PagosService {

    private final PagosRepository pagosRepository;

    public PagosServiceImpl(PagosRepository pagosRepository) {
        this.pagosRepository = pagosRepository;
    }

    @Override
    public List<Pagos> findAll() {
        return (List<Pagos>) pagosRepository.findAll();
    }

    @Override
    public List<Pagos> createPagos(List<NewPagoDTO> pagos) {
        List<Pagos> pagosBd = new ArrayList<>();
        for (NewPagoDTO pago : pagos) {
            Pagos pagoBd = new Pagos();
            pagoBd.setId(null);
            pagoBd.setCantidad(pago.getCantidad());
            pagoBd.setCuenta(pago.getCuenta());
            pagoBd.setCuota(pago.getCuota());
            pagoBd.setVenta(pago.getVenta());
            pagosBd.add(pagoBd);
        }
        return (List<Pagos>) pagosRepository.saveAll(pagosBd);
    }
}
