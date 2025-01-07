package com.chanochoca.app.ventas.service;

import com.chanochoca.app.ventas.models.ComprobanteRequest;
import com.chanochoca.app.ventas.models.arca.SoapRequestBuilder;
import com.chanochoca.app.ventas.models.entity.Comprobantes;
import com.chanochoca.app.ventas.models.entity.Ventas;
import org.json.JSONObject;
import org.json.XML;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import static com.chanochoca.app.ventas.models.arca.SoapRequestBuilder.*;

@Service
public class WsfeService {

    private static final String ENDPOINT_SOLICITUD = "https://wswhomo.afip.gov.ar/wsfev1/service.asmx?op=FECAESolicitar";
    private static final String ENDPOINT_ULTIMO_COMPROBANTE = "https://wswhomo.afip.gov.ar/wsfev1/service.asmx?op=FECompUltimoAutorizado";
    private static final String ENDPOINT_OBTENER_COMPROBANTE = "https://wswhomo.afip.gov.ar/wsfev1/service.asmx?op=FECompConsultar";
    private static final long CUIT = 20429631778L;
    private final VentasService ventasService;
    private final ComprobantesService comprobantesService;

    public WsfeService(VentasService ventasService, ComprobantesService comprobantesService) {
        this.ventasService = ventasService;
        this.comprobantesService = comprobantesService;
    }

    private String obtenerUltimoComprobante(int comprobanteTipo) {
        try {
            // Cargar token y sign desde el archivo temp_token.properties
            Properties tempProperties = new Properties();
            try (InputStream input = new FileInputStream("./temp_token.properties")) {
                tempProperties.load(input);
            } catch (Exception e) {
                throw new RuntimeException("Error al cargar el archivo temp_token.properties", e);
            }

            String token = tempProperties.getProperty("token");
            String sign = tempProperties.getProperty("sign");

            // Obtener el último comprobante autorizado
            return getUltimoComprobante(ENDPOINT_ULTIMO_COMPROBANTE, token, sign, CUIT, 1, comprobanteTipo);
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener el último comprobante autorizado", e);
        }
    }

    public String crearComprobante(List<ComprobanteRequest> comprobantes) {

        Ventas ventabd = ventasService.findById(comprobantes.get(0).getVentaId());
        List<Comprobantes> comprobantesBd = new ArrayList<>();

        // Cargar token y sign desde el archivo temp_token.properties
        Properties tempProperties = new Properties();
        try (InputStream input = new FileInputStream("./temp_token.properties")) {
            tempProperties.load(input);
        } catch (Exception e) {
            throw new RuntimeException("Error al cargar el archivo temp_token.properties", e);
        }

        String token = tempProperties.getProperty("token");
        String sign = tempProperties.getProperty("sign");

        // Usar un StringBuilder para acumular las respuestas de todos los comprobantes procesados
        StringBuilder responseBuilder = new StringBuilder();

        // Procesar cada comprobante
        for (ComprobanteRequest comprobante : comprobantes) {
            try {
                // Obtener el último comprobante
                // Cada número de comprobante es único en cierta tipo de factura.
                String ultimoComprobante = obtenerUltimoComprobante(comprobante.getCbteTipo());

                // Crear un nuevo comprobante
                String result = SoapRequestBuilder.crearComprobante(
                        ENDPOINT_SOLICITUD, token, sign, CUIT,
                        Long.parseLong(ultimoComprobante), comprobante.getCbteTipo(),
                        comprobante.getDocNro(), comprobante.getImpNeto()
                );

                // Extraer comprobanteNro y comprobanteTipo desde result
                DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                DocumentBuilder builder = factory.newDocumentBuilder();
                Document document = builder.parse(new InputSource(new StringReader(result)));

                String resultado = document.getElementsByTagName("Resultado").item(0).getTextContent();

                // Verificar si la factura fue aprobada o rechazada
                if ("A".equals(resultado)) {
                    // Extraer el número de comprobante y tipo desde la respuesta
                    long comprobanteNro = Long.parseLong(document.getElementsByTagName("CbteDesde").item(0).getTextContent());
                    int comprobanteTipo = Integer.parseInt(document.getElementsByTagName("CbteTipo").item(0).getTextContent());

                    // Crear el objeto Comprobantes y agregarlo a la lista
                    Comprobantes comprobanteAGuardar = new Comprobantes((int) comprobanteNro, comprobanteTipo, ventabd);
                    comprobantesBd.add(comprobanteAGuardar);
                } else {
                    System.err.println("Comprobante rechazado. Detalles: " + result);
                }

            } catch (Exception e) {
                // Manejar error de cada comprobante, agregar a respuesta en caso de error
                responseBuilder.append("Error al crear el comprobante para el tipo ")
                        .append(comprobante.getCbteTipo())
                        .append(" con documento ").append(comprobante.getDocNro())
                        .append(": ").append(e.getMessage()).append("\n");
            }
        }
        this.comprobantesService.createComprobantes(comprobantesBd);

        // Devolver todas las respuestas generadas
        return responseBuilder.toString();
    }

    public String consultarComprobante(int cbteTipo, long cbteNro) {
        try {
            // Cargar token y sign desde el archivo temp_token.properties
            Properties tempProperties = new Properties();
            try (InputStream input = new FileInputStream("./temp_token.properties")) {
                tempProperties.load(input);
            } catch (Exception e) {
                throw new RuntimeException("Error al cargar el archivo temp_token.properties", e);
            }

            String token = tempProperties.getProperty("token");
            String sign = tempProperties.getProperty("sign");

            String result = SoapRequestBuilder.consultarComprobante(ENDPOINT_OBTENER_COMPROBANTE, token, sign, CUIT, cbteTipo, cbteNro);
            System.out.println("Resultado XML: " + result);

            // Convertir XML a JSON
            JSONObject json = XML.toJSONObject(result);
            System.out.println("Resultado JSON: " + json.toString(4)); // Formateado para debugging
            return json.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener el comprobante", e);
        }
    }
}