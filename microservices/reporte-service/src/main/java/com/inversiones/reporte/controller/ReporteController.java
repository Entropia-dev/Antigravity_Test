package com.inversiones.reporte.controller;

import com.inversiones.reporte.entity.ReporteGanancias;
import com.inversiones.reporte.service.ReporteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {
    @Autowired
    private ReporteService service;

    @GetMapping("/ganancias")
    public ReporteGanancias calcularGanancias(
            @RequestParam Long inversionId,
            @RequestParam String nombre,
            @RequestParam BigDecimal cantidad,
            @RequestParam BigDecimal precioCompra,
            @RequestParam BigDecimal precioActual) {
        return service.calcularGanancias(inversionId, nombre, cantidad, precioCompra, precioActual);
    }
}
