package com.chanochoca.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import java.util.HashSet;
import java.util.Set;

@Configuration
@EnableMethodSecurity
public class SecurityConfiguration {

    @Value("${okta.oauth2.issuer}")
    private String issuerUri;

    @Bean
    public SecurityFilterChain configure(HttpSecurity http) throws Exception {
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName(null);
        http.authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.POST, "/api/asientos-contables").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/asientos-contables/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/asientos-contables").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/asientos-contables/{id}").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/movimientos-contables").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/movimientos-contables/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/movimientos-contables").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/movimientos-contables/{id}").permitAll()

//                        .requestMatchers(HttpMethod.OPTIONS, "/api/cuentas").permitAll()
//                        .requestMatchers(HttpMethod.POST, "/api/cuentas").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cuentas/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cuentas").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/cuentas/{id}").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/cuentas/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cuentas/search").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/auth/get-authenticated-user").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/logout").permitAll()



//                        .requestMatchers("/api/auth/**").permitAll()
//                        .requestMatchers("/api/cuentas/**").permitAll()
//                        .requestMatchers("/api/clientes/**").permitAll()
//                        .requestMatchers("/api/asientos-contables/**").permitAll()
//                        .requestMatchers("/api/movimientos-contables/**").permitAll()

                        .requestMatchers(HttpMethod.GET, "assets/*").permitAll()
                        .anyRequest()
                        .authenticated())
                .csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(requestHandler))
                .oauth2Login(Customizer.withDefaults())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                .oauth2Client(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withJwkSetUri(issuerUri).build();
    }

    @Bean
    public GrantedAuthoritiesMapper userAuthoritiesMapper() {
        return authorities -> {
            Set<GrantedAuthority> grantedAuthorities = new HashSet<>();

            authorities.forEach(grantedAuthority -> {
                if (grantedAuthority instanceof OidcUserAuthority oidcUserAuthority) {
                    grantedAuthorities
                            .addAll(SecurityUtils.extractAuthorityFromClaims(oidcUserAuthority.getUserInfo().getClaims()));
                }
            });
            return grantedAuthorities;
        };
    }
}