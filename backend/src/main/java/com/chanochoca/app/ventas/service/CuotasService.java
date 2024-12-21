package com.chanochoca.app.ventas.service;

import com.chanochoca.app.ventas.models.entity.Cuotas;

import java.util.List;

public interface CuotasService {
    List<Cuotas> getCuotasByEmail(String email);

    Cuotas updateCuota(Cuotas cuota);
}
