package com.chanochoca.app.cuenta.controller;

import com.chanochoca.app.contable.models.entity.AsientoContable;
import com.chanochoca.app.contable.models.entity.MovimientoContable;
import com.chanochoca.app.contable.repository.AsientoContableRepository;
import com.chanochoca.app.contable.repository.MovimientoContableRepository;
import com.chanochoca.app.cuenta.models.NewCuentaDTO;
import com.chanochoca.app.cuenta.models.entity.Cuenta;
import com.chanochoca.app.cuenta.service.CuentaService;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/cuentas")
public class CuentaController {

    private final CuentaService cuentaService;
    private final MovimientoContableRepository movimientoContableRepository;
    private final AsientoContableRepository asientoContableRepository;

    public CuentaController(CuentaService cuentaService, MovimientoContableRepository movimientoContableRepository, AsientoContableRepository asientoContableRepository) {
        this.cuentaService = cuentaService;
        this.movimientoContableRepository = movimientoContableRepository;
        this.asientoContableRepository = asientoContableRepository;
    }

    @PostMapping
    public ResponseEntity<Cuenta> createCuenta(@Valid @RequestBody NewCuentaDTO newCuentaDTO) {
        try {
            Cuenta savedCuenta = cuentaService.createCuenta(newCuentaDTO);
            return ResponseEntity.ok(savedCuenta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<Cuenta> getCuentaById(@PathVariable Long id) {
        Optional<Cuenta> cuenta = cuentaService.findById(id);
        return cuenta.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<Page<Cuenta>> getAllCuentas(@RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "1") int size,
                                                      @RequestParam(defaultValue = "") String nombre) {
        Page<Cuenta> cuentas = cuentaService.findAll(page, size, nombre);

        return ResponseEntity.ok(cuentas);
    }

    @GetMapping("/cuentas-sin-paginado")
    public ResponseEntity<List<Cuenta>> getAllCuentas() {
        List<Cuenta> cuentas = cuentaService.findCuentasSinPaginado();
        return ResponseEntity.ok(cuentas);
    }

    private boolean hasCyclicHierarchy(Cuenta cuenta, Cuenta potentialParent) {
        Cuenta current = potentialParent;
        while (current != null) {
            if (current.equals(cuenta)) {
                return true; // Se ha detectado un ciclo
            }
            current = current.getCuentaPadre();
        }
        return false;
    }

    private boolean hasCyclicHierarchyInSubcuentas(Cuenta cuenta, List<Cuenta> subCuentas) {
        for (Cuenta subCuenta : subCuentas) {
            if (subCuenta != null && (subCuenta.equals(cuenta) || hasCyclicHierarchy(cuenta, subCuenta))) {
                return true; // Se ha detectado un ciclo
            }
        }
        return false;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cuenta> updateCuenta(@PathVariable Long id, @RequestBody Cuenta cuenta) {
        Optional<Cuenta> existingCuenta = cuentaService.findById(id);
        if (existingCuenta.isPresent()) {
            Cuenta currentCuenta = existingCuenta.get();

            // Comparar y actualizar la cuenta padre si es necesario
            if (!Objects.equals(currentCuenta.getCuentaPadre(), cuenta.getCuentaPadre())) {

                Cuenta cuentaPadreAntigua = currentCuenta.getCuentaPadre();
                Cuenta cuentaPadreNueva = cuenta.getCuentaPadre();

                // Verificar si hay un ciclo en la jerarquía
                if (hasCyclicHierarchy(currentCuenta, cuentaPadreNueva)) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // O devuelve un mensaje de error personalizado
                }

                if (cuentaPadreAntigua != null) {
                    // Desvincular la cuenta actual de la cuenta padre antigua
                    cuentaPadreAntigua.removeSubCuenta(currentCuenta);
                    cuentaService.save(cuentaPadreAntigua);
                }

                if (cuentaPadreNueva != null) {
                    // Vincular la cuenta actual a la nueva cuenta padre
                    cuentaPadreNueva.addSubCuenta(cuenta);
                    cuentaService.save(cuentaPadreNueva);
                }
            }

            // Comparar y actualizar las subcuentas si es necesario
            if (!Objects.equals(currentCuenta.getSubCuentas(), cuenta.getSubCuentas())) {
                // Desvincular subcuentas antiguas
                if (currentCuenta.getSubCuentas() != null) {
                    // Verificar si alguna subcuenta nueva provoca un ciclo
                    if (hasCyclicHierarchyInSubcuentas(currentCuenta, cuenta.getSubCuentas())) {
                        return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // O un mensaje de error personalizado
                    }

                    for (Cuenta subCuenta : currentCuenta.getSubCuentas()) {
                        if (subCuenta != null) {
                            subCuenta.setCuentaPadre(null);
                            cuentaService.save(subCuenta);
                        }
                    }
                }

                // Vincular nuevas subcuentas
                if (cuenta.getSubCuentas() != null) {
                    for (Cuenta subCuenta : cuenta.getSubCuentas()) {
                        if (subCuenta != null) {
                            subCuenta.setCuentaPadre(cuenta);
                            cuentaService.save(subCuenta);
                        }
                    }
                }
            }

            currentCuenta.setNombre(cuenta.getNombre());
            currentCuenta.setCodigo(cuenta.getCodigo());
            currentCuenta.setSaldo(cuenta.getSaldo());
            currentCuenta.setCuentaPadre(cuenta.getCuentaPadre());
            currentCuenta.setSubCuentas(cuenta.getSubCuentas());
            currentCuenta.setActiva(cuenta.isActiva());
            currentCuenta.setEliminada(cuenta.isEliminada());

            cuentaService.save(currentCuenta);

            return new ResponseEntity<>(currentCuenta, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCuenta(@PathVariable Long id) {

        // Verificar si la cuenta tiene padre y tiene subcuentas
        Optional<Cuenta> cuentaOptional = cuentaService.findById(id);

        List<MovimientoContable> movimientosAEliminar = movimientoContableRepository.findByCuenta_Id(id);
        for (MovimientoContable movimiento : movimientosAEliminar) {
            if (movimiento.getId() == null) {
                continue; // El movimiento ya no existe o no está asociado correctamente
            }

            AsientoContable asiento = movimiento.getAsiento();
            asiento.removeMovimiento(movimiento);
            asientoContableRepository.save(asiento);

            movimiento.setCuenta(null);
            movimiento.setAsiento(null);
            movimientoContableRepository.save(movimiento);
            movimientoContableRepository.delete(movimiento);
        }

        if (cuentaOptional.isPresent()) {
            Cuenta cuentaAEliminar = cuentaOptional.get();

            if (cuentaAEliminar.getCuentaPadre() != null) {
                Cuenta cuentaPadre = cuentaAEliminar.getCuentaPadre();

                if (cuentaAEliminar.getSubCuentas() != null && !cuentaAEliminar.getSubCuentas().isEmpty()) {
                    for (Cuenta subCuenta : cuentaAEliminar.getSubCuentas()) {
                        subCuenta.setCuentaPadre(cuentaPadre);
                        cuentaService.save(subCuenta); // Persistir los cambios
                        cuentaPadre.addSubCuenta(subCuenta); // Agregar la subcuenta al padre
                    }
                    cuentaService.save(cuentaPadre); // Persistir el padre actualizado
                } else {
                    //Tiene cuenta padre pero no subcuentas
                    cuentaPadre.removeSubCuenta(cuentaAEliminar);
                    cuentaService.save(cuentaPadre);
                }
            } else if (cuentaAEliminar.getSubCuentas() != null && !cuentaAEliminar.getSubCuentas().isEmpty()) {
                for (Cuenta subCuenta : cuentaAEliminar.getSubCuentas()) {
                    subCuenta.setCuentaPadre(null);
                    cuentaService.save(subCuenta);
                }
            }
            cuentaService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // Manejar el caso en que la cuenta no se encuentra
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Cuenta>> getCuentasByNombre(@RequestParam String nombre) {
        List<Cuenta> cuentas = cuentaService.findByNombre(nombre);
        return new ResponseEntity<>(cuentas, HttpStatus.OK);
    }

    @GetMapping("/tree")
    public ResponseEntity<Page<Cuenta>> getAccountTree(@RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "1") int size,
                                                       @RequestParam(defaultValue = "") String nombre) {

        Page<Cuenta> accountTree = cuentaService.getAccountTree(page, size, nombre);
        return ResponseEntity.ok(accountTree);
    }
}
