const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'products.json');
if (!fs.existsSync(file)) {
  console.error('products.json não encontrado em', file);
  process.exit(1);
}

const raw = fs.readFileSync(file, 'utf8');
let products;
try { products = JSON.parse(raw); } catch (e) {
  console.error('Erro ao parsear products.json:', e.message);
  process.exit(1);
}

function groupBy(keyFn) {
  const map = new Map();
  products.forEach((p, i) => {
    const k = keyFn(p) || '';
    if (!map.has(k)) map.set(k, []);
    map.get(k).push({index: i, item: p});
  });
  return map;
}

const missingImages = products.map((p,i)=>({i, title: p.title || '', image: p.image}))
  .filter(x => !x.image || String(x.image).trim() === '');

const byFinal = groupBy(p => (p.finalUrl || '').trim());
const dupFinal = [...byFinal.entries()].filter(([,arr]) => arr.length > 1);

const byOriginal = groupBy(p => (p.originalUrl || '').trim());
const dupOriginal = [...byOriginal.entries()].filter(([,arr]) => arr.length > 1);

const byTitle = groupBy(p => (p.title || '').trim().toLowerCase());
const dupTitle = [...byTitle.entries()].filter(([,arr]) => arr.length > 1);

// Report
console.log('Resumo — products.json');
console.log('Total de itens:', products.length);
console.log('Itens sem imagem (campo "image" vazio):', missingImages.length);
if (missingImages.length) {
  missingImages.slice(0,50).forEach(x => {
    console.log(`  [#${x.i}] ${x.title}`);
  });
}

function printDups(list, label) {
  console.log('');
  console.log(`Duplicados por ${label}: ${list.length}`);
  list.forEach(([key, arr]) => {
    console.log(`  ➜ chave: "${key || '<vazio>'}" — ${arr.length} ocorrências`);
    arr.forEach(a => console.log(`     [#${a.index}] ${a.item.title || '(sem título)'} — finalUrl: ${a.item.finalUrl || ''}`));
  });
}

printDups(dupFinal, 'finalUrl');
printDups(dupOriginal, 'originalUrl');
printDups(dupTitle, 'title (case-insensitive)');

// opcional: salvar relatório
const out = {
  total: products.length,
  missingImages: missingImages.map(x=>({index:x.i,title:x.title})),
  duplicates: {
    finalUrl: dupFinal.map(([k,arr])=>({key:k, items:arr.map(a=>({index:a.index,title:a.item.title,finalUrl:a.item.finalUrl}))})),
    originalUrl: dupOriginal.map(([k,arr])=>({key:k, items:arr.map(a=>({index:a.index,title:a.item.title,originalUrl:a.item.originalUrl}))})),
    title: dupTitle.map(([k,arr])=>({key:k, items:arr.map(a=>({index:a.index,title:a.item.title}))})),
  }
};
fs.writeFileSync(path.join(__dirname,'products-report.json'), JSON.stringify(out, null, 2));
console.log('\nRelatório salvo em products-report.json');
process.exit(0);