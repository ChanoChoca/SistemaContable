package com.chanochoca.app.cuenta.models.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.*;
import org.springframework.context.annotation.Lazy;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="cuentas")
public class Cuenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String codigo;

    @Column(nullable = false)
    private String tipo;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    @JsonBackReference
    private Cuenta cuentaPadre;  // Para la estructura en árbol

    @OneToMany(mappedBy = "cuentaPadre", fetch = FetchType.EAGER)
    private List<Cuenta> subCuentas = new ArrayList<>();

    @Column(precision = 19, scale = 2)
    private BigDecimal saldoActual;

    @Column(nullable = false)
    private boolean activa;

    public Cuenta() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Cuenta getCuentaPadre() {
        return cuentaPadre;
    }

    public void setCuentaPadre(Cuenta cuentaPadre) {
        this.cuentaPadre = cuentaPadre;
    }

    public List<Cuenta> getSubCuentas() {
        return subCuentas;
    }

    public void setSubCuentas(List<Cuenta> subCuentas) {
        this.subCuentas = subCuentas;
    }

    public BigDecimal getSaldoActual() {
        return saldoActual;
    }

    public void setSaldoActual(BigDecimal saldoActual) {
        this.saldoActual = saldoActual;
    }

    public void addSubCuenta(Cuenta cuenta) {
        this.getSubCuentas().add(cuenta);
    }

    public void removeSubCuenta(Cuenta cuenta) {
        this.getSubCuentas().remove(cuenta);
    }

    public boolean isActiva() {
        return activa;
    }

    public void setActiva(boolean activa) {
        this.activa = activa;
    }
}
