package com.inversiones.inversion.controller;

import com.inversiones.inversion.entity.Inversion;
import com.inversiones.inversion.service.InversionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inversiones")
public class InversionController {
    @Autowired
    private InversionService service;

    @GetMapping
    public List<Inversion> listar() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inversion> obtener(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Inversion crear(@RequestBody Inversion inversion) {
        return service.save(inversion);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inversion> actualizar(@PathVariable Long id, @RequestBody Inversion inversion) {
        return service.findById(id).map(existente -> {
            existente.setNombre(inversion.getNombre());
            existente.setTipo(inversion.getTipo());
            existente.setCantidad(inversion.getCantidad());
            existente.setPrecioCompra(inversion.getPrecioCompra());
            existente.setFechaCompra(inversion.getFechaCompra());
            existente.setObservaciones(inversion.getObservaciones());
            return ResponseEntity.ok(service.save(existente));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
