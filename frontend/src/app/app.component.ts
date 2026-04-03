import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { InversionService } from './services/inversion.service';
import { Inversion, ReporteGanancias } from './models/inversion.model';

declare var Chart: any;

interface Cedear {
  simbolo: string;
  nombre: string;
  precioARS: number;
  variacion: number;
  ultimoUpdate: string;
  categoria: string;
  personalizado?: boolean;
}

interface NuevoCedear {
  simbolo: string;
  nombre: string;
  precioARS: number;
  variacion: number;
}

interface Cripto {
  id: string;
  simbolo: string;
  nombre: string;
  precioUSD: number;
  precioARS: number;
  variacion24h: number;
  fuente: string;
  ultimoUpdate: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.96)', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1 }),
        animate('0.6s cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        style({ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2 }),
        animate('0.5s cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'scale(1.04)' }))
      ])
    ])
  ],
  template: `
    <div class="landing" *ngIf="!mostrarApp" [@fadeInOut]>
      <div class="landing-bg"></div>
      
      <div class="landing-content">
        <div class="logo-icon">
          <svg class="bitcoin-anim" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="16" fill="#f7931a"/>
            <path fill="#fff" d="M21.78 15.37c.39-2.58-1.55-3.96-4.14-4.85l.84-3.38-2.06-.51-.82 3.3c-.54-.13-1.09-.26-1.63-.39l.82-3.32-2.06-.51-.83 3.36c-.45-.11-.88-.22-1.31-.34l.01-.06-2.85-.71-.55 2.21s1.53.35 1.5.38c.84.21.99.76.96 1.19l-1.93 7.74c-.05.11-.16.29-.41.22.03.03-1.53-.38-1.53-.38l-1.04 2.42 2.68.67c.5.12 1.01.26 1.51.38l-.84 3.39 2.06.51.83-3.34c.56.15 1.1.28 1.63.4l-.83 3.33 2.06.52.85-3.41c2.94.57 5.15.34 6.07-2.31.74-2.14-.02-3.38-1.57-4.18 1.12-.26 1.96-.99 2.14-2.52zm-3.8 5.4c-.62 2.48-4.79 1.14-6.14.81l1.09-4.38c1.35.34 5.71.95 5.05 3.57zm.62-6.38c-.56 2.26-4.04 1.08-5.16.8l.98-3.94c1.13.28 4.79.76 4.18 3.14z"/>
          </svg>
        </div>
        <h1 class="landing-title">
          Inversiones. <br>
          Refinadas.
        </h1>
        <p class="landing-subtitle">Tu portafolio, reimaginado.</p>
        
        <p class="landing-description">
          Monitoriza tus activos con la precisión y elegancia del diseño industrial. 
          Real-time insights. Cero distracciones.
        </p>
        
        <button class="btn-start" (click)="iniciarApp()">
          Entrar al Dash
        </button>
      </div>
    </div>

    <div class="app-container" *ngIf="mostrarApp" [@fadeInOut]>
      <div class="app-header">
        <div class="container d-flex justify-content-between align-items-center">
          <h1 (click)="mostrarApp = false" style="cursor: pointer;">Asset Manager</h1>
          <div class="header-meta text-muted small d-flex align-items-center">
            <span class="badge badge-fuente me-2" *ngIf="fuenteDolar && tipoCambioUSD > 0">{{ fuenteDolar }}</span>
            DOLAR BLUE: <span [class.text-warning]="tipoCambioUSD <= 0" class="ms-1">{{ tipoCambioUSD > 0 ? (tipoCambioUSD | number:'1.0-0') : 'Cargando...' }}</span>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="nav-tabs-custom">
          <button 
            class="nav-tab" 
            [class.active]="tabActiva === 'inversiones'"
            (click)="setTab('inversiones')">
            Portafolio
          </button>
          <button 
            class="nav-tab" 
            [class.active]="tabActiva === 'resumen'"
            (click)="setTab('resumen')">
            Resumen
          </button>
          <button 
            class="nav-tab" 
            [class.active]="tabActiva === 'cedears'"
            (click)="setTab('cedears')">
            Tickers
          </button>
          <button 
            class="nav-tab" 
            [class.active]="tabActiva === 'cripto'"
            (click)="setTab('cripto')">
            Crypto
          </button>
          <button 
            class="nav-tab" 
            [class.active]="tabActiva === 'cotizaciones'"
            (click)="setTab('cotizaciones')">
            Cotizaciones
          </button>
        </div>

        <div *ngIf="tabActiva === 'inversiones'">
          <div class="card cambio-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5>Tipo de Cambio Dólar Blue</h5>
              <span class="tipo-cambio-display">1 USD = {{ tipoCambioUSD }} ARS</span>
            </div>
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-md-5">
                  <label class="form-label">Ajustar manualmente</label>
                  <div class="input-group input-group-sm">
                    <span class="input-group-text">$</span>
                    <input type="number" step="1" class="form-control" 
                           [(ngModel)]="dolarManualInput" placeholder="Ej: 1100">
                    <button class="btn btn-primary" (click)="aplicarDolarManual()" title="Aplicar este valor al sistema">
                      ✓ Aplicar
                    </button>
                    <button *ngIf="usarDolarManual" class="btn btn-outline-warning" (click)="obtenerDolarBlue()" title="Volver a cotización real">
                      API
                    </button>
                  </div>
                </div>
                <div class="col-md-3">
                  <button class="btn btn-sm btn-refresh" (click)="obtenerDolarBlue()">
                    🔄 API Directa
                  </button>
                </div>
                <div class="col-md-4">
                  <p class="mb-0 text-white"><strong>Última act.:</strong> {{ horaActual }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h5>Nueva Inversión</h5>
            </div>
            <div class="card-body">
              <form (ngSubmit)="crearInversion()">
                <div class="row g-3">
                  <div class="col-md-3">
                    <label class="form-label">Nombre</label>
                    <input type="text" class="form-control" [(ngModel)]="nuevaInversion.nombre" name="nombre" required>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label">Tipo</label>
                    <input type="text" class="form-control" [(ngModel)]="nuevaInversion.tipo" name="tipo" required>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label">Cantidad</label>
                    <input type="number" class="form-control" [(ngModel)]="nuevaInversion.cantidad" name="cantidad" required>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label">Precio Compra (ARS)</label>
                    <input type="number" step="0.01" class="form-control" [(ngModel)]="nuevaInversion.precioCompra" name="precioCompra" required>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label">Fecha</label>
                    <input type="date" class="form-control" [(ngModel)]="nuevaInversion.fechaCompra" name="fechaCompra" required>
                  </div>
                </div>
                <div class="mt-3">
                  <button type="submit" class="btn btn-success">Agregar Inversión</button>
                </div>
              </form>
            </div>
          </div>

          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5>Resumen de Inversiones</h5>
              <button class="btn btn-sm btn-actualizar" (click)="actualizarPreciosYReportes()">
                🔄 Actualizar Precios
              </button>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Tipo</th>
                      <th>Cantidad</th>
                      <th>Precio Compra</th>
                      <th>USD al Comprar</th>
                      <th>Precio Actual</th>
                      <th>Ganancia/Pérdida</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let inv of inversionesActivas">
                      <td>{{ inv.nombre }}</td>
                      <td>
                        <span class="tipo-badge">{{ inv.tipo }}</span>
                      </td>
                      <td>{{ inv.cantidad }}</td>
                      <td>{{ inv.precioCompra | currency }}</td>
                      <td>
                        <span *ngIf="inv.tipo === 'CEDEAR'" class="usd-badge">
                          USD {{ getPrecioUSDCedear(inv) | number:'1.2-2' }}
                        </span>
                        <span *ngIf="inv.tipo !== 'CEDEAR'" class="text-muted">-</span>
                      </td>
                      <td>
                        <div class="precio-input-group" *ngIf="inv.tipo === 'CEDEAR'">
                          <span class="precio-label">ARS</span>
                          <input type="number" step="0.01" class="form-control form-control-sm precio-input" 
                                 [(ngModel)]="preciosActual[inv.id!]" 
                                 (ngModelChange)="onPrecioChange(inv)"
                                 placeholder="Precio actual">
                          <button class="btn btn-sm btn-calcular" (click)="calcularReporte(inv)">
                            ✓
                          </button>
                        </div>
                        <div class="precio-input-group" *ngIf="inv.tipo !== 'CEDEAR'">
                          <input type="number" step="0.01" class="form-control form-control-sm" 
                                 [(ngModel)]="preciosActual[inv.id!]" 
                                 (ngModelChange)="onPrecioChange(inv)"
                                 placeholder="Precio">
                          <button class="btn btn-sm btn-calcular" (click)="calcularReporte(inv)">
                            ✓
                          </button>
                        </div>
                      </td>
                      <td>
                        <span *ngIf="reportes[inv.id!]" 
                              [class.positivo]="reportes[inv.id!].gananciaPerdida >= 0"
                              [class.negativo]="reportes[inv.id!].gananciaPerdida < 0">
                          {{ reportes[inv.id!].gananciaPerdida | currency }} 
                          ({{ reportes[inv.id!].porcentaje | number:'1.2-2' }}%)
                        </span>
                        <span *ngIf="!reportes[inv.id!]" class="text-muted">-</span>
                      </td>
                      <td>
                        <button class="btn btn-warning btn-sm" style="margin-right: 5px;" (click)="venderInversion(inv)">Vender</button>
                        <button class="btn btn-danger btn-sm" (click)="eliminarInversion(inv.id!)">Eliminar</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div *ngIf="inversiones.length === 0" class="text-center text-muted py-4">
                No hay inversiones registradas
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="tabActiva === 'resumen'">
          <div class="bento-container staggered-reveal">
            
            <div class="bento-card hero-card">
              <div class="bento-icon">📊</div>
              <p class="bento-label">Valor Actual del Portafolio</p>
              <h2 class="bento-value main-val">{{ valorActualTotal | currency }}</h2>
              <p class="bento-sub">Equivalente a USD {{ totalUSD | number:'1.2-2' }}</p>
            </div>

            <div class="bento-card" [ngClass]="gananciaPerdidaTotal >= 0 ? 'profit-card align-items-center' : 'loss-card align-items-center'" style="display: flex; flex-direction: column; justify-content: center; text-align: center;">
              <p class="bento-label" style="color: inherit; opacity: 0.9;">Retorno Histórico</p>
              <h3 class="bento-value" style="color: inherit; margin: 10px 0;">
                {{ gananciaPerdidaTotal >= 0 ? '+' : '' }}{{ gananciaPerdidaTotal | currency }}
              </h3>
              <div class="pill-badge" style="background: rgba(255,255,255,0.25); color: inherit; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 1.2rem;">
                {{ gananciaPerdidaTotal >= 0 ? '+' : '' }}{{ (totalInvertido > 0 ? (gananciaPerdidaTotal / totalInvertido * 100) : 0) | number:'1.2-2' }}%
              </div>
            </div>

            <div class="bento-card d-flex flex-column justify-content-center">
              <div class="bento-icon">💰</div>
              <p class="bento-label">Capital Total Invertido</p>
              <h3 class="bento-value">{{ totalInvertido | currency }}</h3>
              <p class="bento-sub text-muted" style="color:var(--apple-gray)!important;">Capital base aportado</p>
            </div>

            <div class="bento-card d-flex flex-column justify-content-center">
              <div class="bento-icon">🇺🇸</div>
              <p class="bento-label">Profit Neta en USD</p>
              <h3 class="bento-value" [class.positivo]="gananciaPerdidaTotal >= 0" [class.negativo]="gananciaPerdidaTotal < 0">
                USD {{ gananciaPerdidaTotal >= 0 ? '+' : '' }}{{ gananciaPerdidaUSD | number:'1.2-2' }}
              </h3>
            </div>

            <div class="bento-card chart-card">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <p class="bento-label mb-0">Evolución Acumulada del Patrimonio</p>
                <div class="badge bg-light text-dark border">Capital vs Rendimiento</div>
              </div>
              <div class="chart-wrapper">
                <canvas id="evolucionChart"></canvas>
              </div>
            </div>

          </div>
        </div>

        <div *ngIf="tabActiva === 'cedears'">
          <div class="card">
            <div class="card-header">
              <h5>Agregar CEDEAR Personalizado</h5>
            </div>
            <div class="card-body">
              <form (ngSubmit)="agregarCedearPersonalizado()" class="nuevo-cedear-form">
                <div class="row g-3 align-items-end">
                  <div class="col-md-2">
                    <label class="form-label">Símbolo</label>
                    <input type="text" class="form-control" [(ngModel)]="nuevoCedear.simbolo" name="simbolo" 
                           placeholder="Ej: AAPL" required>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Nombre</label>
                    <input type="text" class="form-control" [(ngModel)]="nuevoCedear.nombre" name="nombre" 
                           placeholder="Nombre de la empresa" required>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label">Precio ARS</label>
                    <input type="number" step="0.01" class="form-control" [(ngModel)]="nuevoCedear.precioARS" 
                           name="precioARS" placeholder="0.00" required>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label">Variación %</label>
                    <input type="number" step="0.01" class="form-control" [(ngModel)]="nuevoCedear.variacion" 
                           name="variacion" placeholder="0.00">
                  </div>
                  <div class="col-md-2">
                    <label class="form-label">Categoría</label>
                    <select class="form-control" [(ngModel)]="nuevaCategoria" name="categoria">
                      <option value="Tech">Tech</option>
                      <option value="Finanzas">Finanzas</option>
                      <option value="Consumo">Consumo</option>
                      <option value="Energía">Energía</option>
                      <option value="Salud">Salud</option>
                    </select>
                  </div>
                  <div class="col-md-1">
                    <button type="submit" class="btn btn-success">+</button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5>Precios de CEDEARs en Pesos Argentinos</h5>
              <small class="text-muted">Última actualización: {{ ultimaActualizacion }}</small>
            </div>
            <div class="card-body">
              <div class="search-bar mb-4">
                <input 
                  type="text" 
                  class="form-control search-input" 
                  placeholder="Buscar por nombre o símbolo..." 
                  [(ngModel)]="buscadorCedears"
                  (input)="filtrarCedears()">
                <div class="filter-buttons mt-3">
                  <button 
                    class="filter-btn" 
                    [class.active]="filtroCategoria === 'todos'"
                    (click)="filtroCategoria = 'todos'; filtrarCedears()">
                    Todos
                  </button>
                  <button 
                    class="filter-btn" 
                    [class.active]="filtroCategoria === 'tech'"
                    (click)="filtroCategoria = 'tech'; filtrarCedears()">
                    Tech
                  </button>
                  <button 
                    class="filter-btn" 
                    [class.active]="filtroCategoria === 'finanzas'"
                    (click)="filtroCategoria = 'finanzas'; filtrarCedears()">
                    Finanzas
                  </button>
                  <button 
                    class="filter-btn" 
                    [class.active]="filtroCategoria === 'consumo'"
                    (click)="filtroCategoria = 'consumo'; filtrarCedears()">
                    Consumo
                  </button>
                  <button 
                    class="filter-btn" 
                    [class.active]="filtroCategoria === 'energia'"
                    (click)="filtroCategoria = 'energia'; filtrarCedears()">
                    Energía
                  </button>
                  <button 
                    class="filter-btn" 
                    [class.active]="filtroCategoria === 'salud'"
                    (click)="filtroCategoria = 'salud'; filtrarCedears()">
                    Salud
                  </button>
                </div>
              </div>
              
              <div class="cedear-grid">
                <div *ngFor="let cedear of cedearsFiltrados; let i = index" class="cedear-card staggered-reveal" [style.animation-delay]="(i * 0.05) + 's'">
                  <div class="cedear-symbol">{{ cedear.simbolo }}</div>
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="cedear-name mb-0">{{ cedear.nombre }}</div>
                    <div class="cantidad-selector d-flex align-items-center">
                      <span class="text-muted small" style="margin-right: 6px;">Cant:</span>
                      <input type="number" min="1" class="form-control form-control-sm text-center" 
                             style="width: 65px; border: 1px solid #d2d2d7 !important; padding: 4px;" 
                             [(ngModel)]="cantidadesCompra[cedear.simbolo]">
                    </div>
                  </div>
                  
                  <div class="cedear-price">{{ cedear.precioARS | currency }}</div>
                  <div class="text-muted small mb-3">
                    <span [class.text-warning]="cedear.variacion >= 0" [class.negativo]="cedear.variacion < 0">
                      {{ cedear.variacion >= 0 ? '+' : '' }}{{ cedear.variacion | number:'1.2-2' }}%
                    </span>
                    • USD {{ (cedear.precioARS / tipoCambioUSD) | number:'1.2-2' }}
                  </div>
                  
                  <button class="btn-comprar" (click)="comprarCedear(cedear)">Invertir</button>
                </div>
              </div>
              
              <div *ngIf="cedearsFiltrados.length === 0" class="text-center text-muted py-4">
                No se encontraron CEDEARs
              </div>
              
              <div class="mt-4 p-3 rounded cedear-nota">
                <p class="mb-0 text-muted small">
                  <strong>Nota:</strong> Los precios mostrados son referenciales y pueden variar. 
                  Se recomienda verificar los precios en tiempo real en su broker o plataforma de trading.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB CRIPTOMONEDAS -->
        <div *ngIf="tabActiva === 'cripto'">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5>Cotizaciones Cripto (USD / ARS)</h5>
              <div class="d-flex align-items-center gap-3">
                <span class="badge bg-primary" style="background-color: #f3ba2f !important; color: #111;">Fuente: Binance</span>
                <small class="text-muted">Actualizado: {{ horaActual }}</small>
              </div>
            </div>
            <div class="card-body">
              <div class="search-bar mb-4">
                <input 
                  type="text" 
                  class="form-control search-input" 
                  placeholder="Buscar criptomoneda..." 
                  [(ngModel)]="buscadorCripto"
                  (input)="filtrarCriptos()">
              </div>
              
              <div class="cedear-grid">
                <div *ngFor="let cripto of criptosFiltrados; let i = index" class="cedear-card staggered-reveal" [style.animation-delay]="(i * 0.05) + 's'">
                  <div class="cedear-symbol" style="display: flex; justify-content: space-between; align-items: center;">
                    {{ cripto.simbolo }}
                    <span 
                      (click)="toggleCriptoFavorito(cripto.simbolo)"
                      [style.color]="esCriptoFavorita(cripto.simbolo) ? '#f39c12' : '#888'"
                      style="cursor: pointer; font-size: 1.2rem; transition: color 0.2s;">
                      ★
                    </span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="cedear-name mb-0">{{ cripto.nombre }}</div>
                    <div class="cantidad-selector d-flex align-items-center">
                      <span class="text-muted small" style="margin-right: 6px;">Cant:</span>
                      <input type="number" min="0.0001" step="0.0001" class="form-control form-control-sm text-center" 
                             style="width: 80px; border: 1px solid #d2d2d7 !important; padding: 4px;" 
                             [(ngModel)]="cantidadesCompra[cripto.simbolo]">
                    </div>
                  </div>
                  
                  <div class="cedear-price">USD {{ cripto.precioUSD | number:'1.2-2' }}</div>
                  <div class="text-muted small mb-3">
                    <span [class.positivo]="cripto.variacion24h >= 0" [class.negativo]="cripto.variacion24h < 0">
                      {{ (cripto.variacion24h >= 0 ? '+' : '') }}{{ cripto.variacion24h | number:'1.2-2' }}%
                    </span>
                    • ARS {{ (cripto.precioUSD * tipoCambioUSD) | number:'1.0-0' }}
                  </div>
                  
                  <button class="btn-comprar" (click)="comprarCripto(cripto)">Invertir</button>
                </div>
              </div>
              
              <div *ngIf="criptosFiltrados.length === 0" class="text-center text-muted py-4">
                Cargando precios o no se encontraron resultados...
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="tabActiva === 'cotizaciones'">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5>Cotizaciones de Dólares (ARS)</h5>
              <div class="d-flex align-items-center gap-3">
                <span class="badge bg-info">Fuente: DolarAPI.com</span>
                <button class="btn btn-sm btn-outline-primary" (click)="cargarDolares()">🔄 Refrescar</button>
              </div>
            </div>
            <div class="card-body">
              <div class="dolar-grid">
                <div *ngFor="let d of listaDolares" class="dolar-item card-bento p-3 shadow-sm border-0">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <h6 class="mb-0 text-uppercase font-weight-bold" style="color:var(--apple-blue); font-size: 0.85rem;">{{ d.nombre }}</h6>
                    <span class="badge bg-light text-dark border-0" style="font-size: 0.6rem; opacity: 0.7;">API</span>
                  </div>
                  <div class="row text-center">
                    <div class="col-6 border-end">
                      <p class="mb-0 text-muted small" style="font-size: 0.7rem;">Compra</p>
                      <h4 class="mb-0 text-dark" style="font-size: 1.1rem; font-weight: 700;">{{ d.compra | currency:'ARS':'$':'1.0-0' }}</h4>
                    </div>
                    <div class="col-6">
                      <p class="mb-0 text-muted small" style="font-size: 0.7rem;">Venta</p>
                      <h4 class="mb-0 text-dark" style="font-size: 1.1rem; font-weight: 700;">{{ d.venta | currency:'ARS':'$':'1.0-0' }}</h4>
                    </div>
                  </div>
                  <div class="mt-3 text-center border-top pt-2">
                    <small class="text-muted" style="font-size:0.6rem;">Update: {{ d.fechaActualizacion | date:'dd/MM HH:mm' }}</small>
                  </div>
                </div>
              </div>
              
              <div *ngIf="listaDolares.length === 0" class="text-center py-5">
                 <div class="spinner-border text-primary" role="status">
                   <span class="visually-hidden">Cargando...</span>
                 </div>
                 <p class="mt-2 text-muted">Buscando cotizaciones reales...</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  cantidadesCompra: { [simbolo: string]: number } = {};
  inversiones: Inversion[] = [];
  reportes: { [id: number]: ReporteGanancias } = {};
  preciosActual: { [id: number]: number } = {};
  reporteGeneral: boolean = false;
  mostrarApp: boolean = false;
  buttonState: string = 'idle';
  tabActiva: string = 'inversiones';
  ultimaActualizacion: string = '';
  horaActual: string = '';
  tipoCambioUSD: number = 0;
  buscadorCedears: string = '';
  filtroCategoria: string = 'todos';
  buscadorCripto: string = '';
  nuevoCedear: NuevoCedear = { simbolo: '', nombre: '', precioARS: 0, variacion: 0 };
  nuevaCategoria: string = 'Tech';
  usarDolarManual: boolean = false;
  dolarManualInput: number = 0;
  fuenteDolar: string = '';
  listaDolares: any[] = [];

  criptos: Cripto[] = [];
  criptosFiltrados: Cripto[] = [];
  criptosFavoritas: string[] = ['btc', 'nexo', 'usdt', 'usdc'];

  cedears: Cedear[] = [
    { simbolo: 'AAPL', nombre: 'Apple Inc.', precioARS: 18350.00, variacion: 1.25, ultimoUpdate: '20/03 16:59', categoria: 'Tech' },
    { simbolo: 'GOOGL', nombre: 'Alphabet Inc.', precioARS: 22150.00, variacion: -0.85, ultimoUpdate: '20/03 16:59', categoria: 'Tech' },
    { simbolo: 'MSFT', nombre: 'Microsoft Corp.', precioARS: 32150.00, variacion: 0.45, ultimoUpdate: '20/03 16:59', categoria: 'Tech' },
    { simbolo: 'AMZN', nombre: 'Amazon.com Inc.', precioARS: 15950.00, variacion: 2.10, ultimoUpdate: '20/03 16:59', categoria: 'Tech' },
    { simbolo: 'TSLA', nombre: 'Tesla Inc.', precioARS: 13500.00, variacion: -1.50, ultimoUpdate: '20/03 16:59', categoria: 'Tech' },
    { simbolo: 'META', nombre: 'Meta Platforms', precioARS: 43500.00, variacion: 3.25, ultimoUpdate: '20/03 16:59', categoria: 'Tech' },
    { simbolo: 'NVDA', nombre: 'NVIDIA Corp.', precioARS: 78500.00, variacion: 4.80, ultimoUpdate: '20/03 16:59', categoria: 'Tech' },
    { simbolo: 'NFLX', nombre: 'Netflix Inc.', precioARS: 48200.00, variacion: 0.50, ultimoUpdate: '20/03 16:59', categoria: 'Tech' },
    { simbolo: 'INTC', nombre: 'Intel Corp.', precioARS: 1850.00, variacion: -0.50, ultimoUpdate: '20/03 16:59', categoria: 'Tech' },
    { simbolo: 'AMD', nombre: 'AMD Inc.', precioARS: 12500.00, variacion: 1.80, ultimoUpdate: '20/03 16:59', categoria: 'Tech' },
    { simbolo: 'CRM', nombre: 'Salesforce Inc.', precioARS: 23500.00, variacion: 0.90, ultimoUpdate: '20/03 16:59', categoria: 'Tech' },
    { simbolo: 'SPY', nombre: 'SPDR S&P 500 ETF', precioARS: 47620.00, variacion: 0.55, ultimoUpdate: '20/03 16:59', categoria: 'Tech' },
    { simbolo: 'QQQ', nombre: 'Invesco QQQ ETF', precioARS: 42500.00, variacion: 0.80, ultimoUpdate: '20/03 16:59', categoria: 'Tech' },
    { simbolo: 'JPM', nombre: 'JPMorgan Chase', precioARS: 18500.00, variacion: 0.65, ultimoUpdate: '20/03 16:59', categoria: 'Finanzas' },
    { simbolo: 'BAC', nombre: 'Bank of America', precioARS: 2650.00, variacion: -0.30, ultimoUpdate: '20/03 16:59', categoria: 'Finanzas' },
    { simbolo: 'WFC', nombre: 'Wells Fargo', precioARS: 4850.00, variacion: 0.45, ultimoUpdate: '20/03 16:59', categoria: 'Finanzas' },
    { simbolo: 'GS', nombre: 'Goldman Sachs', precioARS: 32500.00, variacion: 1.20, ultimoUpdate: '20/03 16:59', categoria: 'Finanzas' },
    { simbolo: 'V', nombre: 'Visa Inc.', precioARS: 22500.00, variacion: 0.90, ultimoUpdate: '20/03 16:59', categoria: 'Finanzas' },
    { simbolo: 'MA', nombre: 'Mastercard Inc.', precioARS: 36500.00, variacion: 1.15, ultimoUpdate: '20/03 16:59', categoria: 'Finanzas' },
    { simbolo: 'PYPL', nombre: 'PayPal Holdings', precioARS: 5950.00, variacion: -1.20, ultimoUpdate: '20/03 16:59', categoria: 'Finanzas' },
    { simbolo: 'BRK.B', nombre: 'Berkshire Hathaway', precioARS: 28500.00, variacion: 0.30, ultimoUpdate: '20/03 16:59', categoria: 'Finanzas' },
    { simbolo: 'WMT', nombre: 'Walmart Inc.', precioARS: 4250.00, variacion: -0.30, ultimoUpdate: '20/03 16:59', categoria: 'Consumo' },
    { simbolo: 'HD', nombre: 'Home Depot', precioARS: 28500.00, variacion: 0.85, ultimoUpdate: '20/03 16:59', categoria: 'Consumo' },
    { simbolo: 'MCD', nombre: "McDonald's Corp.", precioARS: 14500.00, variacion: 0.25, ultimoUpdate: '20/03 16:59', categoria: 'Consumo' },
    { simbolo: 'NKE', nombre: 'Nike Inc.', precioARS: 5950.00, variacion: -0.60, ultimoUpdate: '20/03 16:59', categoria: 'Consumo' },
    { simbolo: 'SBUX', nombre: 'Starbucks Corp.', precioARS: 6850.00, variacion: 0.40, ultimoUpdate: '20/03 16:59', categoria: 'Consumo' },
    { simbolo: 'DIS', nombre: 'Walt Disney Co.', precioARS: 8750.00, variacion: 1.15, ultimoUpdate: '20/03 16:59', categoria: 'Consumo' },
    { simbolo: 'KO', nombre: 'Coca-Cola Co.', precioARS: 3850.00, variacion: 0.25, ultimoUpdate: '20/03 16:59', categoria: 'Consumo' },
    { simbolo: 'PEP', nombre: 'PepsiCo Inc.', precioARS: 9850.00, variacion: 0.35, ultimoUpdate: '20/03 16:59', categoria: 'Consumo' },
    { simbolo: 'XOM', nombre: 'Exxon Mobil', precioARS: 9250.00, variacion: 1.50, ultimoUpdate: '20/03 16:59', categoria: 'Energía' },
    { simbolo: 'CVX', nombre: 'Chevron Corp.', precioARS: 12500.00, variacion: 1.20, ultimoUpdate: '20/03 16:59', categoria: 'Energía' },
    { simbolo: 'COP', nombre: 'ConocoPhillips', precioARS: 9250.00, variacion: 0.90, ultimoUpdate: '20/03 16:59', categoria: 'Energía' },
    { simbolo: 'JNJ', nombre: 'Johnson & Johnson', precioARS: 11250.00, variacion: 0.15, ultimoUpdate: '20/03 16:59', categoria: 'Salud' },
    { simbolo: 'PFE', nombre: 'Pfizer Inc.', precioARS: 2150.00, variacion: -0.80, ultimoUpdate: '20/03 16:59', categoria: 'Salud' },
    { simbolo: 'UNH', nombre: 'UnitedHealth Group', precioARS: 38500.00, variacion: 0.70, ultimoUpdate: '20/03 16:59', categoria: 'Salud' },
    { simbolo: 'ABBV', nombre: 'AbbVie Inc.', precioARS: 17500.00, variacion: 1.05, ultimoUpdate: '20/03 16:59', categoria: 'Salud' },
    { simbolo: 'MRK', nombre: 'Merck & Co.', precioARS: 8950.00, variacion: 0.45, ultimoUpdate: '20/03 16:59', categoria: 'Salud' },
    { simbolo: 'AAL', nombre: 'American Airlines', precioARS: 5950.00, variacion: 1.45, ultimoUpdate: '20/03 16:59', categoria: 'Consumo' },
    { simbolo: 'GOLD', nombre: 'Barrick Gold Corp.', precioARS: 12500.00, variacion: 0.80, ultimoUpdate: '20/03 16:59', categoria: 'Energía' },
    { simbolo: 'MELI', nombre: 'MercadoLibre', precioARS: 98500.00, variacion: 2.50, ultimoUpdate: '20/03 16:59', categoria: 'Tech' },
    { simbolo: 'TX', nombre: 'Ternium Argentina', precioARS: 8950.00, variacion: -0.50, ultimoUpdate: '20/03 16:59', categoria: 'Energía' },
    { simbolo: 'PAM', nombre: 'Pampa Energia', precioARS: 12500.00, variacion: 0.30, ultimoUpdate: '20/03 16:59', categoria: 'Energía' },
  ];

  cedearsFiltrados: Cedear[] = [...this.cedears];

  nuevaInversion: Inversion = this.getNuevaInversion();

  constructor(private inversionService: InversionService) {}

  async ngOnInit() {
    const savedFavs = localStorage.getItem('criptosFavoritas');
    if (savedFavs) {
      try { this.criptosFavoritas = JSON.parse(savedFavs); } catch (e) {}
    }
    
    // Empezamos asumiendo que no conocemos el dólar (0)
    // Se cargará desde la API obligatoriamente al arrancar
    this.tipoCambioUSD = 0;
    this.actualizarFecha();
    
    try {
      // 1. Obtenemos dólar actualizado (obligatorio esperar por cálculos USD)
      await this.obtenerDolarBlue();
      console.log('Dólar OK');

      // 2. Forzamos al backend a limpiar su caché y buscar precios frescos de Yahoo/Binance
      await this.inversionService.refreshBackend().toPromise();
      console.log('Backend Refrescado (Yahoo/Binance)');

      // 3. Cargamos los datos ya frescos en nuestras listas locales
      this.cargarCedearsDesdeAPI();
      this.cargarCriptosDesdeAPI();
      this.cargarCedearsPersonalizados();
      
      // 4. Finalmente cargamos las inversiones y calculamos los reportes con todo listo
      this.cargarInversiones();
      this.cargarDolares();
      
      console.log('Aplicación sincronizada totalmente con APIs');
    } catch (error) {
      console.error('Error durante la sincronización inicial:', error);
      this.cargarInversiones();
    }
  }

  cargarCriptosDesdeAPI() {
    this.inversionService.getCriptoPrecios().subscribe({
      next: (data) => {
        this.criptos = data;
        this.filtrarCriptos();
      },
      error: (err) => console.log('Error cargando criptos:', err)
    });
  }

  filtrarCriptos() {
    const texto = this.buscadorCripto.toLowerCase();
    let filtrados = this.criptos.filter(c => 
      c.simbolo.toLowerCase().includes(texto) || 
      c.nombre.toLowerCase().includes(texto)
    );

    // Ordenar por favoritas primero
    filtrados.sort((a, b) => {
      const aFav = this.esCriptoFavorita(a.simbolo);
      const bFav = this.esCriptoFavorita(b.simbolo);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0; // mantener orden
    });

    this.criptosFiltrados = filtrados;
  }

  esCriptoFavorita(simbolo: string): boolean {
    return this.criptosFavoritas.includes(simbolo.toLowerCase());
  }

  toggleCriptoFavorito(simbolo: string) {
    const sym = simbolo.toLowerCase();
    if (this.criptosFavoritas.includes(sym)) {
      this.criptosFavoritas = this.criptosFavoritas.filter(f => f !== sym);
    } else {
      this.criptosFavoritas.push(sym);
    }
    localStorage.setItem('criptosFavoritas', JSON.stringify(this.criptosFavoritas));
    this.filtrarCriptos();
  }

  comprarCripto(cripto: Cripto) {
    const cant = this.cantidadesCompra[cripto.simbolo] || 1;
    const nueva: Inversion = {
      nombre: cripto.nombre,
      tipo: 'CRIPTO',
      cantidad: cant,
      precioCompra: cripto.precioUSD * this.tipoCambioUSD,
      fechaCompra: new Date().toISOString().split('T')[0]
    };
    
    this.inversionService.crearInversion(nueva).subscribe({
      next: () => {
        this.cantidadesCompra[cripto.simbolo] = 1;
        this.cargarInversiones();
        this.tabActiva = 'inversiones';
      },
      error: (err) => console.error('Error creando inversión cripto:', err)
    });
  }

  cargarCedearsDesdeAPI() {
    this.inversionService.getPreciosCedears().subscribe({
      next: (precios) => {
        if (precios && precios.length > 0) {
          precios.forEach(p => {
            const cedear = this.cedears.find(c => c.simbolo === p.simbolo);
            if (cedear) {
              cedear.precioARS = p.precioARS;
              cedear.variacion = p.variacion;
              cedear.ultimoUpdate = p.ultimoUpdate;
            }
          });
          this.filtrarCedears();
          this.actualizarFecha();
        }
      },
      error: (err) => {
        console.log('Usando precios locales');
        this.cedearsFiltrados = [...this.cedears];
      }
    });
  }

  obtenerDolarBlue(): Promise<number> {
    this.usarDolarManual = false; // Al pedir de la API, desactivamos el modo manual
    return new Promise((resolve, reject) => {
      this.inversionService.getDolar().subscribe({
        next: (data) => {
          if (data && data.tipoCambio) {
            this.tipoCambioUSD = data.tipoCambio;
            this.fuenteDolar = data.fuente || 'API';
            this.guardarTipoCambio();
            this.calcularTodosLosReportes();
            this.actualizarFecha();
            console.log('Dólar actualizado:', this.tipoCambioUSD);
            resolve(this.tipoCambioUSD);
          } else {
            resolve(this.tipoCambioUSD);
          }
        },
        error: (err) => {
          console.error('Error obteniendo dólar desde backend:', err);
          this.fetchDolarDirecto().then(v => resolve(v)).catch(() => resolve(this.tipoCambioUSD));
        }
      });
    });
  }

  async fetchDolarDirecto(): Promise<number> {
    try {
      const response = await fetch('https://dolarapi.com/v1/dolares/blue');
      if (response.ok) {
        const data = await response.json();
        if (data && data.venta) {
          this.tipoCambioUSD = Math.round(data.venta);
          this.fuenteDolar = 'DolarAPI (Direct)';
          this.guardarTipoCambio();
          this.actualizarFecha();
          return this.tipoCambioUSD;
        }
      }
    } catch (e) {
      console.error('Fallo total de obtención de dólar');
    }
    return this.tipoCambioUSD;
  }

  aplicarDolarManual() {
    if (this.dolarManualInput > 0) {
      this.tipoCambioUSD = this.dolarManualInput;
      this.usarDolarManual = true;
      this.guardarTipoCambio();
      this.calcularTodosLosReportes();
      this.actualizarFecha();
      console.log('Dólar Manual Aplicado:', this.tipoCambioUSD);
    }
  }

  cargarTipoCambio() {
    this.inversionService.getTipoCambio().subscribe(v => this.tipoCambioUSD = v);
  }

  guardarTipoCambio() {
    this.inversionService.setTipoCambio(this.tipoCambioUSD);
  }

  onTipoCambioChange() {
    this.guardarTipoCambio();
    this.calcularTodosLosReportes();
  }

  cargarCedearsPersonalizados() {
    this.inversionService.getCedearsPersonalizados().subscribe(pers => {
      pers.forEach(p => {
        if (!this.cedears.find(c => c.simbolo === p.simbolo)) {
          this.cedears.push(p);
        }
      });
      this.filtrarCedears();
    });
  }

  guardarCedearsPersonalizados() {
    const personalizados = this.cedears.filter(c => c.personalizado);
    this.inversionService.setPersonalizados(personalizados);
  }

  agregarCedearPersonalizado() {
    if (!this.nuevoCedear.simbolo || !this.nuevoCedear.nombre || !this.nuevoCedear.precioARS) {
      return;
    }

    const simboloUpper = this.nuevoCedear.simbolo.toUpperCase();
    const existe = this.cedears.find(c => c.simbolo === simboloUpper);
    
    if (existe) {
      existe.precioARS = this.nuevoCedear.precioARS;
      existe.variacion = this.nuevoCedear.variacion;
    } else {
      const nuevo: Cedear = {
        simbolo: simboloUpper,
        nombre: this.nuevoCedear.nombre,
        precioARS: this.nuevoCedear.precioARS,
        variacion: this.nuevoCedear.variacion,
        ultimoUpdate: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        categoria: this.nuevaCategoria,
        personalizado: true
      };
      this.cedears.push(nuevo);
    }

    this.guardarCedearsPersonalizados();
    this.filtrarCedears();
    this.nuevoCedear = { simbolo: '', nombre: '', precioARS: 0, variacion: 0 };
  }

  actualizarFecha() {
    const now = new Date();
    this.ultimaActualizacion = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    this.horaActual = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  filtrarCedears() {
    const texto = this.buscadorCedears.toLowerCase();
    this.cedearsFiltrados = this.cedears.filter(cedear => {
      const coincideTexto = cedear.simbolo.toLowerCase().includes(texto) || 
                          cedear.nombre.toLowerCase().includes(texto);
      
      const cat = cedear.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const filtro = this.filtroCategoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      const coincideCategoria = this.filtroCategoria === 'todos' || cat === filtro;
      return coincideTexto && coincideCategoria;
    });
  }

  getPrecioActualCedear(inv: Inversion): number {
    const cedear = this.cedears.find(c => c.nombre === inv.nombre);
    if (cedear) {
      return cedear.precioARS;
    }
    return inv.precioCompra;
  }

  getPrecioUSDCedear(inv: Inversion): number {
    if (this.tipoCambioUSD > 0) {
      return Math.round((inv.precioCompra / this.tipoCambioUSD) * 100) / 100;
    }
    return inv.precioCompra;
  }

  onPrecioChange(inv: Inversion) {
    // El usuario está editando el precio, se calculará al hacer click en el botón
  }

  calcularReporte(inv: Inversion) {
    const precioActual = inv.tipo === 'CEDEAR' ? this.preciosActual[inv.id!] : this.preciosActual[inv.id!];
    if (!precioActual) return;

    const reporte: ReporteGanancias = {
      inversionId: inv.id!,
      nombre: inv.nombre,
      cantidad: inv.cantidad,
      precioCompra: inv.precioCompra,
      precioActual: precioActual,
      inversionTotal: inv.precioCompra * inv.cantidad,
      valorActual: precioActual * inv.cantidad,
      gananciaPerdida: (precioActual * inv.cantidad) - (inv.precioCompra * inv.cantidad),
      porcentaje: inv.precioCompra > 0 ? Math.round(((precioActual - inv.precioCompra) / inv.precioCompra) * 10000) / 100 : 0
    };

    this.reportes[inv.id!] = reporte;
    this.reporteGeneral = this.inversiones.length > 0;
  }

  calcularTodosLosReportes() {
    this.inversionesActivas.forEach(inv => {
      const precioActual = this.preciosActual[inv.id!] || (inv.tipo === 'CEDEAR' ? this.getPrecioActualCedear(inv) : inv.precioCompra);
      if (precioActual) {
        this.calcularReporte(inv);
      }
    });
  }

  async actualizarPreciosYReportes() {
    // Solo actualizamos de la API si NO estamos usando un valor manual fijo
    if (!this.usarDolarManual) {
      await this.obtenerDolarBlue();
    } else {
      console.log('Usando dólar manual, saltando actualización de API.');
    }
    
    this.inversionesActivas.forEach(inv => {
      if (inv.tipo === 'CEDEAR') {
        this.preciosActual[inv.id!] = this.getPrecioActualCedear(inv);
      }
    });
    this.calcularTodosLosReportes();
    this.reporteGeneral = this.inversiones.length > 0;
    if (this.tabActiva === 'resumen') {
      setTimeout(() => this.generarGrafico(), 200);
    }
  }

  setTab(tab: string) {
    this.tabActiva = tab;
    if (tab === 'resumen') {
      setTimeout(() => this.generarGrafico(), 200);
    }
  }

  grafico: any;

  generarGrafico() {
    const canvas = document.getElementById('evolucionChart') as HTMLCanvasElement;
    if (!canvas || !Chart) return;

    if (this.grafico) {
      this.grafico.destroy();
    }

    const rawEvents: any[] = [];
    this.inversiones.forEach(inv => {
      rawEvents.push({ date: new Date(inv.fechaCompra || ''), type: 'COMPRA', inv });
      if (inv.estado === 'VENDIDA') {
        const vDate = inv.fechaVenta ? new Date(inv.fechaVenta) : new Date();
        rawEvents.push({ date: vDate, type: 'VENTA', inv });
      }
    });

    rawEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    let activas: Inversion[] = [];
    const labels: string[] = [];
    const dataCapital: number[] = [];
    const dataValor: number[] = [];

    rawEvents.forEach(ev => {
      if (ev.type === 'COMPRA') {
        activas.push(ev.inv);
      } else {
        activas = activas.filter(i => i.id !== ev.inv.id);
      }

      let cap = 0;
      let val = 0;
      activas.forEach(a => {
        cap += a.cantidad * a.precioCompra;
        const precioActual = this.preciosActual[a.id!] || (a.tipo === 'CEDEAR' ? this.getPrecioActualCedear(a) : a.precioCompra);
        val += a.cantidad * precioActual;
      });

      labels.push(ev.date.toLocaleDateString());
      dataCapital.push(cap);
      dataValor.push(val);
    });

    const ctx = canvas.getContext('2d');
    
    // Gradientes modernos
    let gradientValor = 'rgba(0, 113, 227, 0.1)';
    let gradientCapital = 'rgba(134, 134, 139, 0.1)';
    
    if (ctx) {
      const gradV = ctx.createLinearGradient(0, 0, 0, 350);
      gradV.addColorStop(0, 'rgba(0, 113, 227, 0.4)');
      gradV.addColorStop(1, 'rgba(0, 113, 227, 0.0)');
      gradientValor = gradV as any;

      const gradC = ctx.createLinearGradient(0, 0, 0, 350);
      gradC.addColorStop(0, 'rgba(134, 134, 139, 0.2)');
      gradC.addColorStop(1, 'rgba(134, 134, 139, 0.0)');
      gradientCapital = gradC as any;
    }

    this.grafico = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Capital Invertido (Base)',
            data: dataCapital,
            borderColor: '#86868b',
            backgroundColor: gradientCapital,
            borderWidth: 2,
            borderDash: [5, 5],
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5
          },
          {
            label: 'Valor de Cartera',
            data: dataValor,
            borderColor: '#0071e3',
            backgroundColor: gradientValor,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: '#fff',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { 
            position: 'top', 
            labels: { 
              font: { family: 'Inter', size: 13, weight: '500' }, 
              useBorderRadius: true, 
              borderRadius: 6, 
              boxWidth: 24, 
              boxHeight: 12
            } 
          },
          tooltip: {
            backgroundColor: 'rgba(29, 29, 31, 0.85)',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 14,
            cornerRadius: 12,
            bodyFont: { family: 'Inter', size: 13 },
            titleFont: { family: 'Inter', size: 13, weight: 'bold' }
          }
        },
        scales: {
          y: { 
            beginAtZero: false, 
            grid: { display: false, drawBorder: false },
            ticks: { 
              font: { family: 'Inter', size: 11 }, 
              color: '#86868b',
              callback: function(value: any) { return '$' + (Number(value) / 1000).toFixed(0) + 'k'; }
            },
            border: { display: false }
          },
          x: { 
            grid: { display: false, drawBorder: false },
            ticks: { font: { family: 'Inter', size: 11 }, color: '#86868b', maxTicksLimit: 6 },
            border: { display: false }
          }
        }
      }
    });
  }

  comprarCedear(cedear: Cedear) {
    const cant = this.cantidadesCompra[cedear.simbolo] || 1;
    const nueva: Inversion = {
      nombre: cedear.nombre,
      tipo: 'CEDEAR',
      cantidad: cant,
      precioCompra: cedear.precioARS,
      fechaCompra: new Date().toISOString().split('T')[0]
    };
    
    this.inversionService.crearInversion(nueva).subscribe({
      next: () => {
        this.cantidadesCompra[cedear.simbolo] = 1;
        this.cargarInversiones();
        this.tabActiva = 'inversiones';
      },
      error: (err) => console.error('Error creando inversión:', err)
    });
  }

  iniciarApp() {
    this.mostrarApp = true;
  }

  getNuevaInversion(): Inversion {
    return {
      nombre: '',
      tipo: '',
      cantidad: 0,
      precioCompra: 0,
      fechaCompra: new Date().toISOString().split('T')[0]
    };
  }

  cargarInversiones() {
    this.inversionService.getInversiones().subscribe({
      next: (data) => {
        this.inversiones = data;
        this.actualizarPreciosYReportes();
      },
      error: (err) => console.error('Error cargando inversiones:', err)
    });
  }

  cargarDolares() {
    this.inversionService.getTodosLosDolares().subscribe({
      next: (data) => {
        this.listaDolares = data;
        console.log('Todas las cotizaciones:', data);
      },
      error: (err) => console.error('Error cargando dólares:', err)
    });
  }

  crearInversion() {
    this.inversionService.crearInversion(this.nuevaInversion).subscribe({
      next: () => {
        this.cargarInversiones();
        this.nuevaInversion = this.getNuevaInversion();
      },
      error: (err) => console.error('Error creando inversión:', err)
    });
  }

  get inversionesActivas(): Inversion[] {
    return this.inversiones.filter(i => i.estado !== 'VENDIDA');
  }

  venderInversion(inv: Inversion) {
    const actualizada: Inversion = {
      ...inv,
      estado: 'VENDIDA'
    };
    this.inversionService.actualizarInversion(inv.id!, actualizada).subscribe({
      next: () => this.cargarInversiones(),
      error: (err: any) => console.error('Error cerrando:', err)
    });
  }

  eliminarInversion(id: number) {
    this.inversionService.eliminarInversion(id).subscribe({
      next: () => this.cargarInversiones(),
      error: (err) => console.error('Error eliminando inversión:', err)
    });
  }

  get totalInvertido(): number {
    return this.inversionesActivas.reduce((sum, inv) => sum + (inv.precioCompra * inv.cantidad), 0);
  }

  get valorActualTotal(): number {
    return this.inversionesActivas.reduce((sum, inv) => {
      const precioActual = this.preciosActual[inv.id!] || (inv.tipo === 'CEDEAR' ? this.getPrecioActualCedear(inv) : inv.precioCompra);
      return sum + (precioActual * inv.cantidad);
    }, 0);
  }

  get gananciaPerdidaTotal(): number {
    return this.valorActualTotal - this.totalInvertido;
  }

  get gananciaPerdidaUSD(): number {
    return this.gananciaPerdidaTotal / this.tipoCambioUSD;
  }

  get totalUSD(): number {
    return this.valorActualTotal / this.tipoCambioUSD;
  }
}
