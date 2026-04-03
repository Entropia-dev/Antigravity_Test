import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Inversion, ReporteGanancias } from '../models/inversion.model';

@Injectable({ providedIn: 'root' })
export class InversionService {
  private STORAGE_KEY = 'inversiones_app_data';
  private inversionesSubject = new BehaviorSubject<Inversion[]>([]);
  private nextId = 1;
  private apiUrl = 'http://localhost:3000';
  
  private tipoCambioSubject = new BehaviorSubject<number>(1);
  private personalizadosSubject = new BehaviorSubject<any[]>([]);

  constructor(private http: HttpClient) {
    this.cargarDatos();
  }

  private cargarDatos() {
    this.http.get<any>(`${this.apiUrl}/api/load`).subscribe({
      next: (data) => {
        if (data && data.inversiones) {
          this.inversionesSubject.next(data.inversiones);
          this.nextId = data.nextId || 1;
          this.tipoCambioSubject.next(data.tipoCambioUSD || 1);
          this.personalizadosSubject.next(data.cedears_personalizados || []);
        } else {
          // Migración de localStorage si el backend está vacío
          const storedInv = localStorage.getItem(this.STORAGE_KEY);
          const storedBlue = localStorage.getItem('tipo_cambio_usd');
          const storedPers = localStorage.getItem('cedears_personalizados');
          
          if (storedInv) {
            const localData = JSON.parse(storedInv);
            this.inversionesSubject.next(localData.inversiones || []);
            this.nextId = localData.nextId || 1;
          }
          if (storedBlue) this.tipoCambioSubject.next(parseFloat(storedBlue));
          if (storedPers) this.personalizadosSubject.next(JSON.parse(storedPers));
          
          this.guardarDatos();
        }
      }
    });
  }

  private guardarDatos() {
    const data = {
      inversiones: this.inversionesSubject.value,
      nextId: this.nextId,
      tipoCambioUSD: this.tipoCambioSubject.value,
      cedears_personalizados: this.personalizadosSubject.value
    };
    this.http.post(`${this.apiUrl}/api/save`, data).subscribe();
  }

  getTipoCambio(): Observable<number> {
    return this.tipoCambioSubject.asObservable();
  }

  setTipoCambio(valor: number) {
    this.tipoCambioSubject.next(valor);
    this.guardarDatos();
  }

  getCedearsPersonalizados(): Observable<any[]> {
    return this.personalizadosSubject.asObservable();
  }

  setPersonalizados(lista: any[]) {
    this.personalizadosSubject.next(lista);
    this.guardarDatos();
  }

  getInversiones(): Observable<Inversion[]> {
    return this.inversionesSubject.asObservable();
  }

  getInversion(id: number): Observable<Inversion | undefined> {
    return new Observable(observer => {
      const inv = this.inversionesSubject.value.find(i => i.id === id);
      observer.next(inv);
      observer.complete();
    });
  }

  crearInversion(inversion: Inversion): Observable<Inversion> {
    return new Observable(observer => {
      const tipoCambio = this.tipoCambioSubject.value;
      const precioCompraUSD = tipoCambio > 0 ? (inversion.precioCompra / tipoCambio) : 0;
      
      const nueva: Inversion = {
        ...inversion,
        id: this.nextId++,
        precioCompraUSD: Math.round(precioCompraUSD * 100) / 100 // Dos decimales
      };
      
      const listaActual = [...this.inversionesSubject.value, nueva];
      this.inversionesSubject.next(listaActual);
      this.guardarDatos();
      observer.next(nueva);
      observer.complete();
    });
  }

  actualizarInversion(id: number, inversion: Inversion): Observable<Inversion> {
    return new Observable(observer => {
      const tipoCambio = this.tipoCambioSubject.value;
      const precioCompraUSD = tipoCambio > 0 ? (inversion.precioCompra / tipoCambio) : 0;
      
      const inversionActualizada = {
        ...inversion,
        id,
        precioCompraUSD: Math.round(precioCompraUSD * 100) / 100
      };
      
      const listaActual = this.inversionesSubject.value.map(i => 
        i.id === id ? inversionActualizada : i
      );
      
      this.inversionesSubject.next(listaActual);
      this.guardarDatos();
      observer.next(inversionActualizada);
      observer.complete();
    });
  }

  eliminarInversion(id: number): Observable<void> {
    return new Observable(observer => {
      const listaActual = this.inversionesSubject.value.filter(i => i.id !== id);
      this.inversionesSubject.next(listaActual);
      this.guardarDatos();
      observer.next();
      observer.complete();
    });
  }

  getReporte(inversion: Inversion, precioActual: number): Observable<ReporteGanancias> {
    return new Observable(observer => {
      const reporte: ReporteGanancias = {
        inversionId: inversion.id!,
        nombre: inversion.nombre,
        cantidad: inversion.cantidad,
        precioCompra: inversion.precioCompra,
        precioActual: precioActual,
        inversionTotal: inversion.cantidad * inversion.precioCompra,
        valorActual: inversion.cantidad * precioActual,
        gananciaPerdida: (inversion.cantidad * precioActual) - (inversion.cantidad * inversion.precioCompra),
        porcentaje: this.calcularPorcentaje(inversion.precioCompra, precioActual)
      };
      observer.next(reporte);
      observer.complete();
    });
  }

  private calcularPorcentaje(precioCompra: number, precioActual: number): number {
    if (precioCompra === 0) return 0;
    return Math.round(((precioActual - precioCompra) / precioCompra) * 10000) / 100;
  }

  getPreciosCedears(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/precios`);
  }

  refreshBackend(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/precios/refresh`);
  }

  getDolar(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/dolar`);
  }

  getTodosLosDolares(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/dolares/todos`);
  }

  getCriptoPrecios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/cripto`);
  }
}
