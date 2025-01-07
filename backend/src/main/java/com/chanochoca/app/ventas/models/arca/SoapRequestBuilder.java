package com.chanochoca.app.ventas.models.arca;

import jakarta.xml.soap.*;

import java.io.ByteArrayOutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;


// https://www.afip.gob.ar/facturacion/regimen-general/comprobantes.asp
public class SoapRequestBuilder {
    public static String getUltimoComprobante(String endpoint, String token, String sign, long cuit, int ptoVta, int cbteTipo) throws Exception {
        // Crear el mensaje SOAP
        MessageFactory messageFactory = MessageFactory.newInstance();
        SOAPMessage soapMessage = messageFactory.createMessage();

        // Crear el envelope
        SOAPEnvelope envelope = soapMessage.getSOAPPart().getEnvelope();
        envelope.addNamespaceDeclaration("ar", "http://ar.gov.afip.dif.FEV1/");

        // Crear el cuerpo del mensaje
        SOAPBody soapBody = envelope.getBody();
        SOAPElement feCompUltimoAutorizado = soapBody.addChildElement("FECompUltimoAutorizado", "ar");

        SOAPElement auth = feCompUltimoAutorizado.addChildElement("Auth", "ar");
        auth.addChildElement("Token", "ar").addTextNode(token);
        auth.addChildElement("Sign", "ar").addTextNode(sign);
        auth.addChildElement("Cuit", "ar").addTextNode(String.valueOf(cuit));

        feCompUltimoAutorizado.addChildElement("PtoVta", "ar").addTextNode(String.valueOf(ptoVta));
        feCompUltimoAutorizado.addChildElement("CbteTipo", "ar").addTextNode(String.valueOf(cbteTipo));

        // Guardar el mensaje SOAP
        soapMessage.saveChanges();

        // Enviar la solicitud
        URL url = new URL(endpoint);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("POST");
        connection.setDoOutput(true);
        connection.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        // Escribir el mensaje SOAP en la conexión
        soapMessage.writeTo(connection.getOutputStream());

        // Leer la respuesta
        SOAPMessage response = MessageFactory.newInstance().createMessage(null, connection.getInputStream());

        // Extraer el número del último comprobante
        SOAPBody responseBody = response.getSOAPBody();
        SOAPElement feCompUltimoAutorizadoResult = (SOAPElement) responseBody
                .getElementsByTagName("FECompUltimoAutorizadoResult")
                .item(0);
        String cbteNro = feCompUltimoAutorizadoResult
                .getElementsByTagName("CbteNro")
                .item(0)
                .getTextContent();

        return cbteNro;
    }

    public static String crearComprobante(String endpoint, String token, String sign, long cuit, long cbteNro,
                                          int cbteTipo, long docNro, double impNeto) throws Exception {
        // Obtener la fecha actual
        LocalDate fechaActual = LocalDate.now();

        // Formatear la fecha en el formato YYYYMMDD
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        String cbteFch = fechaActual.format(formatter);

        // Aumentar número de comprobante
        cbteNro++;

        double impIVA = impNeto * 21.00 / 100.00;

        // Crear conexión al servicio
        SOAPConnectionFactory soapConnectionFactory = SOAPConnectionFactory.newInstance();
        SOAPConnection soapConnection = soapConnectionFactory.createConnection();

        // Crear mensaje SOAP
        MessageFactory messageFactory = MessageFactory.newInstance();
        SOAPMessage soapMessage = messageFactory.createMessage();
        SOAPPart soapPart = soapMessage.getSOAPPart();

        // Namespace
        String namespace = "ar";
        String namespaceURI = "http://ar.gov.afip.dif.FEV1/";

        // Construir SOAP Envelope
        SOAPEnvelope envelope = soapPart.getEnvelope();
        envelope.addNamespaceDeclaration(namespace, namespaceURI);

        // Construir el Body
        SOAPBody soapBody = envelope.getBody();
        SOAPElement feCAESolicitar = soapBody.addChildElement("FECAESolicitar", namespace);

        // Auth
        SOAPElement auth = feCAESolicitar.addChildElement("Auth", namespace);
        auth.addChildElement("Token", namespace).addTextNode(token);
        auth.addChildElement("Sign", namespace).addTextNode(sign);
        auth.addChildElement("Cuit", namespace).addTextNode(String.valueOf(cuit));

        // FeCAEReq
        SOAPElement feCAEReq = feCAESolicitar.addChildElement("FeCAEReq", namespace);

        // FeCabReq
        SOAPElement feCabReq = feCAEReq.addChildElement("FeCabReq", namespace);
        feCabReq.addChildElement("CantReg", namespace).addTextNode(String.valueOf(1));
        feCabReq.addChildElement("PtoVta", namespace).addTextNode(String.valueOf(1));
        feCabReq.addChildElement("CbteTipo", namespace).addTextNode(String.valueOf(cbteTipo));

        // FeDetReq
        SOAPElement feDetReq = feCAEReq.addChildElement("FeDetReq", namespace);
        SOAPElement feCAEDetRequest = feDetReq.addChildElement("FECAEDetRequest", namespace);
        feCAEDetRequest.addChildElement("Concepto", namespace).addTextNode(String.valueOf(1));
        if (cbteTipo != 6) {
            feCAEDetRequest.addChildElement("DocTipo", namespace).addTextNode(String.valueOf(80));
            feCAEDetRequest.addChildElement("DocNro", namespace).addTextNode(String.valueOf(docNro));
        } else {
            feCAEDetRequest.addChildElement("DocTipo", namespace).addTextNode(String.valueOf(99));
            feCAEDetRequest.addChildElement("DocNro", namespace).addTextNode(String.valueOf(0));
        }
        feCAEDetRequest.addChildElement("CbteDesde", namespace).addTextNode(String.valueOf(cbteNro));
        feCAEDetRequest.addChildElement("CbteHasta", namespace).addTextNode(String.valueOf(cbteNro));
        feCAEDetRequest.addChildElement("CbteFch", namespace).addTextNode(cbteFch);
        feCAEDetRequest.addChildElement("ImpTotal", namespace).addTextNode(String.valueOf(impNeto + impIVA));
        feCAEDetRequest.addChildElement("ImpTotConc", namespace).addTextNode(String.valueOf(0.00));
        feCAEDetRequest.addChildElement("ImpNeto", namespace).addTextNode(String.valueOf(impNeto));
        feCAEDetRequest.addChildElement("ImpOpEx", namespace).addTextNode(String.valueOf(0.00));
        //Aquí va ImpTrib
        feCAEDetRequest.addChildElement("ImpTrib", namespace).addTextNode(String.valueOf(0.00));
        feCAEDetRequest.addChildElement("ImpIVA", namespace).addTextNode(String.valueOf(impIVA));
        feCAEDetRequest.addChildElement("MonId", namespace).addTextNode("PES");
        feCAEDetRequest.addChildElement("MonCotiz", namespace).addTextNode(String.valueOf(1));

        // Iva
        if (impIVA > 0) {
            SOAPElement iva = feCAEDetRequest.addChildElement("Iva", namespace);
            SOAPElement alicIva = iva.addChildElement("AlicIva", namespace);
            alicIva.addChildElement("Id", namespace).addTextNode(String.valueOf(5));
            alicIva.addChildElement("BaseImp", namespace).addTextNode(String.valueOf(impNeto));
            alicIva.addChildElement("Importe", namespace).addTextNode(String.valueOf(impIVA));
        }

        // Guardar cambios en el mensaje SOAP
        soapMessage.saveChanges();

        // Enviar solicitud y obtener respuesta
        SOAPMessage soapResponse = soapConnection.call(soapMessage, endpoint);

        // Procesar la respuesta
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        soapResponse.writeTo(outputStream);
        soapConnection.close();
        return outputStream.toString();
    }

    public static String consultarComprobante(String endpoint, String token, String sign, long cuit, int cbteTipo, long cbteNro) throws Exception {
        // Crear el mensaje SOAP
        MessageFactory messageFactory = MessageFactory.newInstance();
        SOAPMessage soapMessage = messageFactory.createMessage();

        // Crear el envelope
        SOAPEnvelope envelope = soapMessage.getSOAPPart().getEnvelope();
        envelope.addNamespaceDeclaration("ar", "http://ar.gov.afip.dif.FEV1/");

        // Crear el cuerpo del mensaje
        SOAPBody soapBody = envelope.getBody();
        SOAPElement feCompConsultar = soapBody.addChildElement("FECompConsultar", "ar");

        // Auth
        SOAPElement auth = feCompConsultar.addChildElement("Auth", "ar");
        auth.addChildElement("Token", "ar").addTextNode(token);
        auth.addChildElement("Sign", "ar").addTextNode(sign);
        auth.addChildElement("Cuit", "ar").addTextNode(String.valueOf(cuit));

        // FeCompConsReq
        SOAPElement feCompConsReq = feCompConsultar.addChildElement("FeCompConsReq", "ar");
        feCompConsReq.addChildElement("CbteTipo", "ar").addTextNode(String.valueOf(cbteTipo));
        feCompConsReq.addChildElement("CbteNro", "ar").addTextNode(String.valueOf(cbteNro));
        feCompConsReq.addChildElement("PtoVta", "ar").addTextNode(String.valueOf(1));

        // Guardar el mensaje SOAP
        soapMessage.saveChanges();

        // Crear la conexión HTTP
        URL url = new URL(endpoint);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("POST");
        connection.setDoOutput(true);
        connection.setRequestProperty("Content-Type", "text/xml; charset=utf-8");

        // Escribir el mensaje SOAP
        soapMessage.writeTo(connection.getOutputStream());

        // Leer la respuesta
        SOAPMessage response = MessageFactory.newInstance().createMessage(null, connection.getInputStream());

        // Extraer el resultado del comprobante
        SOAPBody responseBody = response.getSOAPBody();
        SOAPElement feCompConsultarResult = (SOAPElement) responseBody
                .getElementsByTagName("FECompConsultarResult")
                .item(0);

        // Convertir la respuesta a texto (puedes adaptarlo según lo que necesites)
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        response.writeTo(outputStream);
        return outputStream.toString();
    }
}
