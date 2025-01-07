package com.chanochoca.app.ventas.service;

import com.chanochoca.app.ventas.models.arca.ArcaWsaaClient;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import java.io.*;
import java.util.Properties;

@Service
public class WsaaService {

    private String token;
    private String sign;

    @Scheduled(fixedDelay = 43200000) // Cada 12 horas (12 * 60 * 60 * 1000 ms)
    public void generateOrRenewTicket() {
        String loginTicketResponse;
        Properties config = new Properties();
        Properties tempStorage = new Properties();

        // Leer configuración de wsaa_client.properties
        try (InputStream input = new FileInputStream("./wsaa_client.properties")) {
            config.load(input);
        } catch (Exception e) {
            throw new RuntimeException("Error al cargar las propiedades", e);
        }

        String endpoint = config.getProperty("endpoint", "https://wsaahomo.afip.gov.ar/ws/services/LoginCms");
        String service = config.getProperty("service", "test");
        String dstDN = config.getProperty("dstdn", "cn=wsaahomo,o=afip,c=ar,serialNumber=CUIT 33693450239");

        String p12file = config.getProperty("keystore", "test-keystore.p12");
        String signer = config.getProperty("keystore-signer", "coqui");
        String p12pass = config.getProperty("keystore-password", "miclaveprivada");

        long ticketTime = Long.parseLong(config.getProperty("TicketTime", "36000"));

        try {
            byte[] loginTicketRequestCms = ArcaWsaaClient.createCms(p12file, p12pass, signer, dstDN, service, ticketTime);
            loginTicketResponse = ArcaWsaaClient.invokeWsaa(loginTicketRequestCms, endpoint);

            // Procesar el XML de respuesta
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(new ByteArrayInputStream(loginTicketResponse.getBytes()));
            Element root = document.getDocumentElement();

            NodeList loginCmsReturnList = root.getElementsByTagNameNS("https://wsaa.afip.gov.ar/ws/services/LoginCms", "loginCmsReturn");
            if (loginCmsReturnList.getLength() > 0) {
                String loginCmsReturnXml = loginCmsReturnList.item(0).getTextContent();
                Document innerDocument = builder.parse(new ByteArrayInputStream(loginCmsReturnXml.getBytes()));
                Element innerRoot = innerDocument.getDocumentElement();

                this.token = getTextContent(innerRoot, "token");
                this.sign = getTextContent(innerRoot, "sign");

                System.out.println("Token y sign generados.");

                // Almacenar temporalmente en un archivo
                tempStorage.setProperty("token", token);
                tempStorage.setProperty("sign", sign);

                try (OutputStream output = new FileOutputStream("./temp_token.properties")) {
                    tempStorage.store(output, "Token and Sign Storage");
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al generar o renovar el TA", e);
        }
    }

    private String getTextContent(Element root, String tagName) {
        NodeList nodeList = root.getElementsByTagName(tagName);
        if (nodeList.getLength() > 0) {
            return nodeList.item(0).getTextContent();
        }
        return null;
    }

    public String getToken() {
        if (this.token == null) {
            loadTokenAndSign();
        }
        return token;
    }

    public String getSign() {
        if (this.sign == null) {
            loadTokenAndSign();
        }
        return sign;
    }

    private void loadTokenAndSign() {
        Properties tempStorage = new Properties();
        try (InputStream input = new FileInputStream("./temp_token.properties")) {
            tempStorage.load(input);
            this.token = tempStorage.getProperty("token");
            this.sign = tempStorage.getProperty("sign");
        } catch (IOException e) {
            System.err.println("No se pudo cargar token/sign desde el almacenamiento temporal: " + e.getMessage());
        }
    }
}
