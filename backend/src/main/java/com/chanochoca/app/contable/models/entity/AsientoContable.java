package com.chanochoca.app.contable.models.entity;

import com.chanochoca.app.user.models.AbstractAuditingEntity;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class AsientoContable extends AbstractAuditingEntity<Long> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private String usuarioEmail;

    @OneToMany(mappedBy = "asiento", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<MovimientoContable> movimientos = new ArrayList<>();

    public AsientoContable() {
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

    public List<MovimientoContable> getMovimientos() {
        return movimientos;
    }

    public void setMovimientos(List<MovimientoContable> movimientos) {
        this.movimientos = movimientos;
    }

    public void addMovimiento(MovimientoContable movimiento) {
        this.movimientos.add(movimiento);
    }

    public void removeMovimiento(MovimientoContable movimiento) {
        this.movimientos.remove(movimiento);
    }
}
