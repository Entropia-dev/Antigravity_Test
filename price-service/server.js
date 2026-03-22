const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mapa de CEDEARs con su idTitulo de IOL
// El idTitulo se obtiene de la URL del gráfico intradiario de IOL
const CEDEARS = [
  // Tech
  { simbolo: 'AAPL',  nombre: 'Apple Inc.',            categoria: 'Tech',     idTitulo: 66460 },
  { simbolo: 'GOOGL', nombre: 'Alphabet Inc.',          categoria: 'Tech',     idTitulo: 66457 },
  { simbolo: 'MSFT',  nombre: 'Microsoft Corp.',        categoria: 'Tech',     idTitulo: 1701  },
  { simbolo: 'AMZN',  nombre: 'Amazon.com Inc.',        categoria: 'Tech',     idTitulo: 94695 },
  { simbolo: 'TSLA',  nombre: 'Tesla Inc.',              categoria: 'Tech',     idTitulo: 94704 },
  { simbolo: 'META',  nombre: 'Meta Platforms',          categoria: 'Tech',     idTitulo: 94694 },
  { simbolo: 'NVDA',  nombre: 'NVIDIA Corp.',            categoria: 'Tech',     idTitulo: 94696 },
  { simbolo: 'NFLX',  nombre: 'Netflix Inc.',            categoria: 'Tech',     idTitulo: 94693 },
  { simbolo: 'INTC',  nombre: 'Intel Corp.',             categoria: 'Tech',     idTitulo: 1488  },
  { simbolo: 'AMD',   nombre: 'AMD Inc.',                categoria: 'Tech',     idTitulo: 94722 },
  { simbolo: 'CRM',   nombre: 'Salesforce Inc.',         categoria: 'Tech',     idTitulo: 94703 },
  { simbolo: 'MELI',  nombre: 'MercadoLibre Inc.',       categoria: 'Tech',     idTitulo: 66459 },
  // ETFs
  { simbolo: 'SPY',   nombre: 'SPDR S&P 500 ETF',       categoria: 'ETF',      idTitulo: 110178 },
  { simbolo: 'QQQ',   nombre: 'Invesco QQQ ETF',         categoria: 'ETF',      idTitulo: 110186 },
  // Finanzas
  { simbolo: 'JPM',   nombre: 'JPMorgan Chase',          categoria: 'Finanzas', idTitulo: 1524  },
  { simbolo: 'BAC',   nombre: 'Bank of America',         categoria: 'Finanzas', idTitulo: 151971 },
  { simbolo: 'WFC',   nombre: 'Wells Fargo',             categoria: 'Finanzas', idTitulo: 2820  },
  { simbolo: 'GS',    nombre: 'Goldman Sachs',           categoria: 'Finanzas', idTitulo: 94729 },
  { simbolo: 'V',     nombre: 'Visa Inc.',               categoria: 'Finanzas', idTitulo: 94730 },
  { simbolo: 'MA',    nombre: 'Mastercard Inc.',         categoria: 'Finanzas', idTitulo: 101542 },
  { simbolo: 'PYPL',  nombre: 'PayPal Holdings',         categoria: 'Finanzas', idTitulo: 94702 },
  // Consumo
  { simbolo: 'WMT',   nombre: 'Walmart Inc.',            categoria: 'Consumo',  idTitulo: 2827  },
  { simbolo: 'HD',    nombre: 'Home Depot',              categoria: 'Consumo',  idTitulo: 1427  },
  { simbolo: 'MCD',   nombre: "McDonald's Corp.",        categoria: 'Consumo',  idTitulo: 1641  },
  { simbolo: 'NKE',   nombre: 'Nike Inc.',               categoria: 'Consumo',  idTitulo: 1718  },
  { simbolo: 'SBUX',  nombre: 'Starbucks Corp.',         categoria: 'Consumo',  idTitulo: 2455  },
  { simbolo: 'KO',    nombre: 'Coca-Cola Co.',           categoria: 'Consumo',  idTitulo: 1533  },
  { simbolo: 'PEP',   nombre: 'PepsiCo Inc.',            categoria: 'Consumo',  idTitulo: 2116  },
  { simbolo: 'AAL',   nombre: 'American Airlines',       categoria: 'Consumo',  idTitulo: 114708 },
  // Energía
  { simbolo: 'XOM',   nombre: 'Exxon Mobil',             categoria: 'Energía',  idTitulo: 2834  },
  { simbolo: 'CVX',   nombre: 'Chevron Corp.',           categoria: 'Energía',  idTitulo: 29423 },
  { simbolo: 'TX',    nombre: 'Ternium Argentina',       categoria: 'Energía',  idTitulo: 96124 },
  // Salud
  { simbolo: 'JNJ',   nombre: 'Johnson & Johnson',       categoria: 'Salud',    idTitulo: 1520  },
  { simbolo: 'PFE',   nombre: 'Pfizer Inc.',             categoria: 'Salud',    idTitulo: 2171  },
  { simbolo: 'UNH',   nombre: 'UnitedHealth Group',      categoria: 'Salud',    idTitulo: 101547 },
  { simbolo: 'ABBV',  nombre: 'AbbVie Inc.',             categoria: 'Salud',    idTitulo: 101533 },
  { simbolo: 'MRK',   nombre: 'Merck & Co.',             categoria: 'Salud',    idTitulo: 1694  },
];

// Cache para no sobrecargar IOL
let preciosCache = [];
let ultimaActualizacionCache = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

const HEADERS_IOL = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Referer': 'https://iol.invertironline.com/',
  'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
};

/**
 * Obtiene el precio actual de un CEDEAR usando el endpoint de gráfico intradiario de IOL.
 * Retorna { precio, variacionPct } o null si falla.
 */
async function obtenerPrecioIOL(cedear) {
  try {
    // Endpoint público de IOL que retorna JSON con las operaciones del día
    const url = `https://iol.invertironline.com/Titulo/GraficoIntradiario?idTitulo=${cedear.idTitulo}&idTipo=2&idMercado=1`;
    const resp = await axios.get(url, { headers: HEADERS_IOL, timeout: 8000 });

    if (!resp.data || !Array.isArray(resp.data) || resp.data.length === 0) {
      return null;
    }

    // El último elemento es la operación más reciente → precio actual
    const operaciones = resp.data;
    const ultimo = operaciones[operaciones.length - 1];
    const primero = operaciones[0];
    const precioActual = parseFloat(ultimo.Ultima);

    if (isNaN(precioActual) || precioActual <= 0) return null;

    // Calculamos variación respecto al precio de apertura del día
    let variacionPct = 0;
    if (primero && primero.Ultima && parseFloat(primero.Ultima) > 0) {
      const apertura = parseFloat(primero.Ultima);
      variacionPct = Math.round(((precioActual - apertura) / apertura) * 10000) / 100;
    }

    return {
      precio: precioActual,
      variacion: variacionPct,
      actualizado: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch (err) {
    console.log(`[IOL] Error ${cedear.simbolo}: ${err.message}`);
    return null;
  }
}

/**
 * Actualiza el cache con todos los precios de IOL.
 * Se ejecuta de forma paralela por lotes para no sobrecargar.
 */
async function actualizarCache() {
  console.log('[Cache] Actualizando precios desde IOL...');
  const resultados = [];
  const LOTE = 5; // peticiones simultáneas por lote

  for (let i = 0; i < CEDEARS.length; i += LOTE) {
    const lote = CEDEARS.slice(i, i + LOTE);
    const promesas = lote.map(async (cedear) => {
      const datos = await obtenerPrecioIOL(cedear);
      if (datos) {
        return {
          simbolo: cedear.simbolo,
          nombre: cedear.nombre,
          categoria: cedear.categoria,
          precioARS: datos.precio,
          variacion: datos.variacion,
          ultimoUpdate: datos.actualizado,
          fuente: 'IOL',
        };
      }
      return null;
    });
    const loteResultados = await Promise.all(promesas);
    loteResultados.forEach(r => r && resultados.push(r));
    // Pequeña pausa entre lotes para no spamear IOL
    if (i + LOTE < CEDEARS.length) await new Promise(r => setTimeout(r, 300));
  }

  if (resultados.length > 0) {
    preciosCache = resultados;
    ultimaActualizacionCache = new Date();
    console.log(`[Cache] Actualizado: ${resultados.length}/${CEDEARS.length} CEDEARs obtenidos.`);
  } else {
    console.log('[Cache] No se obtuvieron precios de IOL.');
  }

  return resultados;
}

/** Retorna el cache (actualizándolo si está vencido) */
async function obtenerPrecios() {
  const ahora = Date.now();
  if (!ultimaActualizacionCache || (ahora - ultimaActualizacionCache.getTime()) > CACHE_TTL_MS) {
    await actualizarCache();
  }
  return preciosCache;
}

// Mapa de Criptomonedas para CoinGecko
const CRIPTO_IDS = 'bitcoin,ethereum,solana,litecoin,ripple,cardano,dogecoin,polkadot,tron,chainlink';
let criptoCache = [];
let ultimaCriptoUpdate = null;

async function actualizarCriptoCache() {
  try {
    console.log('[Cache] Actualizando precios de Criptomonedas desde CoinGecko...');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${CRIPTO_IDS}&vs_currencies=usd,ars&include_24hr_change=true`;
    const resp = await axios.get(url, { timeout: 10000 });
    
    if (resp.data) {
      const mapeo = {
        bitcoin: { nombre: 'Bitcoin', simbolo: 'BTC' },
        ethereum: { nombre: 'Ethereum', simbolo: 'ETH' },
        solana: { nombre: 'Solana', simbolo: 'SOL' },
        litecoin: { nombre: 'Litecoin', simbolo: 'LTC' },
        ripple: { nombre: 'Ripple', simbolo: 'XRP' },
        cardano: { nombre: 'Cardano', simbolo: 'ADA' },
        dogecoin: { nombre: 'Dogecoin', simbolo: 'DOGE' },
        polkadot: { nombre: 'Polkadot', simbolo: 'DOT' },
        tron: { nombre: 'TRON', simbolo: 'TRX' },
        chainlink: { nombre: 'Chainlink', simbolo: 'LINK' }
      };

      criptoCache = Object.keys(resp.data).map(id => ({
        id,
        nombre: mapeo[id].nombre,
        simbolo: mapeo[id].simbolo,
        precioUSD: resp.data[id].usd,
        precioARS: resp.data[id].ars,
        variacion24h: Math.round(resp.data[id].usd_24h_change * 100) / 100,
        fuente: 'CoinGecko',
        ultimoUpdate: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      }));
      ultimaCriptoUpdate = new Date();
      return criptoCache;
    }
  } catch (err) {
    console.log(`[Cripto] Error: ${err.message}`);
  }
  return criptoCache;
}

// ─── ENDPOINTS ─────────────────────────────────────────────────────────────

app.get('/api/precios', async (req, res) => {
  try {
    const precios = await obtenerPrecios();
    if (precios.length === 0) {
      return res.status(503).json({ error: 'No se pudieron obtener precios de IOL en este momento.' });
    }
    res.json(precios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/precio/:simbolo', async (req, res) => {
  try {
    const simbolo = req.params.simbolo.toUpperCase();
    const cedear = CEDEARS.find(c => c.simbolo === simbolo);
    if (!cedear) {
      return res.status(404).json({ error: `CEDEAR "${simbolo}" no encontrado.` });
    }

    const datos = await obtenerPrecioIOL(cedear);
    if (!datos) {
      return res.status(503).json({ error: `No se pudo obtener precio de ${simbolo} desde IOL.` });
    }

    res.json({
      simbolo: cedear.simbolo,
      nombre: cedear.nombre,
      categoria: cedear.categoria,
      precioARS: datos.precio,
      variacion: datos.variacion,
      ultimoUpdate: datos.actualizado,
      fuente: 'IOL',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/precios/refresh', async (req, res) => {
  try {
    ultimaActualizacionCache = null; // forzar refresco
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

app.get('/api/dolar', async (req, res) => {
  try {
    const response = await axios.get('https://api.bluelytics.com.ar/api/v2/latest', { timeout: 5000 });
    if (response.data && response.data.blue) {
      const venta = Math.round(response.data.blue.value_sell || response.data.blue.value_avg);
      return res.json({ tipoCambio: venta, fuente: 'Bluelytics' });
    }
    throw new Error('No se encontró cotización blue');
  } catch (e1) {
    try {
      const response = await axios.get('https://api.dolarsi.com/api/v1/dolar', { timeout: 5000 });
      const blue = response.data.find(d => d.casa === 'blue');
      if (blue) {
        const venta = parseFloat(blue.venta.replace(',', '.'));
        return res.json({ tipoCambio: Math.round(venta), fuente: 'DolarSi' });
      }
    } catch (e2) {}
    res.status(503).json({ error: 'No se pudo obtener el dólar blue' });
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

// ─── PERSISTENCIA DE DATOS (Fichero Local) ──────────────────────────────────
const DATA_FILE = path.join(__dirname, 'data.json');

app.get('/api/load', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      // Valor por defecto si no existe el archivo
      return res.json({ inversiones: [], nextId: 1, tipoCambioUSD: 1425 });
    }
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(rawData);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar datos desde el disco' });
  }
});

app.post('/api/save', (req, res) => {
  try {
    const data = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    res.json({ ok: true, message: 'Datos guardados correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar datos en el disco' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Price Service corriendo en http://localhost:${PORT}`);
  console.log(`   Fuente: IOL (InvertirOnline) - GraficoIntradiario`);
  console.log(`\n   Endpoints:`);
  console.log(`   GET /api/precios              → Todos los CEDEARs (cache 5min)`);
  console.log(`   GET /api/precio/:simbolo      → Un CEDEAR específico (tiempo real)`);
  console.log(`   GET /api/precios/refresh      → Forzar actualización del cache`);
  console.log(`   GET /api/dolar                → Tipo de cambio dólar blue`);
  console.log(`   GET /api/status               → Estado del cache\n`);

  // Pre-cargar cache al arrancar
  actualizarCache().catch(console.error);
  actualizarCriptoCache().catch(console.error);
});
