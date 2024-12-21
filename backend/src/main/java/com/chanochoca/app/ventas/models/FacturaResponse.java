package com.chanochoca.app.ventas.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.util.List;

public class FacturaResponse {
    @JsonProperty("FECAESolicitarResult")
    private FECAESolicitarResult fecaesolicitarResult;

    // Getters y Setters

    public FECAESolicitarResult getFECAESolicitarResult() {
        return fecaesolicitarResult;
    }

    public void setFECAESolicitarResult(FECAESolicitarResult fecaesolicitarResult) {
        this.fecaesolicitarResult = fecaesolicitarResult;
    }

    public static class FECAESolicitarResult {
        @JsonProperty("FeCabResp")
        private FeCabResp feCabResp;

        @JsonProperty("FeDetResp")
        private FeDetResp feDetResp;

        // Getters y Setters
    }

    public static class FeCabResp {
        @JsonProperty("Cuit")
        private long cuit;

        @JsonProperty("PtoVta")
        private int ptoVta;

        @JsonProperty("CbteTipo")
        private int cbteTipo;

        @JsonProperty("FchProceso")
        private String fchProceso;

        @JsonProperty("CantReg")
        private int cantReg;

        @JsonProperty("Resultado")
        private String resultado;

        @JsonProperty("Reproceso")
        private String reproceso;

        // Getters y Setters
    }

    public static class FeDetResp {
        @JsonProperty("FECAEDetResponse")
        private List<FECAEDetResponse> fecaedetResponse;

        // Getters y Setters
    }

    public static class FECAEDetResponse {
        @JsonProperty("Concepto")
        private int concepto;

        @JsonProperty("DocTipo")
        private int docTipo;

        @JsonProperty("DocNro")
        private long docNro;

        @JsonProperty("CbteDesde")
        private int cbteDesde;

        @JsonProperty("CbteHasta")
        private int cbteHasta;

        @JsonProperty("CbteFch")
        private String cbteFch;

        @JsonProperty("Resultado")
        private String resultado;

        @JsonProperty("CAE")
        private String cae;

        @JsonProperty("CAEFchVto")
        private String caeFchVto;

        // Getters y Setters
    }
}
