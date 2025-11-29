const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const IN_FILE = path.join(DIR, 'products.json');
const OUT_FILE = path.join(DIR, 'products-clean.json');
const PLACEHOLDER = 'https://via.placeholder.com/600x375/ffffff/111111?text=Sem+imagem';

if (!fs.existsSync(IN_FILE)) {
  console.error('Arquivo products.json não encontrado em', IN_FILE);
  process.exit(1);
}

const argv = require('minimist')(process.argv.slice(2));
const fill = !!argv.fill;        // --fill  -> preenche imagens vazias com placeholder
const overwrite = !!argv.overwrite; // --overwrite -> sobrescreve products.json com o resultado

let raw;
try { raw = fs.readFileSync(IN_FILE, 'utf8'); } catch (e) { console.error(e.message); process.exit(1); }
let products;
try { products = JSON.parse(raw); } catch (e) { console.error('JSON inválido:', e.message); process.exit(1); }

const seen = new Map();
const deduped = [];
const duplicates = [];

products.forEach((p, idx) => {
  const title = (p.title || '').trim().toLowerCase();
  if (title && seen.has(title)) {
    const firstIdx = seen.get(title);
    duplicates.push({title, index: idx, keptIndex: firstIdx});
  } else {
    if (title) seen.set(title, idx);
    // clone item to avoid mutating original array indices
    const item = Object.assign({}, p);
    if ((!item.image || String(item.image).trim() === '') && fill) {
      item.image = PLACEHOLDER;
    }
    deduped.push(item);
  }
});

// report
console.log('Deduplicação concluída');
console.log('Total original:', products.length);
console.log('Total após dedupe:', deduped.length);
console.log('Duplicados removidos:', duplicates.length);
if (duplicates.length) {
  console.log('\nExemplo de duplicados removidos (até 20):');
  duplicates.slice(0,20).forEach(d => console.log(`  [#${d.index}] "${d.title}" — mantido índice ${d.keptIndex}`));
}

// lista itens sem imagem após possível preenchimento
const missingAfter = deduped
  .map((p,i)=>({i, title:p.title||'', image:p.image}))
  .filter(x=>!x.image || String(x.image).trim() === '');

console.log('\nItens sem imagem após operação:', missingAfter.length);
if (missingAfter.length) missingAfter.slice(0,30).forEach(x => console.log(`  [#${x.i}] ${x.title}`));

// salva
const target = overwrite ? IN_FILE : OUT_FILE;
fs.writeFileSync(target, JSON.stringify(deduped, null, 2), 'utf8');
console.log('\nArquivo salvo em:', target);
if (!overwrite) console.log('Use --overwrite para substituir products.json');

// exit
process.exit(0);