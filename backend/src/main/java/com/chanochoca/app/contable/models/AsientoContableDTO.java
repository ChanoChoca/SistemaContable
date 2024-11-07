package com.chanochoca.app.contable.models;

import java.time.LocalDate;

public class AsientoContableDTO {
    private Long id;
    private LocalDate fecha;
    private String usuarioEmail;

    public AsientoContableDTO(Long id, LocalDate fecha, String usuarioEmail) {
        this.id = id;
        this.fecha = fecha;
        this.usuarioEmail = usuarioEmail;
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

    public String getUsuarioEmail() {
        return usuarioEmail;
    }

    public void setUsuarioEmail(String usuarioEmail) {
        this.usuarioEmail = usuarioEmail;
    }
}
