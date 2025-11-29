const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const IN_FILE = path.join(DIR, 'products.json');
const OUT_FILE = path.join(DIR, 'products-updated.json');

// imagem fornecida
const IPHONE_IMG = 'https://m.media-amazon.com/images/I/41RpmPYWXLL._AC_SX342_SY445_QL70_ML2_.jpg';

if (!fs.existsSync(IN_FILE)) {
  console.error('products.json não encontrado em', IN_FILE);
  process.exit(1);
}

let raw;
try { raw = fs.readFileSync(IN_FILE, 'utf8'); } catch (e) { console.error(e.message); process.exit(1); }
let products;
try { products = JSON.parse(raw); } catch (e) { console.error('JSON inválido:', e.message); process.exit(1); }

let updated = 0;
products.forEach((p, idx) => {
  const title = (p.title || '').toLowerCase();
  if (title.includes('iphone 15')) {
    if (!p.image || String(p.image).trim() === '') {
      p.image = IPHONE_IMG;
      updated++;
      console.log(`Atualizado imagem em índice [#${idx}] -> "${p.title}"`);
    } else {
      console.log(`Já possui imagem em índice [#${idx}] -> "${p.title}"`);
    }
  }
});

fs.writeFileSync(OUT_FILE, JSON.stringify(products, null, 2), 'utf8');
console.log(`\nConcluído. Imagens atualizadas: ${updated}`);
console.log(`Arquivo salvo em: ${OUT_FILE}`);
console.log('Se quiser sobrescrever o products.json original, substitua manualmente ou execute um mv.');