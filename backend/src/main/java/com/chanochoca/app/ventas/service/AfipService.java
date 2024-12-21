package com.chanochoca.app.ventas.service;

import com.chanochoca.app.ventas.models.FacturaRequest;
import com.chanochoca.app.ventas.models.FacturaResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

@Service
public class AfipService {

    private final String apiUrl = "https://app.afipsdk.com/api/v1/afip/requests"; // URL de la API AFIP
    private final String authUrl = "https://app.afipsdk.com/api/v1/afip/auth";

    public FacturaResponse generarFactura(FacturaRequest request) throws Exception {
        // Obtener Token y Sign
        String authResponseBody = obtenerAuth();
        Map<String, String> authData = parseJson(authResponseBody);
        String token = authData.get("token");
        String sign = authData.get("sign");

        // Preparar datos de la factura
        String invoiceRequestBody = prepararDatosFactura(token, sign, request);

        // Enviar solicitud de factura
        HttpRequest invoiceRequest = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(invoiceRequestBody))
                .build();

        HttpClient client = HttpClient.newBuilder().build();
        HttpResponse<String> invoiceResponse = client.send(invoiceRequest, HttpResponse.BodyHandlers.ofString());

        if (invoiceResponse.statusCode() >= 400) {
            throw new RuntimeException("Error en la solicitud de factura: " + invoiceResponse.body());
        }
        //TODO: al intentar retornar ocurre el error.
        // Los datos del debug estáran en el bloc de notas
        return parseJson(invoiceResponse.body(), FacturaResponse.class);
    }

    private String obtenerAuth() throws Exception {
        String authRequestBody = "{"
                + "\"environment\": \"dev\","
                + "\"tax_id\": \"20409378472\","
                + "\"wsid\": \"wsfe\""
                + "}";

        HttpRequest authRequest = HttpRequest.newBuilder()
                .uri(URI.create(authUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(authRequestBody))
                .build();

        HttpClient client = HttpClient.newBuilder().build();
        HttpResponse<String> authResponse = client.send(authRequest, HttpResponse.BodyHandlers.ofString());

        if (authResponse.statusCode() >= 400) {
            throw new RuntimeException("Error en la autenticación: " + authResponse.body());
        }

        return authResponse.body();
    }

    private int obtenerUltimoComprobanteAutorizado(String token, String sign, int puntoVenta, int tipoComprobante) throws Exception {
        String requestBody = "{"
                + "\"environment\": \"dev\","
                + "\"method\": \"FECompUltimoAutorizado\","
                + "\"wsid\": \"wsfe\","
                + "\"params\": {"
                + "  \"Auth\": {"
                + "    \"Token\": \"" + token + "\","
                + "    \"Sign\": \"" + sign + "\","
                + "    \"Cuit\": \"20409378472\""
                + "  },"
                + "  \"PtoVta\": " + puntoVenta + ","
                + "  \"CbteTipo\": " + tipoComprobante
                + "}}";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpClient client = HttpClient.newBuilder().build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            throw new RuntimeException("Error al consultar último comprobante autorizado: " + response.body());
        }

        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = objectMapper.readTree(response.body());
        return jsonNode.at("/FECompUltimoAutorizadoResult/CbteNro").asInt();
    }


    private String prepararDatosFactura(String token, String sign, FacturaRequest request) throws Exception {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMdd");
        String fechaActual = formatter.format(new Date());

        // Consultar el último comprobante autorizado
        int ultimoComprobante = obtenerUltimoComprobanteAutorizado(token, sign, 1, 6); // Punto de venta 1, tipo de comprobante 6
        int proximoComprobante = ultimoComprobante + 1;

        return "{"
                + "\"environment\": \"dev\","
                + "\"method\": \"FECAESolicitar\","
                + "\"wsid\": \"wsfe\","
                + "\"params\": {"
                + "  \"Auth\": {"
                + "    \"Token\": \"" + token + "\","
                + "    \"Sign\": \"" + sign + "\","
                + "    \"Cuit\": \"20409378472\""
                + "  },"
                + "  \"FeCAEReq\": {"
                + "    \"FeCabReq\": {"
                + "      \"CantReg\": 1,"
                + "      \"PtoVta\": 1,"
                + "      \"CbteTipo\": 6"
                + "    },"
                + "    \"FeDetReq\": {"
                + "      \"FECAEDetRequest\": {"
                + "        \"Concepto\": 1,"
                + "        \"DocTipo\": 99,"
                + "        \"DocNro\": 0,"
                + "        \"CbteDesde\": " + proximoComprobante + ","
                + "        \"CbteHasta\": " + proximoComprobante + ","
                + "        \"CbteFch\": \"" + fechaActual + "\","
                + "        \"ImpTotal\": 121,"
                + "        \"ImpTotConc\": 0,"
                + "        \"ImpNeto\": 100,"
                + "        \"ImpOpEx\": 0,"
                + "        \"ImpIVA\": 21,"
                + "        \"ImpTrib\": 0,"
                + "        \"MonId\": \"PES\","
                + "        \"MonCotiz\": 1,"
                + "        \"Iva\": {"
                + "          \"AlicIva\": [{"
                + "            \"Id\": 5,"
                + "            \"BaseImp\": 100,"
                + "            \"Importe\": 21"
                + "          }]"
                + "        }"
                + "      }"
                + "    }"
                + "  }"
                + "}}";
    }

    private Map<String, String> parseJson(String json) {
        // Método para parsear JSON plano a un Map
        Map<String, String> map = new HashMap<>();
        String[] entries = json.replaceAll("\\{", "")
                .replaceAll("}", "")
                .split(",");

        for (String entry : entries) {
            String[] keyValue = entry.split(":");
            String key = keyValue[0].trim().replaceAll("\"", "");
            String value = keyValue[1].trim().replaceAll("\"", "");
            map.put(key, value);
        }
        return map;
    }

//    private <T> T parseJson(String json, Class<T> clazz) throws Exception {
//        // Método genérico para convertir JSON a un objeto Java (usando Jackson)
//        ObjectMapper objectMapper = new ObjectMapper();
//        return objectMapper.readValue(json, clazz);
//    }
    private <T> T parseJson(String json, Class<T> clazz) throws Exception {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(json, clazz);
        } catch (Exception e) {
            throw new RuntimeException("Error al parsear el JSON: " + json, e);
        }
    }
}
