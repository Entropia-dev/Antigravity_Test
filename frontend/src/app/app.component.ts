import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InversionService } from './services/inversion.service';
import { Inversion, ReporteGanancias } from './models/inversion.model';

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
  template: `
    <div class="landing" *ngIf="!mostrarApp">
      <div class="landing-content">
        <div class="logo-container">
          <div class="logo-icon">📈</div>
        </div>
        <h1 class="landing-title">Bienvenido</h1>
        <p class="landing-subtitle">Gestiona tus inversiones de forma inteligente</p>
        <p class="landing-description">
          Registra tus compras, controla precios actuales y calcula 
          tus ganancias o pérdidas en tiempo real.
        </p>
        <button class="btn-start" (click)="iniciarApp()">
          <span class="btn-text">Comenzar</span>
          <span class="btn-arrow">→</span>
        </button>
        <div class="features">
          <div class="feature">
            <span class="feature-icon">💰</span>
            <span>Control de inversiones</span>
          </div>
          <div class="feature">
            <span class="feature-icon">📊</span>
            <span>Análisis de ganancias</span>
          </div>
          <div class="feature">
            <span class="feature-icon">📱</span>
            <span>Fácil de usar</span>
          </div>
        </div>
      </div>
      <div class="landing-bg">
        <div class="floating-shape shape1"></div>
        <div class="floating-shape shape2"></div>
        <div class="floating-shape shape3"></div>
      </div>
    </div>

    <div class="app-container" *ngIf="mostrarApp">
      <div class="container">
        <div class="app-header">
          <h1>📈 Gestor de Inversiones</h1>
        </div>

        <div class="nav-tabs-custom">
          <button 
            class="nav-tab" 
            [class.active]="tabActiva === 'inversiones'"
            (click)="tabActiva = 'inversiones'">
            💼 Mis Inversiones
          </button>
          <button 
            class="nav-tab" 
            [class.active]="tabActiva === 'cedears'"
            (click)="tabActiva = 'cedears'">
            🏛️ CEDEARs Argentinos
          </button>
          <button 
            class="nav-tab" 
            [class.active]="tabActiva === 'cripto'"
            (click)="tabActiva = 'cripto'">
            ₿ Criptomonedas
          </button>
        </div>

        <div *ngIf="tabActiva === 'inversiones'">
          <div class="card cambio-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5>💵 Tipo de Cambio Dólar Blue</h5>
              <span class="tipo-cambio-display">1 USD = {{ tipoCambioUSD }} ARS</span>
            </div>
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-md-4">
                  <label class="form-label">Ajustar manualmente</label>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input type="number" step="1" class="form-control" 
                           [(ngModel)]="tipoCambioUSD" (ngModelChange)="onTipoCambioChange()">
                  </div>
                </div>
                <div class="col-md-4">
                  <button class="btn btn-sm btn-refresh" (click)="obtenerDolarBlue()">
                    🔄 Actualizar desde web
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
                    <tr *ngFor="let inv of inversiones">
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

          <div class="card" *ngIf="inversiones.length > 0">
            <div class="card-header">
              <h5>📊 Resumen General de Cartera</h5>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-md-4 mb-3">
                  <p class="mb-1 text-white-50">Total Invertido (ARS)</p>
                  <p class="resumen-valor text-white">{{ totalInvertido | currency }}</p>
                </div>
                <div class="col-md-4 mb-3">
                  <p class="mb-1 text-white-50">Valor Actual (ARS)</p>
                  <p class="resumen-valor text-white">{{ valorActualTotal | currency }}</p>
                </div>
                <div class="col-md-4 mb-3">
                  <p class="mb-1 text-white-50">Valor Total en USD</p>
                  <p class="resumen-valor" style="color: #4ec9b0;">USD {{ totalUSD | number:'1.2-2' }}</p>
                </div>
              </div>
              
              <hr class="border-secondary opacity-25">
              
              <div class="row text-center mt-3">
                <div class="col-md-6 mb-2">
                  <p class="mb-1 text-white-50 font-weight-bold">📈 Ganancia / Pérdida en ARS</p>
                  <p class="resumen-valor" [class.positivo]="gananciaPerdidaTotal >= 0" [class.negativo]="gananciaPerdidaTotal < 0">
                    {{ gananciaPerdidaTotal | currency }}
                  </p>
                </div>
                <div class="col-md-6 mb-2">
                  <p class="mb-1 text-white-50 font-weight-bold">💹 Ganancia / Pérdida en USD</p>
                  <p class="resumen-valor" [class.positivo]="gananciaPerdidaTotal >= 0" [class.negativo]="gananciaPerdidaTotal < 0">
                    USD {{ gananciaPerdidaUSD | number:'1.2-2' }}
                  </p>
                </div>
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
                    [class.active]="filtroCategoria === 'tecnologia'"
                    (click)="filtroCategoria = 'tecnologia'; filtrarCedears()">
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
                <div *ngFor="let cedear of cedearsFiltrados" class="cedear-card">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div class="cedear-symbol">{{ cedear.simbolo }}</div>
                      <div class="cedear-name">{{ cedear.nombre }}</div>
                      <span class="cedear-category">{{ cedear.categoria }}</span>
                      <span *ngIf="cedear.personalizado" class="cedear-personalizado">Custom</span>
                    </div>
                    <span class="badge" [class.positivo]="cedear.variacion >= 0" [class.negativo]="cedear.variacion < 0">
                      {{ cedear.variacion >= 0 ? '+' : '' }}{{ cedear.variacion | number:'1.2-2' }}%
                    </span>
                  </div>
                  <div class="cedear-price">ARS {{ cedear.precioARS | number:'1.2-2' }}</div>
                  <div class="cedear-usd">USD {{ (cedear.precioARS / tipoCambioUSD) | number:'1.2-2' }}</div>
                  <div class="text-muted small mt-1 mb-3">Actualizado: {{ cedear.ultimoUpdate }}</div>
                  <button class="btn-comprar" (click)="comprarCedear(cedear)">
                    🛒 Comprar
                  </button>
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
                <span class="badge bg-primary">Fuente: CoinGecko</span>
                <small class="text-white">Actualizado: {{ horaActual }}</small>
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
                <div *ngFor="let cripto of criptosFiltrados" class="cedear-card">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div class="cedear-symbol">{{ cripto.simbolo }}</div>
                      <div class="cedear-name">{{ cripto.nombre }}</div>
                    </div>
                    <span class="badge" [class.positivo]="cripto.variacion24h >= 0" [class.negativo]="cripto.variacion24h < 0">
                      {{ cripto.variacion24h >= 0 ? '+' : '' }}{{ cripto.variacion24h | number:'1.2-2' }}%
                    </span>
                  </div>
                  <div class="cedear-price">USD {{ cripto.precioUSD | number:'1.2-2' }}</div>
                  <div class="cedear-usd" style="color: #9cdcfe;">ARS {{ (cripto.precioUSD * tipoCambioUSD) | number:'1.0-0' }}</div>
                  <div class="text-muted small mt-2 mb-3">24h Change: {{ cripto.variacion24h }}%</div>
                  <button class="btn-comprar" (click)="comprarCripto(cripto)">
                    🛒 Invertir
                  </button>
                </div>
              </div>
              
              <div *ngIf="criptosFiltrados.length === 0" class="text-center text-muted py-4">
                Cargando precios o no se encontraron resultados...
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  inversiones: Inversion[] = [];
  reportes: { [id: number]: ReporteGanancias } = {};
  preciosActual: { [id: number]: number } = {};
  reporteGeneral: boolean = false;
  mostrarApp: boolean = false;
  buttonState: string = 'idle';
  tabActiva: string = 'inversiones';
  ultimaActualizacion: string = '';
  horaActual: string = '';
  tipoCambioUSD: number = 1425;
  buscadorCedears: string = '';
  filtroCategoria: string = 'todos';
  buscadorCripto: string = '';
  nuevoCedear: NuevoCedear = { simbolo: '', nombre: '', precioARS: 0, variacion: 0 };
  nuevaCategoria: string = 'Tech';

  criptos: Cripto[] = [];
  criptosFiltrados: Cripto[] = [];

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

  ngOnInit() {
    this.tipoCambioUSD = 1425;
    this.cargarTipoCambio();
    this.obtenerDolarBlue();
    this.cargarCedearsDesdeAPI();
    this.cargarCriptosDesdeAPI();
    this.cargarCedearsPersonalizados();
    this.cargarInversiones();
    this.actualizarFecha();
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
    this.criptosFiltrados = this.criptos.filter(c => 
      c.simbolo.toLowerCase().includes(texto) || 
      c.nombre.toLowerCase().includes(texto)
    );
  }

  comprarCripto(cripto: Cripto) {
    const nueva: Inversion = {
      nombre: cripto.nombre,
      tipo: 'CRIPTO',
      cantidad: 1,
      precioCompra: cripto.precioUSD * this.tipoCambioUSD,
      fechaCompra: new Date().toISOString().split('T')[0]
    };
    
    this.inversionService.crearInversion(nueva).subscribe({
      next: () => {
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

  async obtenerDolarBlue() {
    try {
      const response = await fetch('https://api.dolarsi.com/api/v1/dolar');
      if (response.ok) {
        const data = await response.json();
        const blue = data.find((d: any) => d.casa === 'blue' || d.nombre?.toLowerCase().includes('blue'));
        if (blue && blue.venta) {
          const ventaStr = blue.venta.toString().replace(',', '.');
          const venta = parseFloat(ventaStr);
          if (!isNaN(venta) && venta > 1000) {
            this.tipoCambioUSD = Math.round(venta);
            this.guardarTipoCambio();
            this.calcularTodosLosReportes();
            this.actualizarFecha();
            return;
          }
        }
      }
    } catch (error) {
      console.log('Intentando fuente alternativa...');
    }

    try {
      const response = await fetch('https://api.bluelytics.com.ar/api/v2/latest');
      if (response.ok) {
        const data = await response.json();
        if (data.blue && data.blue.value_avg) {
          this.tipoCambioUSD = Math.round(data.blue.value_avg);
          this.guardarTipoCambio();
          this.calcularTodosLosReportes();
          this.actualizarFecha();
        }
      }
    } catch (error) {
      console.log('No se pudo obtener el dólar blue automáticamente, usando valor por defecto');
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
      const coincideCategoria = this.filtroCategoria === 'todos' || 
                               cedear.categoria.toLowerCase() === this.filtroCategoria;
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
    this.inversiones.forEach(inv => {
      const precioActual = this.preciosActual[inv.id!] || (inv.tipo === 'CEDEAR' ? this.getPrecioActualCedear(inv) : inv.precioCompra);
      if (precioActual) {
        this.calcularReporte(inv);
      }
    });
  }

  actualizarPreciosYReportes() {
    this.inversiones.forEach(inv => {
      if (inv.tipo === 'CEDEAR') {
        this.preciosActual[inv.id!] = this.getPrecioActualCedear(inv);
      }
    });
    this.calcularTodosLosReportes();
    this.reporteGeneral = this.inversiones.length > 0;
  }

  comprarCedear(cedear: Cedear) {
    const nueva: Inversion = {
      nombre: cedear.nombre,
      tipo: 'CEDEAR',
      cantidad: 1,
      precioCompra: cedear.precioARS,
      fechaCompra: new Date().toISOString().split('T')[0]
    };
    
    this.inversionService.crearInversion(nueva).subscribe({
      next: () => {
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

  crearInversion() {
    this.inversionService.crearInversion(this.nuevaInversion).subscribe({
      next: () => {
        this.cargarInversiones();
        this.nuevaInversion = this.getNuevaInversion();
      },
      error: (err) => console.error('Error creando inversión:', err)
    });
  }

  eliminarInversion(id: number) {
    this.inversionService.eliminarInversion(id).subscribe({
      next: () => this.cargarInversiones(),
      error: (err) => console.error('Error eliminando inversión:', err)
    });
  }

  get totalInvertido(): number {
    return this.inversiones.reduce((sum, inv) => sum + (inv.precioCompra * inv.cantidad), 0);
  }

  get valorActualTotal(): number {
    return this.inversiones.reduce((sum, inv) => {
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
