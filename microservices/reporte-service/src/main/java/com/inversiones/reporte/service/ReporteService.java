package com.inversiones.reporte.service;

import com.inversiones.reporte.entity.ReporteGanancias;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class ReporteService {

    public ReporteGanancias calcularGanancias(Long inversionId, String nombre, BigDecimal cantidad, 
            BigDecimal precioCompra, BigDecimal precioActual) {
        ReporteGanancias reporte = new ReporteGanancias();
        reporte.setInversionId(inversionId);
        reporte.setNombre(nombre);
        reporte.setCantidad(cantidad);
        reporte.setPrecioCompra(precioCompra);
        reporte.setPrecioActual(precioActual);

        BigDecimal inversionTotal = cantidad.multiply(precioCompra);
        BigDecimal valorActual = cantidad.multiply(precioActual);
        BigDecimal gananciaPerdida = valorActual.subtract(inversionTotal);
        
        BigDecimal porcentaje = BigDecimal.ZERO;
        if (inversionTotal.compareTo(BigDecimal.ZERO) > 0) {
            porcentaje = gananciaPerdida.divide(inversionTotal, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        reporte.setInversionTotal(inversionTotal);
        reporte.setValorActual(valorActual);
        reporte.setGananciaPerdida(gananciaPerdida);
        reporte.setPorcentaje(porcentaje);

        return reporte;
    }
}
