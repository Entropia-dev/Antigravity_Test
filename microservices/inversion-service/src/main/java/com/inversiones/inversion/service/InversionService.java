package com.inversiones.inversion.service;

import com.inversiones.inversion.entity.Inversion;
import com.inversiones.inversion.repository.InversionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InversionService {
    @Autowired
    private InversionRepository repository;

    public List<Inversion> findAll() {
        return repository.findAll();
    }

    public Optional<Inversion> findById(Long id) {
        return repository.findById(id);
    }

    public Inversion save(Inversion inversion) {
        return repository.save(inversion);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
