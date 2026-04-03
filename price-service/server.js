const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mapa masivo de CEDEARs
const CEDEARS = [
  { simbolo: 'AAPL', nombre: 'Apple Inc.', categoria: 'Tech' },
  { simbolo: 'GOOGL', nombre: 'Alphabet Inc.', categoria: 'Tech' },
  { simbolo: 'MSFT', nombre: 'Microsoft Corp.', categoria: 'Tech' },
  { simbolo: 'AMZN', nombre: 'Amazon.com Inc.', categoria: 'Tech' },
  { simbolo: 'TSLA', nombre: 'Tesla Inc.', categoria: 'Tech' },
  { simbolo: 'META', nombre: 'Meta Platforms', categoria: 'Tech' },
  { simbolo: 'NVDA', nombre: 'NVIDIA Corp.', categoria: 'Tech' },
  { simbolo: 'NFLX', nombre: 'Netflix Inc.', categoria: 'Tech' },
  { simbolo: 'INTC', nombre: 'Intel Corp.', categoria: 'Tech' },
  { simbolo: 'AMD', nombre: 'AMD Inc.', categoria: 'Tech' },
  { simbolo: 'CRM', nombre: 'Salesforce Inc.', categoria: 'Tech' },
  { simbolo: 'MELI', nombre: 'MercadoLibre Inc.', categoria: 'Tech' },
  { simbolo: 'SPY', nombre: 'SPDR S&P 500 ETF', categoria: 'ETF' },
  { simbolo: 'QQQ', nombre: 'Invesco QQQ ETF', categoria: 'ETF' },
  { simbolo: 'DIA', nombre: 'SPDR Dow Jones', categoria: 'ETF' },
  { simbolo: 'JPM', nombre: 'JPMorgan Chase', categoria: 'Finanzas' },
  { simbolo: 'BAC', nombre: 'Bank of America', categoria: 'Finanzas' },
  { simbolo: 'WFC', nombre: 'Wells Fargo', categoria: 'Finanzas' },
  { simbolo: 'GS', nombre: 'Goldman Sachs', categoria: 'Finanzas' },
  { simbolo: 'V', nombre: 'Visa Inc.', categoria: 'Finanzas' },
  { simbolo: 'MA', nombre: 'Mastercard Inc.', categoria: 'Finanzas' },
  { simbolo: 'PYPL', nombre: 'PayPal Holdings', categoria: 'Finanzas' },
  { simbolo: 'WMT', nombre: 'Walmart Inc.', categoria: 'Consumo' },
  { simbolo: 'HD', nombre: 'Home Depot', categoria: 'Consumo' },
  { simbolo: 'MCD', nombre: "McDonald's Corp.", categoria: 'Consumo' },
  { simbolo: 'NKE', nombre: 'Nike Inc.', categoria: 'Consumo' },
  { simbolo: 'SBUX', nombre: 'Starbucks Corp.', categoria: 'Consumo' },
  { simbolo: 'KO', nombre: 'Coca-Cola Co.', categoria: 'Consumo' },
  { simbolo: 'PEP', nombre: 'PepsiCo Inc.', categoria: 'Consumo' },
  { simbolo: 'AAL', nombre: 'American Airlines', categoria: 'Consumo' },
  { simbolo: 'XOM', nombre: 'Exxon Mobil', categoria: 'Energía' },
  { simbolo: 'CVX', nombre: 'Chevron Corp.', categoria: 'Energía' },
  { simbolo: 'TX', nombre: 'Ternium Argentina', categoria: 'Energía' },
  { simbolo: 'JNJ', nombre: 'Johnson & Johnson', categoria: 'Salud' },
  { simbolo: 'PFE', nombre: 'Pfizer Inc.', categoria: 'Salud' },
  { simbolo: 'UNH', nombre: 'UnitedHealth Group', categoria: 'Salud' },
  { simbolo: 'ABBV', nombre: 'AbbVie Inc.', categoria: 'Salud' },
  { simbolo: 'MRK', nombre: 'Merck & Co.', categoria: 'Salud' },
  { simbolo: 'BABA', nombre: 'Alibaba Group', categoria: 'Tech' },
  { simbolo: 'DIS', nombre: 'Walt Disney', categoria: 'Consumo' },
  { simbolo: 'GOLD', nombre: 'Barrick Gold Corp', categoria: 'Materiales' },
  { simbolo: 'BA', nombre: 'Boeing Co', categoria: 'Consumo' }
];

let preciosCache = [];
let ultimaActualizacionCache = null;
const CACHE_TTL_MS = 30 * 1000;

async function actualizarCache() {
  console.log('[Cache] Actualizando precios desde Yahoo Finance...');
  const resultados = [];
  try {
    const simbolosQuery = CEDEARS.map(c => `${c.simbolo}.BA`);
    const quotes = await yahooFinance.quote(simbolosQuery);
    const arrayQuotes = Array.isArray(quotes) ? quotes : [quotes];

    for (const quote of arrayQuotes) {
      if (!quote || !quote.symbol) continue;

      const localSimbolo = quote.symbol.split('.')[0];
      const cedear = CEDEARS.find(c => c.simbolo === localSimbolo);
      
      if (cedear && quote.regularMarketPrice) {
        resultados.push({
          simbolo: localSimbolo,
          nombre: cedear.nombre,
          categoria: cedear.categoria,
          precioARS: quote.regularMarketPrice,
          variacion: quote.regularMarketChangePercent ? parseFloat(quote.regularMarketChangePercent.toFixed(2)) : 0,
          ultimoUpdate: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
          fuente: 'Yahoo Finance'
        });
      }
    }
  } catch (err) {
    console.log(`[Yahoo Finance] Error en quotes: ${err.message}`);
  }

  if (resultados.length > 0) {
    preciosCache = resultados;
    ultimaActualizacionCache = new Date();
    console.log(`[Cache] Actualizado: ${resultados.length}/${CEDEARS.length} CEDEARs de Yahoo.`);
  }
  return resultados;
}

async function obtenerPrecios() {
  const ahora = Date.now();
  if (!ultimaActualizacionCache || (ahora - ultimaActualizacionCache.getTime()) > CACHE_TTL_MS) {
    await actualizarCache();
  }
  return preciosCache;
}

const CRIPTO_ASSETS = [
  { simbolo: 'BTC', parBinance: 'BTCUSDT', nombre: 'Bitcoin' },
  { simbolo: 'ETH', parBinance: 'ETHUSDT', nombre: 'Ethereum' },
  { simbolo: 'SOL', parBinance: 'SOLUSDT', nombre: 'Solana' },
  { simbolo: 'BNB', parBinance: 'BNBUSDT', nombre: 'Binance Coin' },
  { simbolo: 'ADA', parBinance: 'ADAUSDT', nombre: 'Cardano' },
  { simbolo: 'XRP', parBinance: 'XRPUSDT', nombre: 'Ripple' },
  { simbolo: 'DOT', parBinance: 'DOTUSDT', nombre: 'Polkadot' },
  { simbolo: 'DOGE', parBinance: 'DOGEUSDT', nombre: 'Dogecoin' },
  { simbolo: 'AVAX', parBinance: 'AVAXUSDT', nombre: 'Avalanche' },
  { simbolo: 'LINK', parBinance: 'LINKUSDT', nombre: 'Chainlink' },
  { simbolo: 'MATIC', parBinance: 'MATICUSDT', nombre: 'Polygon' },
  { simbolo: 'NEXO', parBinance: 'NEXOUSDT', nombre: 'Nexo' },
  { simbolo: 'USDC', parBinance: 'USDCUSDT', nombre: 'USD Coin' },
  { simbolo: 'USDT', parBinance: 'USDTUSDT', nombre: 'Tether USDT' } // Se maneja especialmente abajo
];

let criptoCache = [];
let ultimaCriptoUpdate = null;

async function actualizarCriptoCache() {
  try {
    console.log('[Cache] Actualizando precios de Criptomonedas (Binance + DolarAPI)...');
    const binanceResp = await axios.get('https://api.binance.com/api/v3/ticker/24hr', { timeout: 10000 });
    const tickersMap = {};
    if (binanceResp.data && Array.isArray(binanceResp.data)) {
        binanceResp.data.forEach(t => { tickersMap[t.symbol] = t; });
    }

    let dolarCrypto = 0;
    try {
        const dResp = await axios.get('https://dolarapi.com/v1/dolares/cripto', { timeout: 5000 });
        if (dResp.data && dResp.data.venta) dolarCrypto = dResp.data.venta;
    } catch (e) {
        console.log('[Cripto] DolarAPI falló.');
        // No inventamos precio, dejamos que el sistema maneje el error
    }

    const resultados = [];
    for (const c of CRIPTO_ASSETS) {
        let pxUsd = 1; // Para USDT o en caso de error mínimo 1:1
        let var24h = 0;

        if (c.simbolo === 'USDT') {
            pxUsd = 1;
        } else {
            const ticker = tickersMap[c.parBinance];
            if (ticker) {
                pxUsd = parseFloat(ticker.lastPrice);
                var24h = parseFloat(ticker.priceChangePercent);
            } else {
                continue; // no lo encontró en Binance, saltar
            }
        }
        
        resultados.push({
            id: c.nombre.toLowerCase(),
            nombre: c.nombre,
            simbolo: c.simbolo,
            precioUSD: pxUsd,
            precioARS: pxUsd * dolarCrypto,
            variacion24h: Math.round(var24h * 100) / 100,
            fuente: c.simbolo === 'USDT' ? 'Pegged' : 'Binance',
            ultimoUpdate: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        });
    }

    if (resultados.length > 0) {
        criptoCache = resultados;
        ultimaCriptoUpdate = new Date();
    }
    return criptoCache;
  } catch (err) {
    console.log(`[Cripto] Error Binance: ${err.message}`);
  }
  return criptoCache;
}

// ─── ENDPOINTS ─────────────────────────────────────────────────────────────

app.get('/api/precios', async (req, res) => {
  try {
    const precios = await obtenerPrecios();
    if (precios.length === 0) return res.status(503).json({ error: 'Fallo al obtener precios (Yahoo)' });
    res.json(precios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/precio/:simbolo', async (req, res) => {
  try {
    const simbolo = req.params.simbolo.toUpperCase();
    const precios = await obtenerPrecios();
    const arrPrecios = Array.isArray(precios) ? precios : [];
    const item = arrPrecios.find(p => p.simbolo === simbolo);
    
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: `CEDEAR "${simbolo}" no encontrado.` });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/precios/refresh', async (req, res) => {
  try {
    ultimaActualizacionCache = null;
    const precios = await actualizarCache();
    await actualizarCriptoCache();
    res.json({ ok: true, actualizados: precios.length, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cripto', async (req, res) => {
  try {
    const ahora = Date.now();
    if (!ultimaCriptoUpdate || (ahora - ultimaCriptoUpdate.getTime()) > CACHE_TTL_MS) {
      await actualizarCriptoCache();
    }
    res.json(criptoCache);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const cheerio = require('cheerio');

app.get('/api/dolar', async (req, res) => {
  try {
    // 1. Intentamos Scrapear DolarHoy (Más preciso para el Blue)
    try {
      const respDH = await axios.get('https://dolarhoy.com/', { timeout: 4000 });
      const $ = cheerio.load(respDH.data);
      const ventaBlue = $('.tile.dolarblue .venta .val').text().trim().replace('$', '');
      
      if (ventaBlue && !isNaN(parseInt(ventaBlue))) {
        const precio = parseInt(ventaBlue);
        console.log(`[Dolar] Obtenido de DolarHoy: ${precio}`);
        return res.json({ tipoCambio: precio, fuente: 'DolarHoy (Web Scraping)' });
      }
    } catch (errDH) {
      console.log('[Dolar] DolarHoy falló o dio timeout, saltando a DolarAPI...');
    }

    // 2. Fallback a DolarAPI (Muy estable)
    const dResp = await axios.get('https://dolarapi.com/v1/dolares/blue', { timeout: 5000 });
    if (dResp.data && dResp.data.venta) {
      return res.json({ tipoCambio: Math.round(dResp.data.venta), fuente: 'DolarAPI (Blue)' });
    }
    throw new Error('Ninguna fuente de dólar respondió.');
  } catch (err) {
    res.status(503).json({ error: 'No se pudo obtener el Dólar Blue.' });
  }
});

app.get('/api/dolares/todos', async (req, res) => {
  try {
    const resp = await axios.get('https://dolarapi.com/v1/dolares', { timeout: 6000 });
    if (resp.data && Array.isArray(resp.data)) {
      // Nos aseguramos de que los nombres de los campos coincidan con el frontend
      const resultados = resp.data.map(d => ({
        nombre: d.nombre || 'Dólar',
        compra: d.compra || 0,
        venta: d.venta || 0,
        fechaActualizacion: d.fechaActualizacion || d.fecha || new Date().toISOString()
      }));
      res.json(resultados);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.log('[Dolares-Todos] Error:', err.message);
    res.json([]); // Para que no rompa el frontend, devolvemos array vacío si falla todo
  }
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    cedears: CEDEARS.length,
    cache: {
      entries: preciosCache.length,
      lastUpdate: ultimaActualizacionCache ? ultimaActualizacionCache.toISOString() : null,
      ttlMs: CACHE_TTL_MS,
    }
  });
});

// ─── PERSISTENCIA LOCAL ────────────────────────────────────────────────────
const DATA_FILE = path.join(__dirname, 'data.json');

app.get('/api/load', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.json({ inversiones: [], nextId: 1, tipoCambioUSD: 1425 });
    }
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(rawData));
  } catch (err) {
    res.status(500).json({ error: 'Error load disk' });
  }
});

app.post('/api/save', (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error save disk' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Price Service corriendo en http://localhost:${PORT}`);
  console.log(`   Fuentes: Yahoo Finance (.BA) | Binance Public API | DolarAPI`);
  console.log(`\n   Endpoints disponibles:`);
  console.log(`   GET /api/precios          → Todos los CEDEARs (${CEDEARS.length} listados)`);
  console.log(`   GET /api/cripto           → Todas las Crypto-Monedas (en USD/ARS)`);
  console.log(`   GET /api/dolar            → Cotización Dólar MEP`);
  console.log(`   GET /api/precios/refresh  → Limpiar y recargar caché\n`);

  // Pre-carga
  actualizarCache().catch(console.error);
  actualizarCriptoCache().catch(console.error);
});
