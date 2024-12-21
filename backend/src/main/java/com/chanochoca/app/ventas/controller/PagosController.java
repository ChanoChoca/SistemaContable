package com.chanochoca.app.ventas.controller;

import com.chanochoca.app.ventas.models.NewPagoDTO;
import com.chanochoca.app.ventas.models.entity.Pagos;
import com.chanochoca.app.ventas.service.PagosService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/api/pagos")
public class PagosController {

    private final PagosService pagosService;

    public PagosController(PagosService pagosService) {
        this.pagosService = pagosService;
    }

    @GetMapping
    public ResponseEntity<List<Pagos>> getPagos() {
        return ResponseEntity.ok().body(pagosService.findAll());
    }

    @PostMapping
    public ResponseEntity<List<Pagos>> createPagos(@RequestBody List<NewPagoDTO> pagos) {
        System.out.println("Petición recibida controlador");
        return new ResponseEntity<>(pagosService.createPagos(pagos), HttpStatus.CREATED);
    }
}
