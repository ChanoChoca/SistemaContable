package com.chanochoca.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Configuración de la base de datos para la aplicación Airbnb.
 * Esta clase habilita varias características de Spring Data JPA y otras configuraciones relacionadas con la base de datos.
 */
@Configuration
@EnableJpaRepositories({
        "com.chanochoca.app.user.repository",
        "com.chanochoca.app.contable.repository",
        "com.chanochoca.app.cuenta.repository",
        "com.chanochoca.app.ventas.repository"
})
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
// Habilita el soporte de Spring Data Web para la paginación y serialización de DTOs.
@EnableTransactionManagement // Habilita el manejo de transacciones en la aplicación.
@EnableJpaAuditing // Habilita la auditoría JPA para rastrear automáticamente las entidades creadas y modificadas.
public class DatabaseConfiguration {
}
