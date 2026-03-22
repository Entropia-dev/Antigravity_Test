const axios = require('axios');

const SIMBOLOS = [
  'AAPL','GOOGL','MSFT','AMZN','TSLA','META','NVDA','NFLX','INTC','AMD',
  'CRM','SPY','QQQ','MELI','JPM','BAC','WFC','GS','V','MA',
  'PYPL','BRK.B','WMT','HD','MCD','NKE','SBUX','DIS','KO','PEP',
  'AAL','XOM','CVX','COP','GOLD','TX','PAM','JNJ','PFE','UNH','ABBV','MRK'
];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

async function getId(simbolo) {
  try {
    const url = `https://iol.invertironline.com/titulo/cotizacion/bcba/${simbolo}/cedear`;
    const resp = await axios.get(url, { headers: HEADERS, timeout: 10000 });
    const match = resp.data.match(/idtitulo=(\d+)/i);
    const id = match ? parseInt(match[1]) : null;
    console.log(`${simbolo}: ${id}`);
    return { simbolo, id };
  } catch(e) {
    console.log(`${simbolo}: ERROR - ${e.message}`);
    return { simbolo, id: null };
  }
}

async function main() {
  const resultados = [];
  // Procesar en lotes de 5
  for (let i = 0; i < SIMBOLOS.length; i += 5) {
    const lote = SIMBOLOS.slice(i, i+5);
    const res = await Promise.all(lote.map(getId));
    resultados.push(...res);
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('\n--- MAPA COMPLETO ---');
  console.log(JSON.stringify(resultados.filter(r => r.id), null, 2));
}

main();
