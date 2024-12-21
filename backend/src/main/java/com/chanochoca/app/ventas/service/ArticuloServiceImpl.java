package com.chanochoca.app.ventas.service;

import com.chanochoca.app.cuenta.models.entity.Cuenta;
import com.chanochoca.app.ventas.models.entity.Articulos;
import com.chanochoca.app.ventas.repository.ArticulosRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class ArticuloServiceImpl implements ArticuloService {

    private final ArticulosRepository articulosRepository;

    public ArticuloServiceImpl(ArticulosRepository articulosRepository) {
        this.articulosRepository = articulosRepository;
    }

    @Override
    public Articulos createArticulo(Articulos articulo) {
        return articulosRepository.save(articulo);
    }

    @Override
    public List<Articulos> getArticulos() {
        return (List<Articulos>) articulosRepository.findAll();
    }

    @Override
    public Articulos getArticuloById(Long id) {
        Optional<Articulos> articulo = articulosRepository.findById(id);
        return articulo.orElse(null);
    }

    @Override
    public Articulos updateArticulo(Long id, Articulos articulo) {
        Optional<Articulos> articuloBd = articulosRepository.findById(id);
        if (articuloBd.isPresent()) {
            Articulos articuloAux = articuloBd.get();
            articuloAux.setPrecioUnitario(articulo.getPrecioUnitario());
            articuloAux.setStockActual(articulo.getStockActual());
            return articulosRepository.save(articuloAux);
        } else {
            throw new NoSuchElementException("Articulo not found");
        }
    }

    @Override
    public boolean existsByNombre(String nombre) {
        return articulosRepository.existsByNombre(nombre);
    }
}
