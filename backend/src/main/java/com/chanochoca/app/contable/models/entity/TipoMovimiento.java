package com.chanochoca.app.contable.models.entity;

public enum TipoMovimiento {

    POSITIVO_ACTIVO("+A"),
    NEGATIVO_PASIVO("-P"),
    RESULTADO_NEGATIVO("R-"),
    NEGATIVO_ACTIVO("-A"),
    POSITIVO_PASIVO("+P"),
    RESULTADO_POSITIVO("R+");

    private final String codigo;

    TipoMovimiento(String codigo) {
        this.codigo = codigo;
    }

    public String getCodigo() {
        return codigo;
    }

    public static TipoMovimiento fromCodigo(String codigo) {
        if (codigo == null) {
            throw new IllegalArgumentException("El código del tipo de movimiento no puede ser nulo");
        }
        for (TipoMovimiento tipo : TipoMovimiento.values()) {
            if (tipo.getCodigo().equals(codigo)) {
                return tipo;
            }
        }
        throw new IllegalArgumentException("Tipo de movimiento inválido: " + codigo);
    }
}
