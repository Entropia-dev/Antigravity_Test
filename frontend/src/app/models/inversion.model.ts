export interface Inversion {
  id?: number;
  nombre: string;
  tipo: string;
  cantidad: number;
  precioCompra: number;
  precioCompraUSD?: number;
  fechaCompra: string;
  observaciones?: string;
  estado?: 'ACTIVA' | 'VENDIDA';
  fechaVenta?: string;
}

export interface Precio {
  id?: number;
  inversionId: number;
  precioActual: number;
  fecha: string;
}

export interface ReporteGanancias {
  inversionId: number;
  nombre: string;
  cantidad: number;
  precioCompra: number;
  precioActual: number;
  inversionTotal: number;
  valorActual: number;
  gananciaPerdida: number;
  porcentaje: number;
}
