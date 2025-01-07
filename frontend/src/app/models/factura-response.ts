export interface FacturaResponse {
  "soap:Envelope": {
    "soap:Body": {
      "FECompConsultarResponse": {
        "FECompConsultarResult": {
          ResultGet: {
            DocTipo: number;
            FchServHasta: string;
            PtoVta: number;
            FchServDesde: string;
            ImpNeto: number;
            CodAutorizacion: number;
            MonCotiz: number;
            FchProceso: number;
            ImpIVA: number;
            FchVto: number;
            MonId: string;
            ImpTotal: number;
            ImpTrib: number;
            EmisionTipo: string;
            CbteHasta: number;
            ImpTotConc: number;
            DocNro: number;
            FchVtoPago: string;
            Resultado: string;
            CbteDesde: number;
            CbteFch: number;
            Iva: {
              AlicIva: {
                Importe: number;
                Id: number;
                BaseImp: number;
              };
            };
            ImpOpEx: number;
            Observaciones?: {
              Obs: {
                Msg: string;
                Code: number;
              };
            };
            Concepto: number;
            CbteTipo: number;
          };
        };
      };
    };
  };
}
