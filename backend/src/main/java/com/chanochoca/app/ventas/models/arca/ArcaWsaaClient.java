package com.chanochoca.app.ventas.models.arca;

import java.io.FileInputStream;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.Security;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.GregorianCalendar;
import javax.xml.datatype.DatatypeFactory;
import javax.xml.datatype.XMLGregorianCalendar;
import java.util.Base64;
import org.bouncycastle.cms.CMSProcessableByteArray;
import org.bouncycastle.cms.CMSSignedData;
import org.bouncycastle.cms.CMSSignedDataGenerator;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.operator.ContentSigner;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;
import org.bouncycastle.operator.jcajce.JcaDigestCalculatorProviderBuilder;
import org.bouncycastle.cert.jcajce.JcaCertStore;
import org.bouncycastle.cert.jcajce.JcaX509CertificateHolder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;

public class ArcaWsaaClient {

    public static String invokeWsaa(byte[] loginTicketRequestCms, String endpoint) throws Exception {
        String encodedRequest = Base64.getEncoder().encodeToString(loginTicketRequestCms);

        // Construir el mensaje SOAP
        String soapMessage = """
        <?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="https://wsaa.afip.gov.ar/ws/services/LoginCms">
            <soapenv:Header/>
            <soapenv:Body>
                <ser:loginCms>
                    <ser:in0>%s</ser:in0>
                </ser:loginCms>
            </soapenv:Body>
        </soapenv:Envelope>
        """.formatted(encodedRequest);

        // Configurar el cliente HTTP y enviar la solicitud
        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(endpoint))
                .header("Content-Type", "text/xml; charset=UTF-8")
                .header("SOAPAction", "\"\"") // SOAPAction requerida, puede ser vacío
                .POST(HttpRequest.BodyPublishers.ofString(soapMessage))
                .build();


        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body().trim();
    }

    public static byte[] createCms(String p12file, String p12pass, String signerAlias, String destinationDN, String service, long ticketTimeMillis) throws Exception {
        Security.addProvider(new BouncyCastleProvider());

        // Load keystore
        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        try (FileInputStream fis = new FileInputStream(p12file)) {
            keyStore.load(fis, p12pass.toCharArray());
        }

        PrivateKey privateKey = (PrivateKey) keyStore.getKey(signerAlias, p12pass.toCharArray());
        X509Certificate certificate = (X509Certificate) keyStore.getCertificate(signerAlias);

        List<Certificate> certList = new ArrayList<>();
        certList.add(certificate);

        // Create CMSSignedDataGenerator
        CMSSignedDataGenerator generator = new CMSSignedDataGenerator();
        ContentSigner contentSigner = new JcaContentSignerBuilder("SHA256withRSA")
                .setProvider("BC")
                .build(privateKey);

        generator.addSignerInfoGenerator(
                new org.bouncycastle.cms.jcajce.JcaSignerInfoGeneratorBuilder(
                        new JcaDigestCalculatorProviderBuilder().setProvider("BC").build())
                        .build(contentSigner, new JcaX509CertificateHolder(certificate)));

        generator.addCertificates(new JcaCertStore(certList));

        // Generate Login Ticket Request XML
        String loginTicketRequestXml = createLoginTicketRequest(
                certificate.getSubjectDN().getName(), destinationDN, service, ticketTimeMillis);

        CMSSignedData signedData = generator.generate(
                new CMSProcessableByteArray(loginTicketRequestXml.getBytes()), true);

        return signedData.getEncoded();
    }

    public static String createLoginTicketRequest(String signerDN, String destinationDN, String service, long ticketTimeMillis) throws Exception {
        GregorianCalendar generationTime = new GregorianCalendar();
        GregorianCalendar expirationTime = new GregorianCalendar();
        expirationTime.setTime(new Date(System.currentTimeMillis() + ticketTimeMillis));

        XMLGregorianCalendar xmlGenerationTime = DatatypeFactory.newInstance().newXMLGregorianCalendar(generationTime);
        XMLGregorianCalendar xmlExpirationTime = DatatypeFactory.newInstance().newXMLGregorianCalendar(expirationTime);

        String uniqueId = String.valueOf(System.currentTimeMillis() / 1000);

        return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
                "<loginTicketRequest version=\"1.0\">" +
                "<header>" +
                "<source>" + signerDN + "</source>" +
                "<destination>" + destinationDN + "</destination>" +
                "<uniqueId>" + uniqueId + "</uniqueId>" +
                "<generationTime>" + xmlGenerationTime + "</generationTime>" +
                "<expirationTime>" + xmlExpirationTime + "</expirationTime>" +
                "</header>" +
                "<service>" + service + "</service>" +
                "</loginTicketRequest>";
    }
}
