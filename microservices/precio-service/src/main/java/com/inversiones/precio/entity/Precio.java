package com.inversiones.precio.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "precios")
public class Precio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long inversionId;
    
    @Column(nullable = false)
    private BigDecimal precioActual;
    
    @Column(nullable = false)
    private LocalDate fecha;
    
    public Precio() {}

    public Precio(Long inversionId, BigDecimal precioActual, LocalDate fecha) {
        this.inversionId = inversionId;
        this.precioActual = precioActual;
        this.fecha = fecha;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getInversionId() { return inversionId; }
    public void setInversionId(Long inversionId) { this.inversionId = inversionId; }
    public BigDecimal getPrecioActual() { return precioActual; }
    public void setPrecioActual(BigDecimal precioActual) { this.precioActual = precioActual; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
}
