package com.chanochoca.app.contable.models;

import java.time.LocalDate;
import java.util.List;

public class AsientoLibroDiarioDTO {
    private Long id;
    private LocalDate fecha;
    private List<MovimientoLibroDiarioDTO> movimientos;

    public AsientoLibroDiarioDTO() {
    }

    public AsientoLibroDiarioDTO(Long id, LocalDate fecha, List<MovimientoLibroDiarioDTO> movimientos) {
        this.id = id;
        this.fecha = fecha;
        this.movimientos = movimientos;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public List<MovimientoLibroDiarioDTO> getMovimientos() {
        return movimientos;
    }

    public void setMovimientos(List<MovimientoLibroDiarioDTO> movimientos) {
        this.movimientos = movimientos;
    }
}
