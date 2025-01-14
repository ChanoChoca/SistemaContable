# Sistema Contable App

[Documentación](Documentación.pdf)

## Consigna
Ud forma parte del equipo abocado al desarrollo de un sistema contable de una empresa
ficticia, con estructura, empleados y áreas creadas solo a fin de realizar todas las actividades
que el trabajo práctico requiere. Si lo desean, pueden trabajar con una organización real que
oficie de cliente del equipo de desarrollo, corriendo por responsabilidad del grupo el contacto
con la misma.

El resultado final será un sistema contable, de arquitectura, plataforma, lenguaje y motor de
base de datos de libre elección. Además, deberá estar acompañado de la documentación
correspondiente, que incluye:
* Descripción de las tecnologías utilizadas
* Diagramas de componentes
* Diagramas de Entidad-Relación de la base de datos
* Capturas y descripciones de todos los formularios utilizados 

## Requerimientos mínimos de alto nivel
### Login de usuarios
El mismo deberá contar como mínimo con usuario y contraseña para la autenticación del
usuario. No hay requerimientos sobre nivel seguridad de la contraseña ni formato del nombre de usuario, quedando a libre elección ambos aspectos. Tampoco se requiere la opción de
recuperar contraseña, ni el autorregistro de nuevos usuarios.

Adicionales sugeridos:
* Alta y baja de usuarios (solo por el usuario administrador) 

### Tareas y restricciones por roles de usuario
Al menos deberán existir dos tipos de usuarios, un administrador que tenga permisos de
realizar todas las acciones disponibles en el sistema, y un usuario al que se le permita el uso de
algunas funcionalidades del sistema. El esquema de perfiles/roles deberá ser lo
suficientemente flexible para que permita en el futuro agregar nuevos tipos de usuarios (los
mismos aparecerán en función del sistema desarrollado en el trabajo integrador Nº2)
### Administración del plan de cuentas
El plan de cuentas podrá ser visualizado por cualquier usuario, pero solo el administrador
podrá agregar y eliminar nuevas cuentas y modificar algunos atributos de una cuenta. Se debe
tener presente, que la eliminación de manera física o lógica de la cuenta va a depender de si
fue usada en algun asiento. Por la misma condición se determinarán los campos objeto de una
posible modificación.

Adicionales sugeridos:
* El plan de cuentas es una estructura lógica con forma de árbol, por lo cual su
visualización para operar con el mismo puede estar representada de esta manera.
### Registro de asientos contables
El registro de asientos es la funcionalidad núcleo del sistema contable. El mismo registrará
todos los hechos económicos de interés de forma permanente, utilizando la técnica de la
partida doble.

Adicionales sugeridos:
* Por cada asiento registrado, se puede registrar a modo de auditoría quien fue el
usuario que lo realizo. Esa información puede ser mostrada a quién posea los permisos
necesarios, en una funcionalidad aparte del sistema.
Reporte de libro diario
El reporte del libro diario permitirá ver todos los asientos registrados y su información entre
dos fechas dadas.

Adicionales sugeridos:
* Impresión en PDF del informe. 
### Reporte de libro mayor
* El reporte del libro mayor permitirá ver todos los asientos registrados y su información para
una cuenta específica entre dos fechas dadas.

Adicionales sugeridos:
* Impresión en PDF del informe.

## Requerimientos mínimos de alto nivel
### Ventas
* Facturación (impresión de facturas)
* Administración de clientes
* Administración de stock
* Manejo de método de costeo
* Informe de ventas

## Requerimientos opcionales
### Ventas
* Facturación electrónica
* Módulo de cobranzas
  * Cobros
  * Resumen de cuenta corriente de clientes