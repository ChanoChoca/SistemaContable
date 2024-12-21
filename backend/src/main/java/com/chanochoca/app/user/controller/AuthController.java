package com.chanochoca.app.user.controller;

import com.chanochoca.app.user.models.entity.User;
import com.chanochoca.app.user.service.UserService;
import com.chanochoca.app.user.models.ReadUserDTO;
import com.chanochoca.app.ventas.models.entity.Cuotas;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.text.MessageFormat;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    private final ClientRegistration registration;

    public AuthController(UserService userService, ClientRegistrationRepository registration) {
        this.userService = userService;
        this.registration = registration.findByRegistrationId("okta");
    }

    @GetMapping("/get-authenticated-user")
    public ResponseEntity<ReadUserDTO> getAuthenticatedUser(
            @AuthenticationPrincipal OAuth2User user, @RequestParam boolean forceResync) {
        if(user == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
            userService.syncWithIdp(user, forceResync);
            ReadUserDTO connectedUser = userService.getAuthenticatedUserFromSecurityContext();
            return new ResponseEntity<>(connectedUser, HttpStatus.OK);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        String issuerUri = registration.getProviderDetails().getIssuerUri();
        String originUrl = request.getHeader(HttpHeaders.ORIGIN);
        Object[] params = {issuerUri, registration.getClientId(), originUrl};
        String logoutUrl = MessageFormat.format("{0}v2/logout?client_id={1}&returnTo={2}", params);
        request.getSession().invalidate();
        return ResponseEntity.ok().body(Map.of("logoutUrl", logoutUrl));
    }

    @PutMapping("/balance")
    private ResponseEntity<User> updateBalance(@RequestBody Map<String, Object> balanceData) {
        // Extraer los valores desde el mapa
        String email = String.valueOf(balanceData.get("email"));  // El email ya es un String
        BigDecimal saldoBanco = BigDecimal.valueOf(Double.parseDouble(balanceData.get("saldoBanco").toString()));
        BigDecimal saldoCuenta = BigDecimal.valueOf(Double.parseDouble(balanceData.get("saldoCuenta").toString()));
        BigDecimal limite = BigDecimal.valueOf(Double.parseDouble(balanceData.get("limite").toString()));

        // Lógica para encontrar el usuario por email y actualizar los saldos
        User user = userService.getUserByEmail(email);  // Mejor utilizar Optional

        user.setSaldoBanco(saldoBanco);
        user.setSaldoCuenta(saldoCuenta);
        user.setLimite(limite);

        // Actualizar el usuario en la base de datos
        User userUpdated = userService.update(user);

        System.out.println("Usuario con el saldo anterior (banco, cuenta, limite): " + user.getSaldoBanco() + " " + user.getSaldoCuenta() + " " + user.getLimite());
        System.out.println("Usuario con el saldo posterior (banco, cuenta, limite): " + userUpdated.getSaldoBanco() + " " + userUpdated.getSaldoCuenta() + " " + userUpdated.getLimite());

        return ResponseEntity.ok().body(userUpdated);  // Respuesta con el usuario actualizado
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAll();
        return ResponseEntity.ok().body(users);
    }

    @GetMapping("/email")
    public ResponseEntity<User> getCuentasByClient(@RequestParam String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }
}
