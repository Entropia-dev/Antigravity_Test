package com.inversiones.precio.service;

import com.inversiones.precio.entity.Precio;
import com.inversiones.precio.repository.PrecioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrecioService {
    @Autowired
    private PrecioRepository repository;

    public List<Precio> findAll() {
        return repository.findAll();
    }

    public List<Precio> findByInversionId(Long inversionId) {
        return repository.findByInversionId(inversionId);
    }

    public Precio save(Precio precio) {
        return repository.save(precio);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
