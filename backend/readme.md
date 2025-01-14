# Sistema Contable Backend

Generar clave privada
```bash
openssl genrsa -out MiClavePrivada.key 2048
```

Generar CSR
```bash
openssl req -new -key MiClavePrivada.key -subj "/C=AR/O=Empresa/CN=Sistema/serialNumber=CUIT nnnnnnnnnnn" -out MiPedidoCSR.csr
```

Nombre simbólico del DN: demo1
Almacenarlo como 'MiCertificado.pem'

Generar archivo pfx
```bash
openssl pkcs12 -export -inkey MiClavePrivada.key -in MiCertificado.pem -out MiCertificado.pfx
```
Password: demo1

Generar certificado p12
```bash
openssl pkcs12 -export -out MiCertificado.p12 -inkey MiClavePrivada.key -in MiCertificado.pem -certfile MiCertificado.pem
```

Referencias:

* [Documentación ARCA](https://www.afip.gob.ar/ws/documentacion/wsaa.asp)
* [Código QR](https://www.afip.gob.ar/fe/qr/ejemplo-de-comprobante.asp)