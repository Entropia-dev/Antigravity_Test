package com.inversiones.reporte.entity;

import java.math.BigDecimal;

public class ReporteGanancias {
    private Long inversionId;
    private String nombre;
    private BigDecimal cantidad;
    private BigDecimal precioCompra;
    private BigDecimal precioActual;
    private BigDecimal inversionTotal;
    private BigDecimal valorActual;
    private BigDecimal gananciaPerdida;
    private BigDecimal porcentaje;

    public ReporteGanancias() {}

    public Long getInversionId() { return inversionId; }
    public void setInversionId(Long inversionId) { this.inversionId = inversionId; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public BigDecimal getCantidad() { return cantidad; }
    public void setCantidad(BigDecimal cantidad) { this.cantidad = cantidad; }
    public BigDecimal getPrecioCompra() { return precioCompra; }
    public void setPrecioCompra(BigDecimal precioCompra) { this.precioCompra = precioCompra; }
    public BigDecimal getPrecioActual() { return precioActual; }
    public void setPrecioActual(BigDecimal precioActual) { this.precioActual = precioActual; }
    public BigDecimal getInversionTotal() { return inversionTotal; }
    public void setInversionTotal(BigDecimal inversionTotal) { this.inversionTotal = inversionTotal; }
    public BigDecimal getValorActual() { return valorActual; }
    public void setValorActual(BigDecimal valorActual) { this.valorActual = valorActual; }
    public BigDecimal getGananciaPerdida() { return gananciaPerdida; }
    public void setGananciaPerdida(BigDecimal gananciaPerdida) { this.gananciaPerdida = gananciaPerdida; }
    public BigDecimal getPorcentaje() { return porcentaje; }
    public void setPorcentaje(BigDecimal porcentaje) { this.porcentaje = porcentaje; }
}
