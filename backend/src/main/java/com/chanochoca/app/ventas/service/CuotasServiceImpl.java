package com.chanochoca.app.ventas.service;

import com.chanochoca.app.user.repository.UserRepository;
import com.chanochoca.app.ventas.models.entity.Cuotas;
import com.chanochoca.app.ventas.models.entity.Ventas;
import com.chanochoca.app.ventas.repository.CuotasRepository;
import com.chanochoca.app.ventas.repository.VentasRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CuotasServiceImpl implements CuotasService {

    private final CuotasRepository cuotasRepository;
    private final UserRepository userRepository;
    private final VentasRepository ventasRepository;

    public CuotasServiceImpl(CuotasRepository cuotasRepository, UserRepository userRepository, VentasRepository ventasRepository) {
        this.cuotasRepository = cuotasRepository;
        this.userRepository = userRepository;
        this.ventasRepository = ventasRepository;
    }

    @Override
    public List<Cuotas> getCuotasByEmail(String email) {
        // Delegar la consulta al repositorio
        return cuotasRepository.findPendingCuotasByClientEmail(email);
    }

    @Override
    public Cuotas updateCuota(Cuotas cuota) {
        // Guardar el cliente asociado a la venta
        userRepository.save(cuota.getVenta().getCliente());

        // Guardar la cuota actualizada en la base de datos
        Cuotas cuotaGuardada = cuotasRepository.save(cuota);

        // Verificar si todas las cuotas asociadas a la venta están pagadas
        Ventas venta = cuotaGuardada.getVenta();
        List<Cuotas> cuotasAsociadas = cuotasRepository.findByVenta(venta);

        boolean todasPagadas = cuotasAsociadas.stream()
                .allMatch(c -> "Pagada".equalsIgnoreCase(c.getEstadoPago()));

        // Si todas las cuotas están pagadas, actualizar el estado de la venta
        if (todasPagadas) {
            venta.setEstado("Pagada");
            ventasRepository.save(venta); // Guardar los cambios de la venta
        }

        return cuotaGuardada;
    }

}
