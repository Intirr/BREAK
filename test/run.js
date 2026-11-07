/* Pruebas de Break: motor de apps + estudio completo, en jsdom. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let pass = 0, fail = 0;
const results = [];
function ok(cond, name) { if (cond) { pass++; } else { fail++; results.push('✗ ' + name); } }
function eq(a, b, name) { ok(a === b, name + ' → obtuve ' + JSON.stringify(a) + ', esperaba ' + JSON.stringify(b)); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
const { VirtualConsole } = require('jsdom');
function quietConsole() { const vc = new VirtualConsole(); vc.on('jsdomError', e => { if (!/Not implemented/.test(e.message)) console.error('jsdom:', e.message); }); vc.on('error', m => console.error('consola:', m)); return vc; }

const SRC = f => fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(SRC('runtime.js') + '\n' + SRC('templates.js') + '\n' + SRC('catalog.js') + '\n;this.breakApp=breakApp;this.TEMPLATES=TEMPLATES;this.blankApp=blankApp;this.SKINS=SKINS;this.MODULES=MODULES;', ctx);
const TPL = id => JSON.parse(JSON.stringify(ctx.TEMPLATES.find(t => t.id === id)));

/* Monta una app con el motor serializado (prueba que es autocontenido). */
function mount(cfg, o) {
  o = o || {};
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { pretendToBeVisual: true, runScripts: 'outside-only', url: 'https://demo.pages.dev/', virtualConsole: quietConsole() });
  const w = dom.window;
  Object.defineProperty(w.navigator, 'language', { value: o.lang || 'es-CO', configurable: true });
  w.matchMedia = q => ({ matches: /reduce/.test(q) ? !!o.reduce : false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  w.scrollTo = () => {};
  const errors = [];
  w.addEventListener('error', e => errors.push(e.message));
  w.__cfg = cfg;
  const rt = w.eval('(' + ctx.breakApp.toString() + ')(window, document, window.__cfg, ' + JSON.stringify({ mode: o.mode || 'app', now: o.now }) + ')');
  const d = w.document;
  const $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
  const click = el => { if (!el) throw new Error('no existe el elemento a tocar'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
  const type = (el, v) => { el.value = v; el.dispatchEvent(new w.Event('input', { bubbles: true })); };
  const submit = f => f.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  return { dom, w, d, rt, $, $$, click, type, submit, errors, close() { rt.destroy(); w.close(); } };
}
const itemsIn = cfg => cfg.menu.categories.reduce((a, c) => a + c.items.length, 0);

(async function () {
  /* 1. Las tres apps renderizan completas */
  for (const id of ['tpl-araucaria', 'tpl-antojo', 'tpl-zocalo']) {
    const cfg = TPL(id);
    const A = mount(cfg, { now: '2026-11-06T15:30:00Z' });
    eq(A.$$('section[data-mid]').length, cfg.modules.length, id + ': una sección por módulo');
    eq(A.$$('.it').length, itemsIn(cfg), id + ': todos los platos en la carta');
    eq(A.$('.app').getAttribute('data-skin'), cfg.theme.skin, id + ': estética aplicada');
    ok(A.d.getElementById('bk-fonts').href.includes('fonts.googleapis.com/css2?family='), id + ': fuentes de Google');
    ok(!A.$('.pv-empty'), id + ': sin avisos de vista previa en modo app');
    eq(A.errors.length, 0, id + ': sin errores de script');
    A.close();
  }

  /* 2. Precios */
  {
    const A = mount(TPL('tpl-araucaria'), { now: '2026-11-06T15:30:00Z' });
    eq(A.$('.it .price').textContent, '26', 'Araucaria: precio en miles (26)');
    A.close();
    const B = mount(TPL('tpl-antojo'), { now: '2026-11-06T15:30:00Z' });
    eq(B.$('.it .price').textContent, '$15.900', 'Antojo: precio completo ($15.900)');
    B.close();
  }

  /* 3. Abierto / cerrado en hora de Colombia */
  {
    const st = (cfg, now) => { const A = mount(cfg, { now }); const t = A.rt._status(); A.close(); return t; };
    const ar = TPL('tpl-araucaria');
    let s = st(ar, '2026-11-09T15:00:00Z'); // lunes 10:00 a. m. (cerrado los lunes)
    eq(s.text, 'Cerrado · abre mañana a las 12:00 p. m.', 'lunes cerrado → abre el martes');
    s = st(ar, '2026-11-07T03:30:00Z'); // viernes 10:30 p. m.
    eq(s.open, true, 'viernes 10:30 p. m. abierto'); eq(s.text, 'Abierto ahora · cierra a las 11:00 p. m.', 'texto de cierre');
    s = st(ar, '2026-11-08T04:30:00Z'); // sábado 11:30 p. m.
    eq(s.text, 'Cerrado · abre mañana a las 12:00 p. m.', 'sábado tarde → domingo');
    s = st(ar, '2026-11-08T23:00:00Z'); // domingo 6:00 p. m.
    eq(s.text, 'Cerrado · abre el martes a las 12:00 p. m.', 'domingo noche → martes (salta el lunes)');
    const night = TPL('tpl-antojo');
    night.brand.hours = night.brand.hours.map(h => h.d === 5 ? { d: 5, open: '20:00', close: '02:00', closed: false } : { d: h.d, open: '', close: '', closed: true });
    s = st(night, '2026-11-07T06:00:00Z'); // sábado 1:00 a. m.
    eq(s.open, true, 'horario que pasa la medianoche sigue abierto a la 1 a. m.');
    const zo = TPL('tpl-zocalo');
    const Z = mount(zo, { now: '2026-11-06T15:30:00Z' });
    ok(/Abierto ahora/.test(Z.$('.hero-st').textContent), 'zona horaria fija: un celular en otra zona ve la hora de Colombia');
    Z.close();
  }

  /* 4. Pedido por WhatsApp */
  {
    const cfg = TPL('tpl-antojo');
    const A = mount(cfg, { now: '2026-11-06T15:30:00Z' });
    ok(A.$('.fab').hidden, 'sin productos el botón de pedido está oculto');
    A.click(A.$('.add[data-id="malt-arequipe"]'));
    A.click(A.$('.add[data-id="malt-arequipe"]'));
    A.click(A.$('.add[data-id="waffle-antojo"]'));
    eq(A.$('.fab .fab-n').textContent, '3', 'contador del pedido');
    eq(A.$('.fab .fab-t').textContent, '$51.700', 'subtotal del pedido');
    eq(A.$('.add[data-id="malt-arequipe"] .q').textContent, '2', 'insignia de cantidad en el plato');
    A.click(A.$('.fab'));
    ok(A.$('.app').classList.contains('sheet-open'), 'abre la hoja del pedido');
    eq(A.$$('.lines li').length, 2, 'dos líneas en el pedido');
    A.click(A.$('[data-act="mode"][data-m="domicilio"]'));
    A.submit(A.$('form[data-form="order"]'));
    eq(A.$('[data-err="order"]').textContent, 'Escribe tu nombre.', 'valida el nombre');
    A.type(A.$('[data-bind="order.name"]'), 'Laura');
    A.type(A.$('[data-bind="order.address"]'), 'Calle 14 # 15-20');
    A.click(A.$('[data-act="pay"][data-v="Nequi"]'));
    A.submit(A.$('form[data-form="order"]'));
    const msg = A.$('.wa-msg').textContent;
    ok(msg.startsWith('Hola, Antojo. Quiero hacer este pedido:'), 'saludo del pedido');
    ok(msg.includes('• 2 × Malteada de arequipe — $31.800'), 'línea con cantidad y total');
    ok(msg.includes('Domicilio: $3.000') && msg.includes('Total: $54.700'), 'domicilio y total');
    ok(msg.includes('Entrega: Domicilio') && msg.includes('Dirección de entrega: Calle 14 # 15-20') && msg.includes('Forma de pago: Nequi'), 'datos de entrega');
    ok(!A.$('a[href^="https://wa.me/"]') && /no tiene WhatsApp/.test(A.$('.note').textContent), 'sin número: muestra el mensaje y no un enlace roto');
    cfg.brand.whatsapp = '573001234567';
    A.rt.update(cfg);
    A.click(A.$('.fab'));
    A.submit(A.$('form[data-form="order"]'));
    const a = A.$('a[href^="https://wa.me/573001234567?text="]');
    ok(!!a, 'con número: enlace directo a WhatsApp');
    ok(a && decodeURIComponent(a.href.split('text=')[1]).includes('Malteada de arequipe'), 'el enlace lleva el pedido');
    A.click(A.$('.fab')); A.click(A.$('[data-act="clear-cart"]'));
    ok(A.$('.fab').hidden, 'vaciar el pedido');
    A.click(A.$('.add[data-id="tinto"]'));
    A.click(A.$('.fab')); A.click(A.$('[data-act="mode"][data-m="domicilio"]'));
    A.type(A.$('[data-bind="order.address"]'), 'Cra 15'); A.submit(A.$('form[data-form="order"]'));
    eq(A.$('[data-err="order"]').textContent, 'El pedido mínimo para domicilio es $15.000.', 'pedido mínimo de domicilio');
    A.click(A.$('[data-act="mode"][data-m="mesa"]'));
    A.type(A.$('[data-bind="order.table"]'), '7'); A.submit(A.$('form[data-form="order"]'));
    ok(A.$('.wa-msg').textContent.includes('Entrega: En la mesa 7'), 'pedido en la mesa');
    A.close();
  }

  /* 5. Reservas (trato de usted) */
  {
    const A = mount(TPL('tpl-araucaria'), { now: '2026-11-06T15:30:00Z' });
    const f = A.$('form[data-form="res"]');
    A.submit(f);
    eq(A.$('[data-err="res"]').textContent, 'Elija la fecha.', 'trato de usted en los errores');
    A.type(A.$('[data-bind="res.date"]'), '2026-11-13');
    A.click(A.$('[data-act="res-slot"][data-v="20:00"]'));
    A.click(A.$('[data-act="res-ppl"][data-d="1"]'));
    A.click(A.$('[data-act="res-occ"][data-v="Aniversario"]'));
    A.type(A.$('[data-bind="res.name"]'), 'Laura Gómez');
    A.submit(A.$('form[data-form="res"]'));
    const msg = A.$('.wa-msg').textContent;
    ok(msg.startsWith('Hola, Araucaria. Quisiera reservar una mesa:'), 'saludo de la reserva');
    ok(/Fecha: viernes,? 13 de noviembre/.test(msg), 'fecha en español: ' + msg.split('\n')[1]);
    ok(msg.includes('Hora: 8:00 p. m.') && msg.includes('Personas: 3') && msg.includes('Ocasión: Aniversario') && msg.includes('A nombre de: Laura Gómez'), 'datos de la reserva');
    A.close();
  }

  /* 6. Tarjeta de sellos */
  {
    const A = mount(TPL('tpl-antojo'), { now: '2026-11-06T15:30:00Z' });
    const stamp = () => { A.click(A.$('[data-act="stamp"]')); '2468'.split('').forEach(k => A.click(A.$('.keypad [data-k="' + k + '"]'))); };
    A.click(A.$('[data-act="stamp"]'));
    '1111'.split('').forEach(k => A.click(A.$('.keypad [data-k="' + k + '"]')));
    eq(A.$('[data-err="pin"]').textContent, 'Código incorrecto. Intenta de nuevo.', 'código incorrecto');
    A.click(A.$('[data-act="close"]'));
    stamp();
    eq(A.$$('.stamp.on').length, 1, 'primer sello');
    for (let i = 0; i < 7; i++) stamp();
    eq(A.$$('.stamp.on').length, 8, 'tarjeta completa');
    ok(A.$('[data-act="stamp"]').getAttribute('data-mode') === 'redeem', 'botón de canje');
    stamp();
    eq(A.$$('.stamp.on').length, 0, 'canje reinicia la tarjeta');
    A.close();
  }

  /* 7. Trivia, idioma y agenda */
  {
    const cfg = TPL('tpl-zocalo');
    const A = mount(cfg, { now: '2026-11-06T15:30:00Z' });
    eq(A.$('.lang button.on').textContent, 'ES', 'arranca en español');
    A.click(A.$('[data-act="tq"][data-a="2"]'));
    ok(A.$('.tq-fb').textContent.startsWith('¡Correcto!'), 'respuesta correcta');
    A.click(A.$('[data-act="tnext"]'));
    A.click(A.$('[data-act="tq"][data-a="1"]'));
    ok(A.$('.tq-fb').textContent.startsWith('No era esa.'), 'respuesta incorrecta');
    ok(A.$('.tq-o.ok') && A.$('.tq-o.ok').getAttribute('data-a') === '3', 'marca la correcta');
    A.click(A.$('[data-act="lang"][data-l="en"]'));
    eq(A.$('.hero-s').textContent, 'Coffee Region home cooking, the way grandma made it.', 'portada en inglés');
    ok(A.$$('.it h4').some(h => h.textContent === 'Paisa calentado'), 'carta en inglés');
    ok(/^(Open|Closed)$/.test(A.$('.status').textContent), 'estado en inglés');
    ok(A.$('.tq-n').textContent.startsWith('Question 2'), 'la trivia conserva el progreso al cambiar idioma');
    A.click(A.$('[data-act="rsvp"]'));
    const msg = A.$('.wa-msg').textContent;
    ok(msg.includes('Quiero apartar cupo para «Taller de arepas» (Sábados · 10:00 a. m.).') && msg.includes('El cliente habla inglés.'), 'el mensaje al local va en español');
    A.close();
  }

  {
    const E = mount(TPL('tpl-zocalo'), { now: '2026-11-06T15:30:00Z', lang: 'en-US' });
    eq(E.$('.lang button.on').textContent, 'EN', 'celular en inglés: la app abre en inglés');
    E.close();
  }

  /* 8. Filtros y buscador */
  {
    const A = mount(TPL('tpl-antojo'), { now: '2026-11-06T15:30:00Z' });
    A.click(A.$('[data-act="filter"][data-tag="vegano"]'));
    eq(A.$$('.carta-body .it').length, 1, 'filtro vegano');
    A.click(A.$('[data-act="filter"][data-tag="all"]'));
    A.type(A.$('[data-in="q"]'), 'arepa');
    eq(A.$$('.carta-body .it').length, 4, 'buscador sin tildes ni mayúsculas');
    A.type(A.$('[data-in="q"]'), 'zzz');
    ok(!!A.$('.carta-body .empty'), 'búsqueda sin resultados');
    A.close();
  }

  /* 9. Ruleta */
  {
    const A = mount(TPL('tpl-antojo'), { now: '2026-11-06T15:30:00Z', reduce: true });
    eq(A.$$('.wl').length, 8, 'ocho platos en la ruleta');
    A.click(A.$('[data-act="spin"]'));
    await sleep(120);
    ok(!!A.$('.wres b'), 'la ruleta da un resultado');
    ok(!!A.$('.wres [data-act="add"]'), 'el resultado se puede pedir');
    A.close();
    const p = TPL('tpl-antojo');
    const ru = p.modules.find(m => m.type === 'ruleta');
    ru.s.mode = 'premios'; ru.s.oncePerDay = true; ru.s.options = [{ label: 'Topping gratis' }, { label: '10 % de descuento' }, { label: 'Sigue intentando' }];
    const B = mount(p, { now: '2026-11-06T15:30:00Z', reduce: true });
    B.click(B.$('[data-act="spin"]'));
    await sleep(120);
    ok(!!B.$('.wres b') && B.$('[data-act="spin"]').disabled && /Ya giraste hoy/.test(B.$('[data-act="spin"]').textContent), 'tras girar muestra el premio y bloquea el segundo giro');
    B.rt.reset(p);
    ok(B.$('[data-act="spin"]').disabled, 'un giro al día por celular');
    B.close();
  }

  /* 10. Seguridad del contenido */
  {
    const cfg = TPL('tpl-antojo');
    cfg.brand.name = '<img src=x onerror="window.__pwn=1">';
    cfg.menu.categories[0].items[0].name = '<script>window.__pwn=1</script>';
    cfg.menu.categories[0].items[0].img = 'javascript:alert(1)';
    cfg.brand.instagram = 'https://instagram.com/antojo"><b>x';
    const A = mount(cfg, { now: '2026-11-06T15:30:00Z' });
    ok(!A.$('.top img') && !A.$('.it script'), 'el texto del local se escapa');
    ok(!A.$$('img').some(i => /javascript:/i.test(i.getAttribute('src'))), 'no acepta imágenes javascript:');
    ok(A.w.__pwn === undefined, 'no se ejecuta código inyectado');
    A.close();
  }

  /* 11. Vista previa: avisos de ayuda y módulos vacíos */
  {
    const cfg = ctx.blankApp('Panadería La Espiga');
    cfg.modules.push({ id: 'w', type: 'wifi', on: true, s: {} });
    const A = mount(cfg, { mode: 'preview', now: '2026-11-06T15:30:00Z' });
    ok(A.$$('.pv-empty').length >= 1, 'la vista previa explica qué falta');
    eq(A.$('.hero-t').textContent, 'Panadería La Espiga', 'portada con el nombre');
    A.close();
    const B = mount(cfg, { mode: 'app', now: '2026-11-06T15:30:00Z' });
    ok(!B.$('section[data-mid="w"]'), 'en la app publicada el módulo vacío no aparece');
    B.close();
  }

  /* 11b. Estéticas natural, nocturna y minimalista */
  {
    for (const k of ['natural', 'nocturna', 'minimalista']) {
      const cfg = TPL('tpl-antojo');
      Object.assign(cfg.theme, JSON.parse(JSON.stringify(ctx.SKINS[k].defaults)), { skin: k });
      const A = mount(cfg, { now: '2026-11-06T15:30:00Z' }); // viernes 10:30 a. m., abierto
      eq(A.$('.app').getAttribute('data-skin'), k, k + ': estética aplicada');
      eq(A.$$('section[data-mid]').length, cfg.modules.length, k + ': todas las secciones');
      ok(A.d.getElementById('bk-css').textContent.includes('[data-skin="' + k + '"]'), k + ': trae su CSS');
      ok(A.d.getElementById('bk-fonts').href.includes(ctx.SKINS[k].defaults.fonts.display.replace(/ /g, '+')), k + ': carga su tipografía de títulos');
      eq(A.errors.length, 0, k + ': sin errores de script');
      if (k === 'natural') ok(!!A.$('.m-hero svg.hills'), 'natural: lomas con surcos de café en la portada');
      if (k === 'nocturna') {
        eq(A.$('.neon.on') && A.$('.neon.on').textContent, 'Abierto', 'nocturna: letrero de neón encendido cuando está abierto');
        eq(A.$$('.ribbon-track span').length, 10, 'nocturna: la cinta se duplica para la marquesina');
      }
      if (k === 'minimalista') ok(!!A.$('.hero-t .dot') && A.$('.hero-t').textContent === 'Antojo.', 'minimalista: punto de acento al final del título');
      A.close();
    }
    const night = TPL('tpl-antojo'); night.theme.skin = 'nocturna';
    const N = mount(night, { now: '2026-11-07T07:00:00Z' }); // sábado 2:00 a. m., cerrado
    eq(N.$('.neon') && N.$('.neon').className, 'neon off', 'nocturna: letrero apagado cuando está cerrado');
    N.close();
    const noSt = TPL('tpl-antojo'); noSt.theme.skin = 'nocturna'; noSt.modules[0].s.showStatus = false;
    const M = mount(noSt, { now: '2026-11-06T15:30:00Z' });
    ok(!M.$('.neon'), 'nocturna: sin letrero si se oculta el estado');
    M.close();
    const bang = TPL('tpl-antojo'); bang.theme.skin = 'minimalista'; bang.brand.name = '¡Antojo!';
    const P = mount(bang, { now: '2026-11-06T15:30:00Z' });
    ok(!P.$('.hero-t .dot'), 'minimalista: sin punto si el título ya termina en un signo');
    P.close();
  }

  /* 12. Estudio completo con base de datos y descargas simuladas */
  const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'break-studio.html'), 'utf8');
  const docs = new Map(); const listeners = []; const saved = [];
  function snapshot() { return { docs: [...docs.entries()].map(([id, v]) => ({ id, exists: true, data: () => JSON.parse(JSON.stringify(v)) })), metadata: { fromCache: false, hasPendingWrites: false } }; }
  const fakeDb = {
    collection(p) {
      if (!/^data\/users\/u_test$/.test(p)) throw new TypeError('ruta inesperada ' + p);
      return {
        onSnapshot(next) { listeners.push(next); setTimeout(() => next(snapshot()), 5); return () => {}; },
        doc(id) { return { set: async v => { docs.set(id, JSON.parse(JSON.stringify(v))); listeners.forEach(l => setTimeout(() => l(snapshot()), 1)); }, delete: async () => { docs.delete(id); listeners.forEach(l => setTimeout(() => l(snapshot()), 1)); } }; }
      };
    }
  };
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    pretendToBeVisual: true, runScripts: 'dangerously', url: 'https://claude.ai/artifact/test', virtualConsole: quietConsole(),
    beforeParse(w) {
      w.matchMedia = q => ({ matches: /min-width: 1000px/.test(q), addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
      w.scrollTo = () => {};
      w.claude = { use: async n => n === 'db' ? fakeDb : n === 'user' ? { id: async () => 'u_test' } : n === 'downloads' ? { save: async r => { saved.push(r); return { status: 'saved' }; } } : null };
      w.JSZip = require('jszip');
    }
  });
  const w = dom.window, d = w.document;
  const studioErrors = [];
  w.addEventListener('error', e => studioErrors.push(e.message));
  await sleep(500);
  const ST = w.__breakStudio;
  const $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
  const click = el => { if (!el) throw new Error('falta un elemento en el estudio'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
  const setVal = (el, v, ev) => { el.value = v; el.dispatchEvent(new w.Event(ev || 'input', { bubbles: true })); };
  const setChk = (el, v) => { el.checked = v; el.dispatchEvent(new w.Event('change', { bubbles: true })); };
  ok(!!ST, 'el estudio arranca');
  eq(ST.S.kind, 'tpl', 'abre una plantilla de ejemplo');
  ok(/Araucaria/.test($('#sb').textContent), 'cabecera con el nombre de la app');
  eq(ST.Store.kind, 'db', 'usa la base de datos de la cuenta');
  eq(ST.S.store, 'ready', 'almacenamiento listo');
  ok(ST.pv.ready, 'la vista previa arrancó dentro del iframe');
  ok(ST.pv.ready && ST.pv.frame.contentDocument.querySelectorAll('section[data-mid]').length === 10, 'la vista previa muestra los 10 módulos de Araucaria');
  eq($$('.tab').length, 6, 'pestañas');
  eq($$('.skin').length, Object.keys(ctx.SKINS).length, 'todas las estéticas para elegir');
  eq($$('.skin').length, 6, 'seis estéticas');

  // Abrir otra plantilla desde el selector de la vista previa
  click($('[data-a="open-tpl"][data-id="tpl-antojo"]'));
  await sleep(250);
  eq(ST.S.cur.id, 'tpl-antojo', 'cambia a Antojo');
  ok(ST.pv.frame.contentDocument.querySelector('.app').getAttribute('data-skin') === 'animado', 'la vista previa cambió de estética');

  // Guardar la plantilla como app propia
  click($('[data-a="save-as"]'));
  await sleep(100);
  eq(ST.S.kind, 'app', 'quedó como app propia');
  ok(docs.has(ST.S.cur.id), 'se guardó en la base de datos');
  const appId = ST.S.cur.id;

  // Editar datos: nombre del local
  click($('[data-a="tab"][data-t="datos"]'));
  const nameIn = d.getElementById('f-brand-name');
  setVal(nameIn, 'Antojo Centro');
  await sleep(1200);
  eq(docs.get(appId).brand.name, 'Antojo Centro', 'el nombre se guarda solo');
  ok(/Antojo Centro/.test($('#sb').textContent), 'la cabecera se actualiza');
  ok(ST.pv.frame.contentDocument.querySelector('.hero-t').textContent === 'Antojo Centro', 'la vista previa se actualiza');
  setVal(d.getElementById('f-brand-whatsapp'), '573001234567');
  // Horario: cerrar el domingo
  const sunIdx = ST.S.cur.brand.hours.findIndex(h => h.d === 0);
  setChk(d.getElementById('f-brand-hours-' + sunIdx + '-closed'), false);
  eq(ST.S.cur.brand.hours[sunIdx].closed, true, 'cerrar un día');
  // Bilingüe muestra campos EN
  setChk(d.getElementById('f-i18n-bilingual'), true);
  ok(!!d.getElementById('f-brand-tagline_en'), 'al activar inglés aparecen los campos EN');

  // Módulos: abrir, editar, apagar, mover, añadir y quitar
  click($('[data-a="tab"][data-t="modulos"]'));
  const nMods = ST.S.cur.modules.length;
  click($('[data-a="mod-open"][data-mid="promos"]'));
  const promoTitle = d.getElementById('f-modules-1-s-title');
  ok(!!promoTitle, 'campos del módulo abierto');
  setVal(promoTitle, 'Promos de la semana 🔥');
  eq(ST.S.cur.modules[1].s.title, 'Promos de la semana 🔥', 'editar título del módulo');
  click($('[data-a="day"][data-p="modules.1.s.items.0.days"][data-d="3"]'));
  ok(ST.S.cur.modules[1].s.items[0].days.includes(3), 'activar un día de la promo');
  click($('[data-a="li-add"][data-p="modules.1.s.items"]'));
  eq(ST.S.cur.modules[1].s.items.length, 7, 'agregar una promo');
  setChk($('[data-p="modules.7.on"]'), false);
  eq(ST.S.cur.modules[7].on, false, 'apagar el módulo Wi-Fi');
  click($('[data-a="mod-mv"][data-mid="ruleta"][data-d="-1"]'));
  eq(ST.S.cur.modules[3].type, 'ruleta', 'subir la ruleta');
  click($('[data-a="mod-add"]'));
  ok($$('.mc').length === Object.keys(w.eval('MODULES')).length, 'catálogo con todos los módulos');
  ok($('.mc[data-type="carta"]').disabled, 'no deja repetir la carta');
  click($('.mc[data-type="trivia"]'));
  eq(ST.S.cur.modules.length, nMods + 1, 'añadir trivia');
  const triviaId = ST.S.cur.modules.find(m => m.type === 'trivia').id;
  click($('[data-a="mod-del"][data-mid="' + triviaId + '"]'));
  click($('[data-a="confirm-yes"]'));
  eq(ST.S.cur.modules.length, nMods, 'quitar con confirmación');

  // Estilo: cambiar de estética y de paleta
  click($('[data-a="tab"][data-t="estilo"]'));
  click($('[data-a="skin"][data-s="nocturna"]'));
  eq(ST.S.cur.theme.fonts.display, 'Tilt Neon', 'estética nocturna: tipografía de neón');
  eq(ST.pv.frame.contentDocument.querySelector('.app').getAttribute('data-skin'), 'nocturna', 'la vista previa cambia a la nocturna');
  ok(/Neón/.test($('.skin[aria-pressed="true"]').textContent), 'la tarjeta de la nocturna queda marcada');
  click($('[data-a="skin"][data-s="cultural"]'));
  eq(ST.S.cur.theme.skin, 'cultural', 'cambia la estética');
  eq(ST.S.cur.theme.fonts.display, 'Alfa Slab One', 'aplica la tipografía de la estética');
  eq(ST.S.cur.modules.find(m => m.type === 'carta').s.layout, 'tarjetas', 'aplica el diseño de carta de la estética');
  click($('[data-a="pal"][data-i="2"]'));
  eq(ST.S.cur.theme.colors.bg, '#2A1E17', 'aplica la paleta');
  setVal(d.getElementById('h-accent'), '#ff0000');
  eq(ST.S.cur.theme.colors.accent, '#FF0000', 'color escrito a mano');
  eq(d.getElementById('c-accent').value, '#ff0000', 'sincroniza el selector de color');
  setVal(d.getElementById('h-ink'), '#2A1E18');
  ok(/Poco contraste/.test($('#contrast').textContent), 'avisa si el texto no se lee');

  // Carta: categoría, plato, etiquetas
  click($('[data-a="tab"][data-t="carta"]'));
  const nCats = ST.S.cur.menu.categories.length;
  click($('[data-a="cat-add"]'));
  eq(ST.S.cur.menu.categories.length, nCats + 1, 'nueva categoría');
  click($('[data-a="item-add"][data-ci="' + nCats + '"]'));
  ok(!$('#sheet').hidden, 'abre el editor del plato');
  const base = 'menu-categories-' + nCats + '-items-0';
  setVal(d.getElementById('f-' + base + '-name'), 'Torta de choclo');
  setVal(d.getElementById('f-' + base + '-price'), '9500');
  eq($('[data-money="menu.categories.' + nCats + '.items.0.price"]').textContent, '$9.500', 'muestra el precio formateado');
  click($('[data-a="item-tag"][data-tag="nuevo"]'));
  click($('[data-a="sheet-close"]'));
  const it = ST.S.cur.menu.categories[nCats].items[0];
  ok(it.name === 'Torta de choclo' && it.price === 9500 && it.tags.includes('nuevo'), 'plato guardado con precio y etiqueta');
  ok($$('.ir-n').some(n => n.textContent.includes('Torta de choclo')), 'el plato aparece en la lista');

  // Publicar: revisión y exportaciones
  click($('[data-a="tab"][data-t="publicar"]'));
  const checks = ST.checks(ST.S.cur);
  ok(checks.some(c => c.t === 'WhatsApp listo'), 'revisión: WhatsApp listo');
  ok(checks.some(c => /sin nombre en inglés/.test(c.t)), 'revisión: faltan traducciones');
  click($('[data-a="exp-html"]'));
  await sleep(60);
  const h = saved.find(s => s.filename.endsWith('.html'));
  ok(h && h.filename === 'antojo-centro.html', 'descarga el .html con nombre limpio');
  ok(h && h.data.includes('window.__BREAK__=') && h.data.includes('function breakApp('), 'el .html trae motor y configuración');
  ok(h && !/<\/script>[\s\S]*<\/script>/.test(h.data.replace(/<script>[\s\S]*?<\/script>/, '')), 'el .html tiene un solo bloque de script');
  click($('[data-a="exp-json"]'));
  await sleep(60);
  const j = saved.find(s => s.filename.endsWith('.json'));
  ok(j && JSON.parse(j.data).format === 'break-app' && JSON.parse(j.data).app.brand.name === 'Antojo Centro', 'descarga la configuración .json');
  click($('[data-a="exp-zip"]'));
  await sleep(900);
  const z = saved.find(s => s.filename.endsWith('.zip'));
  ok(!!z, 'descarga el paquete .zip');
  if (z) {
    const JSZip = require('jszip');
    const buf = Buffer.from(await z.data.arrayBuffer());
    const zip = await JSZip.loadAsync(buf);
    const names = Object.keys(zip.files).sort();
    ok(['LEEME.txt', '_headers', 'index.html', 'manifest.webmanifest', 'sw.js'].every(n => names.includes(n)), 'el .zip trae index, manifiesto, service worker y guía: ' + names.join(', '));
    const man = JSON.parse(await zip.file('manifest.webmanifest').async('string'));
    ok(man.display === 'standalone' && man.start_url === './', 'manifiesto instalable');
    const idx = await zip.file('index.html').async('string');
    ok(idx.includes('serviceWorker.register("sw.js")') && idx.includes('rel="manifest"'), 'index registra el service worker');
    // La app exportada funciona por sí sola
    const app = new JSDOM(idx, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://antojo-centro.pages.dev/', beforeParse(x) { x.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} }); x.scrollTo = () => {}; } });
    await sleep(80);
    const ad = app.window.document;
    eq(ad.querySelector('.hero-t') && ad.querySelector('.hero-t').textContent, 'Antojo Centro', 'la app exportada arranca sola');
    ok(ad.querySelectorAll('.it').length === itemsIn(ST.S.cur), 'la app exportada tiene toda la carta');
    ok(ad.querySelector('.app').getAttribute('data-skin') === 'cultural', 'la app exportada conserva la estética');
    app.window.close();
  }
  const metaUrl = d.getElementById('f-meta-url');
  setVal(metaUrl, 'https://antojo-centro.pages.dev');
  ok(!$('#qr-btn').disabled, 'con dirección se habilita el QR');

  // Duplicar y eliminar apps
  click($('[data-a="drawer"]'));
  ok($$('.arow').length >= 4, 'el panel de apps lista mis apps y los ejemplos');
  click($('[data-a="dup-app"][data-id="' + appId + '"]'));
  await sleep(80);
  ok(/\(copia\)/.test(ST.S.cur.brand.name), 'duplicar una app');
  const copyId = ST.S.cur.id;
  click($('[data-a="drawer"]'));
  click($('[data-a="del-app"][data-id="' + copyId + '"]'));
  click($('[data-a="confirm-yes"]'));
  await sleep(80);
  ok(!docs.has(copyId), 'eliminar una app');
  eq(ST.S.kind, 'tpl', 'tras eliminar la app abierta vuelve a una plantilla');

  // Nueva app vacía
  click($('[data-a="drawer"]'));
  click($('[data-a="new-app"]'));
  setVal(d.getElementById('na-name'), 'Panadería La Espiga');
  click($('[data-a="create-app"][data-from="blank"]'));
  await sleep(80);
  eq(ST.S.cur.brand.name, 'Panadería La Espiga', 'crear app vacía con nombre');
  ok(docs.has(ST.S.cur.id), 'la app nueva quedó guardada');

  eq(studioErrors.length, 0, 'el estudio corre sin errores: ' + studioErrors.join(' | '));
  w.close();

  console.log('\n' + pass + ' pruebas pasaron · ' + fail + ' fallaron');
  if (results.length) console.log(results.join('\n'));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('ERROR', e); process.exit(1); });
