package com.inversiones.precio.controller;

import com.inversiones.precio.entity.Precio;
import com.inversiones.precio.service.PrecioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/precios")
public class PrecioController {
    @Autowired
    private PrecioService service;

    @GetMapping
    public List<Precio> listar() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Precio> obtener(@PathVariable Long id) {
        return service.findAll().stream()
                .filter(p -> p.getId().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/inversion/{inversionId}")
    public List<Precio> porInversion(@PathVariable Long inversionId) {
        return service.findByInversionId(inversionId);
    }

    @PostMapping
    public Precio crear(@RequestBody Precio precio) {
        return service.save(precio);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
