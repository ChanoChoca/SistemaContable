package com.chanochoca.app.cuenta.service;

import com.chanochoca.app.cuenta.models.NewCuentaDTO;
import com.chanochoca.app.cuenta.models.entity.Cuenta;
import com.chanochoca.app.cuenta.repository.CuentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class CuentaServiceImpl implements CuentaService {

    private final CuentaRepository cuentaRepository;

    @Autowired
    public CuentaServiceImpl(CuentaRepository cuentaRepository) {
        this.cuentaRepository = cuentaRepository;
    }

    @Override
    @Transactional
    public Cuenta createCuenta(NewCuentaDTO newCuentaDTO) {
        Cuenta savedCuenta = new Cuenta();
        savedCuenta.setNombre(newCuentaDTO.getNombre());
        savedCuenta.setCodigo(newCuentaDTO.getCodigo());
        savedCuenta.setTipo(newCuentaDTO.getTipo());
        savedCuenta.setSaldoActual(newCuentaDTO.getSaldoActual());
        savedCuenta.setActiva(newCuentaDTO.isActiva());

        savedCuenta.setCuentaPadre(null);
        savedCuenta.setSubCuentas(null);

        cuentaRepository.save(savedCuenta);

        //El único dato ingresado de la relación posible es un padre.
        //TODO: Obtener el padre de la cuenta a crear (si es que se ha seleccionado padre)
        //TODO: Al padre agregar como subcuenta la cuenta a crear, y a la cuenta actual setear al padre
        //TODO: Agregar validación si el padre tiene saldo, no se permita crear la cuenta.

        setCuentaPadre(newCuentaDTO, savedCuenta);
//        setSubCuentas(newCuentaDTO, savedCuenta);

        cuentaRepository.save(savedCuenta);
        return savedCuenta;
    }

    private void setCuentaPadre(NewCuentaDTO newCuentaDTO, Cuenta savedCuenta) {
        if (newCuentaDTO.getCuentaPadre() != null) {
            Optional<Cuenta> cuentaPadreOpt = cuentaRepository.findById(newCuentaDTO.getCuentaPadre().getId());
            if (cuentaPadreOpt.isPresent()) {
                Cuenta cuentaPadre = cuentaPadreOpt.get();
                savedCuenta.setCuentaPadre(cuentaPadre);

                if (hasCyclicHierarchy(savedCuenta, cuentaPadre)) {
                    throw new IllegalArgumentException("Cyclic hierarchy detected");
                }

                if (cuentaPadre.getSaldoActual().compareTo(BigDecimal.ZERO) != 0) {
                    throw new IllegalArgumentException("No se puede seleccionar ese padre debido a que tiene saldo");
                }

                cuentaPadre.addSubCuenta(savedCuenta);
                cuentaRepository.save(cuentaPadre);
            } else {
                throw new IllegalArgumentException("Parent account not found");
            }
        }
    }

//    private void setSubCuentas(NewCuentaDTO newCuentaDTO, Cuenta savedCuenta) {
//        if (newCuentaDTO.getSubCuentas() != null && !newCuentaDTO.getSubCuentas().contains(null)) {
//            List<Cuenta> subCuentasPersistidas = new ArrayList<>();
//
//            for (Cuenta subCuenta : newCuentaDTO.getSubCuentas()) {
//                if (hasCyclicHierarchy(savedCuenta, subCuenta)) {
//                    throw new IllegalArgumentException("Cyclic hierarchy detected in subaccount");
//                }
//                Optional<Cuenta> subCuentaOpt = cuentaRepository.findById(subCuenta.getId());
//
//                if (subCuentaOpt.isPresent()) {
//                    Cuenta subCuentaExistente = subCuentaOpt.get();
//                    subCuentaExistente.setCuentaPadre(savedCuenta);
//                    subCuentasPersistidas.add(subCuentaExistente);
//
//                    cuentaRepository.save(subCuentaExistente);
//                } else {
//                    throw new IllegalArgumentException("Subaccount not found");
//                }
//            }
//
//            savedCuenta.setSubCuentas(subCuentasPersistidas);
//        }
//    }

    private boolean hasCyclicHierarchy(Cuenta cuenta, Cuenta potentialParent) {
        Cuenta current = potentialParent;
        while (current != null) {
            if (current.equals(cuenta)) {
                return true;
            }
            current = current.getCuentaPadre();
        }
        return false;
    }

    private boolean hasCyclicHierarchyInSubcuentas(Cuenta cuenta, List<Cuenta> subCuentas) {
        for (Cuenta subCuenta : subCuentas) {
            if (subCuenta != null && (subCuenta.equals(cuenta) || hasCyclicHierarchy(cuenta, subCuenta))) {
                return true;
            }
        }
        return false;
    }

    // Obtener cuenta por ID
    @Override
    public Cuenta obtenerCuentaPorId(Long id) {
        return cuentaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cuenta no encontrada con ID: " + id));
    }

    // Listar todas las cuentas
    @Override
    public List<Cuenta> obtenerTodasLasCuentas() {
        return (List<Cuenta>) cuentaRepository.findAll();
    }

    // Actualizar una cuenta existente
    @Override
    @Transactional
    public Cuenta actualizarCuenta(Long id, Cuenta cuenta) {
        Optional<Cuenta> existingCuenta = cuentaRepository.findById(id);
        if (existingCuenta.isPresent()) {
            Cuenta currentCuenta = existingCuenta.get(); //Cuenta de la BD

            updateCuentaPadre(currentCuenta, cuenta);
            updateSubCuentas(currentCuenta, cuenta);
            updateCuentaDetails(currentCuenta, cuenta);
            return cuentaRepository.save(currentCuenta);
        } else {
            throw new NoSuchElementException("Cuenta not found");
        }
    }

    private void updateCuentaPadre(Cuenta currentCuenta, Cuenta cuenta) {
        if (!Objects.equals(currentCuenta.getCuentaPadre(), cuenta.getCuentaPadre())) {
            Cuenta cuentaPadreAntigua = currentCuenta.getCuentaPadre(); //Cuenta padre de BD
            Cuenta cuentaPadreNueva = cuenta.getCuentaPadre(); //Nueva cuenta padre

            if (hasCyclicHierarchy(currentCuenta, cuentaPadreNueva)) {
                throw new IllegalArgumentException("Cyclic hierarchy detected");
            }

            //Si la cuenta padre de la cuenta anterior es null y la cuenta a modificar también: no hacer nada
            //Si la cuenta padre de la cuenta anterior es igual a la cuenta a modificar: no hacer nada
            if (cuentaPadreAntigua == null && cuentaPadreNueva == null
                    || cuentaPadreAntigua == cuentaPadreNueva) {
                return;
            }

            //Prevenir asignación de padre a si mismo
            if (cuentaPadreNueva != null && cuentaPadreNueva.getId().equals(currentCuenta.getId())) {
                throw new IllegalArgumentException("Una cuenta no puede ser su propio padre");
            }

            //Prevenir que la cuenta padre sea una de sus subcuentas
            if (cuentaPadreNueva != null && isSubCuenta(currentCuenta, cuentaPadreNueva)) {
                throw new IllegalArgumentException("La nueva cuenta padre no puede ser una de las subcuentas de la cuenta actual");
            }

            //Asegurar que la cuenta padre no tenga saldo
            if (cuentaPadreNueva != null && cuentaPadreNueva.getSaldoActual() != null
                    && cuentaPadreNueva.getSaldoActual().compareTo(BigDecimal.ZERO) != 0) {
                throw new IllegalArgumentException("La cuenta padre seleccionada debe tener un saldo de 0");
            }

//            // Validar que la cuenta padre sea del mismo tipo
//            if (cuentaPadreNueva != null && !cuentaPadreNueva.getTipo().equals(currentCuenta.getTipo())) {
//                throw new IllegalArgumentException("La cuenta padre debe ser del mismo tipo que la cuenta actual");
//            }

//            // Validar que la cuenta padre esté activa
//            if (cuentaPadreNueva != null && !cuentaPadreNueva.isActiva()) {
//                throw new IllegalArgumentException("La cuenta padre seleccionada debe estar activa");
//            }

            //Si la cuenta nueva es distinto de la cuenta padre:
            //- Verificar que el padre viejo sea distinto de null, para luego deasociar la cuenta de la bd
            //- Verificar que el padre nuevo sea distinto de null, para luego asociar la nueva cuenta
            if (cuentaPadreAntigua != null) {
                cuentaPadreAntigua.removeSubCuenta(currentCuenta);
                cuentaRepository.save(cuentaPadreAntigua);
            }

            if (cuentaPadreNueva != null) {
                cuentaPadreNueva.addSubCuenta(cuenta);
                cuentaRepository.save(cuentaPadreNueva);
            }
        }
    }

    private boolean isSubCuenta(Cuenta cuenta, Cuenta posiblePadre) {
        // Realizar una búsqueda recursiva para verificar si "posiblePadre" está en la jerarquía de subcuentas de "cuenta"
        if (cuenta.getSubCuentas() == null || cuenta.getSubCuentas().isEmpty()) {
            return false;
        }

        for (Cuenta subCuenta : cuenta.getSubCuentas()) {
            if (subCuenta.getId().equals(posiblePadre.getId()) || isSubCuenta(subCuenta, posiblePadre)) {
                return true;
            }
        }

        return false;
    }

    private void updateSubCuentas(Cuenta currentCuenta, Cuenta cuenta) {
        // Obtener el nuevo código de la cuenta actualizada
        boolean nuevoCodigo = cuenta.isActiva();

        // Actualizar las subcuentas
        for (Cuenta subCuenta : currentCuenta.getSubCuentas()) {
            // Actualizar el código de la subCuenta
            subCuenta.setActiva(nuevoCodigo);
            cuentaRepository.save(subCuenta);

            // Actualizar recursivamente las subcuentas de esta subCuenta
            updateSubCuentas(subCuenta, subCuenta);
        }
    }

    private void updateCuentaDetails(Cuenta currentCuenta, Cuenta cuenta) {
        currentCuenta.setNombre(cuenta.getNombre());
        currentCuenta.setCodigo(cuenta.getCodigo());
        currentCuenta.setTipo(cuenta.getTipo());
        currentCuenta.setSaldoActual(cuenta.getSaldoActual());
        currentCuenta.setCuentaPadre(cuenta.getCuentaPadre());
        currentCuenta.setSubCuentas(cuenta.getSubCuentas());
        currentCuenta.setActiva(cuenta.isActiva());
    }

    // Eliminar una cuenta por ID
    @Override
    @Transactional
    public void eliminarCuenta(Long id) {
        if (cuentaRepository.existsById(id)) {
            cuentaRepository.deleteById(id);
        } else {
            throw new RuntimeException("No se pudo encontrar la cuenta con ID: " + id);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Cuenta> getAccountTree(int page, int size, String nombre) {
        Pageable pageable = PageRequest.of(page, size);
        return cuentaRepository.findByNombreContainingAndCuentaPadreIsNull(nombre, pageable);
    }

    @Override
    public Cuenta deactivateCuenta(Long id) {
        // Buscar la cuenta raíz
        Cuenta cuenta = cuentaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cuenta no encontrada"));

        // Llamar a un método recursivo para desactivar la cuenta y sus subcuentas
        deactivateCuentaRecursively(cuenta);

        // Guardar la cuenta raíz (que ya incluye todas las modificaciones)
        return cuentaRepository.save(cuenta);
    }

    private void deactivateCuentaRecursively(Cuenta cuenta) {
        // Marcar la cuenta actual como inactiva
        cuenta.setActiva(false);
        cuentaRepository.save(cuenta);

        // Si tiene subcuentas, iterar y desactivarlas también
        for (Cuenta subCuenta : cuenta.getSubCuentas()) {
            deactivateCuentaRecursively(subCuenta);
        }
    }

    @Override
    public void updateSaldoCuenta(Long id, Long saldo) {
        Cuenta cuenta = cuentaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cuenta no encontrada"));

        // Convertir saldo de Long a BigDecimal
        BigDecimal saldoBigDecimal = BigDecimal.valueOf(saldo);

        // Actualizar el saldo en la cuenta
        cuenta.setSaldoActual(saldoBigDecimal);

        // Guardar la cuenta con el saldo actualizado
        cuentaRepository.save(cuenta);
    }

    @Override
    public Optional<Cuenta> obtenerCuentaPorCodigo(String codigo) {
        return cuentaRepository.findByCodigo(codigo);
    }
}
