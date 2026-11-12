/* Revisión visual de Break en Chromium (Playwright).

   node test/visual.js shots [carpeta]     capturas del estudio y de las apps de ejemplo
   node test/visual.js base [carpeta]      guarda la línea base de las apps de ejemplo
   node test/visual.js compare [carpeta]   compara con la línea base; termina en error si cambia algún píxel
   node test/visual.js overflow            busca desbordes horizontales del estudio a 390 px

   Antes hay que generar las apps con `npm run demos`. La carpeta por defecto es dist/shots
   (los .png no se suben al repositorio). La hora queda fija y el movimiento reducido para que
   dos corridas den exactamente la misma imagen. */
const fs = require('fs');
const path = require('path');

let chromium;
try { chromium = require('playwright').chromium; } catch (e) {
  console.error('Falta Playwright. Instálalo con: npm install --no-save playwright && npx playwright install chromium');
  process.exit(2);
}

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const STUDIO = 'file://' + path.join(DIST, 'break-studio.html');
const NOW = new Date('2026-11-06T15:30:00Z'); // viernes 10:30 a. m. en Colombia
const TABS = ['estilo', 'modulos', 'carta', 'datos', 'publicar'];

const mode = process.argv[2] || 'shots';
const dir = path.resolve(process.argv[3] || path.join(DIST, 'shots'));

function demos() {
  const list = fs.readdirSync(DIST).filter(f => /^demo-.+\.html$/.test(f)).sort();
  if (!list.length) { console.error('No hay apps en dist/. Corre primero: npm run demos'); process.exit(2); }
  return list.map(f => ({ name: f.replace(/\.html$/, ''), url: 'file://' + path.join(DIST, f) }));
}

async function open(browser, url, o) {
  o = o || {};
  const ctx = await browser.newContext({
    viewport: { width: o.width || 390, height: o.height || 844 }, deviceScaleFactor: 1,
    colorScheme: o.dark ? 'dark' : 'light', reducedMotion: o.motion ? 'no-preference' : 'reduce',
    timezoneId: 'America/Bogota', locale: 'es-CO'
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.clock.setFixedTime(NOW);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(o.wait || 500);
  return { ctx, page, errors };
}

async function fullShot(page) {
  /* Carga las imágenes diferidas sin desplazar la página: desplazarla activa el seguimiento
     de categorías de la carta y la captura dejaría de ser repetible. */
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img[loading="lazy"]'));
    imgs.forEach(i => { i.loading = 'eager'; });
    await Promise.all(imgs.map(i => (i.decode ? i.decode() : Promise.resolve()).catch(() => {})));
  });
  await page.waitForTimeout(150);
  return page.screenshot({ fullPage: true });
}

async function overflowOf(page, scope) {
  return page.evaluate(sel => {
    const W = document.documentElement.clientWidth, out = [];
    document.querySelectorAll(sel).forEach(el => {
      const b = el.getBoundingClientRect();
      if (b.width && b.right > W + 0.5 && !el.closest('.tabs,.tpls,.chips,.rail,.subnav')) out.push(el.tagName.toLowerCase() + '.' + String(el.className).split(' ').join('.') + ' → ' + Math.round(b.right) + ' px');
    });
    return { extra: document.documentElement.scrollWidth - W, out: out.slice(0, 5) };
  }, scope);
}

/* Diferencia de píxeles entre dos PNG, calculada en un lienzo del navegador. */
async function pixelDiff(browser, a, b) {
  const page = await browser.newPage();
  const res = await page.evaluate(async ([x, y]) => {
    const load = src => new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = 'data:image/png;base64,' + src; });
    const [ia, ib] = await Promise.all([load(x), load(y)]);
    if (ia.width !== ib.width || ia.height !== ib.height) return { size: ia.width + '×' + ia.height + ' contra ' + ib.width + '×' + ib.height };
    const data = im => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0); return g.getImageData(0, 0, im.width, im.height).data; };
    const da = data(ia), db = data(ib);
    let n = 0, top = -1, bottom = -1;
    for (let i = 0; i < da.length; i += 4) {
      if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2]) { n++; const row = Math.floor(i / 4 / ia.width); if (top < 0) top = row; bottom = row; }
    }
    return { n, top, bottom };
  }, [a.toString('base64'), b.toString('base64')]);
  await page.close();
  return res;
}

(async () => {
  const browser = await chromium.launch();
  let failed = false;

  if (mode === 'base' || mode === 'compare') {
    const baseDir = path.join(dir, 'base'), nowDir = path.join(dir, 'actual');
    fs.mkdirSync(mode === 'base' ? baseDir : nowDir, { recursive: true });
    const capture = async d => {
      const { ctx, page, errors } = await open(browser, d.url);
      const png = await fullShot(page);
      await ctx.close();
      if (errors.length) { failed = true; console.log('✗ ' + d.name + ': ' + errors.join(' | ')); }
      return png;
    };
    /* Chromium a veces dibuja distinto una fuente variable en negrita sin que cambie nada.
       La línea base es una captura que se repite, y un cambio solo cuenta si se mantiene en tres intentos. */
    for (const d of demos()) {
      if (mode === 'base') {
        let png = await capture(d), steady = false;
        for (let i = 0; i < 3 && !steady; i++) { const again = await capture(d); steady = again.equals(png); png = again; }
        fs.writeFileSync(path.join(baseDir, d.name + '.png'), png);
        console.log('línea base · ' + d.name + (steady ? '' : ' (no se repitió igual: revísala)'));
        continue;
      }
      const basePath = path.join(baseDir, d.name + '.png');
      let png = await capture(d);
      if (!fs.existsSync(basePath)) { fs.writeFileSync(path.join(nowDir, d.name + '.png'), png); console.log('· ' + d.name + ': sin línea base (app nueva)'); continue; }
      const base = fs.readFileSync(basePath);
      for (let i = 0; i < 2 && !base.equals(png); i++) png = await capture(d);
      fs.writeFileSync(path.join(nowDir, d.name + '.png'), png);
      if (base.equals(png)) { console.log('✓ ' + d.name + ': idéntica'); continue; }
      const r = await pixelDiff(browser, base, png);
      if (r.size) { failed = true; console.log('✗ ' + d.name + ': cambió de tamaño (' + r.size + ')'); }
      else if (r.n) { failed = true; console.log('✗ ' + d.name + ': ' + r.n + ' píxeles distintos entre las filas ' + r.top + ' y ' + r.bottom); }
      else console.log('✓ ' + d.name + ': idéntica');
    }
  } else if (mode === 'overflow') {
    const { ctx, page, errors } = await open(browser, STUDIO, { wait: 900 });
    const report = async label => { const r = await overflowOf(page, '.editor *, .ssheet *'); if (r.extra > 0 || r.out.length) { failed = true; console.log('✗ ' + label + ': ' + r.extra + ' px · ' + r.out.join(' | ')); } else console.log('✓ ' + label); };
    const ids = await page.evaluate(() => Array.from(document.querySelectorAll('[data-a="open-tpl"]')).map(b => b.getAttribute('data-id')));
    for (const id of ids) {
      await page.click('[data-a="tab"][data-t="vista"]'); await page.waitForTimeout(150);
      await page.click('[data-a="open-tpl"][data-id="' + id + '"]'); await page.waitForTimeout(350);
      for (const t of TABS) { await page.click('[data-a="tab"][data-t="' + t + '"]'); await page.waitForTimeout(200); await report(id + ' · ' + t); }
      await page.click('[data-a="tab"][data-t="modulos"]'); await page.waitForTimeout(150);
      const mids = await page.evaluate(() => Array.from(document.querySelectorAll('[data-a="mod-open"]')).map(b => b.getAttribute('data-mid')));
      for (const mid of mids) {
        await page.click('[data-a="mod-open"][data-mid="' + mid + '"]'); await page.waitForTimeout(120);
        await report(id + ' · módulo ' + mid);
        await page.click('[data-a="mod-open"][data-mid="' + mid + '"]'); await page.waitForTimeout(60);
      }
    }
    await page.click('[data-a="mod-add"]'); await page.waitForTimeout(250); await report('catálogo de módulos');
    if (errors.length) { failed = true; console.log('✗ errores de script: ' + errors.join(' | ')); }
    await ctx.close();
  } else {
    fs.mkdirSync(dir, { recursive: true });
    const save = (name, buf) => { fs.writeFileSync(path.join(dir, name + '.png'), buf); console.log(name + '.png'); };
    for (const dark of [false, true]) {
      const { ctx, page, errors } = await open(browser, STUDIO, { width: 1360, height: 900, dark, wait: 1200 });
      save('estudio-escritorio' + (dark ? '-oscuro' : ''), await page.screenshot());
      if (errors.length) { failed = true; console.log('✗ estudio: ' + errors.join(' | ')); }
      await ctx.close();
    }
    {
      const { ctx, page } = await open(browser, STUDIO, { wait: 900 });
      for (const t of TABS) { await page.click('[data-a="tab"][data-t="' + t + '"]'); await page.waitForTimeout(300); save('estudio-celular-' + t, await page.screenshot({ fullPage: true })); }
      await ctx.close();
    }
    for (const d of demos()) {
      const { ctx, page, errors } = await open(browser, d.url);
      save(d.name, await fullShot(page));
      const r = await overflowOf(page, 'body *');
      if (r.extra > 0) { failed = true; console.log('✗ ' + d.name + ': desborde horizontal de ' + r.extra + ' px'); }
      if (errors.length) { failed = true; console.log('✗ ' + d.name + ': ' + errors.join(' | ')); }
      await ctx.close();
    }
    console.log('Capturas en ' + dir);
  }

  await browser.close();
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('ERROR', e); process.exit(1); });
