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

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(nullable = false)
    private String codigo;

    @Column(precision = 19, scale = 2)
    private BigDecimal saldo;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    @JsonBackReference
    private Cuenta cuentaPadre;  // Para la estructura en árbol

    @OneToMany(mappedBy = "cuentaPadre", fetch = FetchType.EAGER)
    private List<Cuenta> subCuentas = new ArrayList<>();

    @Column(nullable = false)
    private boolean activa;

    @Column(nullable = false)
    private boolean eliminada;

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

    public BigDecimal getSaldo() {
        return saldo;
    }

    public void setSaldo(BigDecimal saldo) {
        this.saldo = saldo;
    }

    public Cuenta getCuentaPadre() {
        return cuentaPadre;
    }

    @PostConstruct
    public void setCuentaPadre(Cuenta cuentaPadre) {
        this.cuentaPadre = cuentaPadre;
    }

    public List<Cuenta> getSubCuentas() {
        return subCuentas;
    }

    public void setSubCuentas(List<Cuenta> subCuentas) {
        this.subCuentas = subCuentas;
    }

    public void addSubCuenta(Cuenta subCuenta) {
        this.getSubCuentas().add(subCuenta);
    }

    public boolean isActiva() {
        return activa;
    }

    public void setActiva(boolean activa) {
        this.activa = activa;
    }

    public boolean isEliminada() {
        return eliminada;
    }

    public void setEliminada(boolean eliminada) {
        this.eliminada = eliminada;
    }

    public void removeSubCuenta(Cuenta cuenta) {
        this.getSubCuentas().remove(cuenta);
    }
}
