//package com.chanochoca.app.contable.models.entity;
//
//import java.io.Serializable;
//import jakarta.persistence.Embeddable;
//
//@Embeddable
//public class CuentaAsientoId implements Serializable {
//
//    private Long idCuenta;
//    private Long idAsiento;
//
//    public CuentaAsientoId() {
//    }
//
//    public CuentaAsientoId(Long idCuenta, Long idAsiento) {
//        this.idCuenta = idCuenta;
//        this.idAsiento = idAsiento;
//    }
//
//    public Long getIdCuenta() {
//        return idCuenta;
//    }
//
//    public void setIdCuenta(Long idCuenta) {
//        this.idCuenta = idCuenta;
//    }
//
//    public Long getIdAsiento() {
//        return idAsiento;
//    }
//
//    public void setIdAsiento(Long idAsiento) {
//        this.idAsiento = idAsiento;
//    }
//
//    // Sobrescribir equals() y hashCode() para que funcionen correctamente en las claves compuestas.
//    @Override
//    public boolean equals(Object o) {
//        if (this == o) return true;
//        if (o == null || getClass() != o.getClass()) return false;
//        CuentaAsientoId that = (CuentaAsientoId) o;
//        return idCuenta.equals(that.idCuenta) && idAsiento.equals(that.idAsiento);
//    }
//
//    @Override
//    public int hashCode() {
//        return idCuenta.hashCode() + idAsiento.hashCode();
//    }
//}
