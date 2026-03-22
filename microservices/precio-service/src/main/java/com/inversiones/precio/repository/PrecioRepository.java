package com.inversiones.precio.repository;

import com.inversiones.precio.entity.Precio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PrecioRepository extends JpaRepository<Precio, Long> {
    List<Precio> findByInversionId(Long inversionId);
    List<Precio> findTopByInversionIdOrderByFechaDesc(Long inversionId);
}
