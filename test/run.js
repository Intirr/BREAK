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
vm.runInContext(SRC('runtime.js') + '\n' + SRC('templates.js') + '\n' + SRC('catalog.js') + '\n;this.breakApp=breakApp;this.TEMPLATES=TEMPLATES;this.blankApp=blankApp;this.SKINS=SKINS;this.MODULES=MODULES;this.TEXTURES=TEXTURES;this.DISPLAY_FONTS=DISPLAY_FONTS;this.BODY_FONTS=BODY_FONTS;this.STYLE=STYLE;this.ICON_NAMES=ICON_NAMES;', ctx);
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
  if (o.body) w.document.body.innerHTML = o.body;
  if (o.setup) o.setup(w);
  w.__cfg = cfg;
  w.__opts = Object.assign({ mode: o.mode || 'app', now: o.now }, o.assetURL ? { assetURL: o.assetURL } : {});
  const rt = w.eval('(' + ctx.breakApp.toString() + ')(window, document, window.__cfg, window.__opts)');
  const d = w.document;
  const $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
  const click = el => { if (!el) throw new Error('no existe el elemento a tocar'); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
  const type = (el, v) => { el.value = v; el.dispatchEvent(new w.Event('input', { bubbles: true })); };
  const submit = f => f.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  return { dom, w, d, rt, $, $$, click, type, submit, errors, close() { rt.destroy(); w.close(); } };
}
const itemsIn = cfg => cfg.menu.categories.reduce((a, c) => a + c.items.length, 0);

(async function () {
  /* 1. Todas las apps de ejemplo renderizan completas */
  eq(ctx.TEMPLATES.length, 7, 'siete apps de ejemplo');
  for (const id of ctx.TEMPLATES.map(t => t.id)) {
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

  /* 1b. Lo propio de cada app de ejemplo nueva */
  {
    const es = mount(TPL('tpl-esquina'), { now: '2026-11-07T06:00:00Z' }); // sábado 1:00 a. m.
    eq(es.rt._status().open, true, 'La Esquina: abierta a la 1:00 a. m. del sábado');
    ok(!!es.$('.neon.on'), 'La Esquina: letrero de neón encendido de madrugada');
    ok(!!es.$('.lay-fotos') && es.$$('section[data-mid="ruleta"] .wl').length === 5, 'La Esquina: carta con fotos grandes y ruleta de cinco premios');
    es.close();
    const nb = mount(TPL('tpl-neblina'), { now: '2026-11-06T15:30:00Z' });
    ok(!!nb.$('.hero-box.has-img .hero-ph img') && /^data:image\/svg\+xml;base64,/.test(nb.$('.hero-ph img').getAttribute('src')), 'Neblina: portada con su ilustración');
    ok(nb.$$('section[data-mid="servicios"] .svc').length === 6 && !!nb.$('.hero-t .dot'), 'Neblina: servicios y punto de la minimalista');
    nb.close();
    const al = mount(TPL('tpl-alisos'), { now: '2026-11-07T16:00:00Z', lang: 'en-US' }); // sábado 11:00 a. m.
    eq(al.$('.lang button.on').textContent, 'EN', 'Los Alisos: abre en inglés si el celular está en inglés');
    ok(al.$$('.svc').some(x => x.textContent === 'English spoken') && al.$$('.it h4').some(h => h.textContent === 'Garlic trout'), 'Los Alisos: servicios y carta en inglés');
    ok(al.$$('.fq summary').some(s => /hot springs/.test(s.textContent)), 'Los Alisos: preguntas frecuentes en inglés');
    al.close();
    const ep = mount(TPL('tpl-espiga'), { now: '2026-11-06T15:30:00Z' });
    ok(!!ep.$('.lay-compacta') && /font-size:18\.4px/.test(ep.d.getElementById('bk-css').textContent), 'La Espiga: carta compacta y letra grande');
    eq(ep.$('main > section').getAttribute('data-mid'), 'aviso', 'La Espiga: el aviso va arriba de la portada');
    ok(ep.$('html').getAttribute('data-tex') === 'papel' && !!ep.$('.m-hero svg.hills'), 'La Espiga: papel y lomas de la estética natural');
    ep.close();
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

  /* 11c. Paletas, tipografías y texturas */
  {
    const lum = h => { h = h.replace('#', ''); const c = [0, 2, 4].map(i => { const v = parseInt(h.slice(i, i + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
    const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const bad = [];
    for (const k of Object.keys(ctx.SKINS)) {
      const sk = ctx.SKINS[k];
      eq(sk.palettes.length, 5, k + ': cinco paletas');
      sk.palettes.forEach(p => { const c = p.colors; if (cr(c.ink, c.bg) < 4.5 || cr(c.ink, c.surface) < 4.5 || cr(c.muted, c.bg) < 3) bad.push(k + ' · ' + p.name); });
      ok(sk.palettes.some(p => JSON.stringify(p.colors) === JSON.stringify(sk.defaults.colors)), k + ': sus colores por defecto son una de sus paletas');
    }
    eq(bad.join(', '), '', 'todas las paletas tienen buen contraste');
    const RT = SRC('runtime.js');
    eq(ctx.DISPLAY_FONTS.concat(ctx.BODY_FONTS).filter(f => RT.indexOf("'" + f + "': [") < 0).join(', '), '', 'cada tipografía del estudio está en el motor');
    for (const t of ctx.TEXTURES.map(x => x[0]).filter(x => x !== 'none')) {
      const cfg = TPL('tpl-araucaria'); cfg.theme.texture = t;
      const A = mount(cfg, { now: '2026-11-06T15:30:00Z' });
      ok(A.d.documentElement.getAttribute('data-tex') === t && A.d.getElementById('bk-css').textContent.includes('html[data-tex="' + t + '"]'), 'textura «' + t + '» aplicada');
      A.close();
    }
    const f = TPL('tpl-araucaria'); f.theme.fonts = { display: 'DM Serif Display', body: 'Source Serif 4' };
    const F2 = mount(f, { now: '2026-11-06T15:30:00Z' });
    const href = F2.d.getElementById('bk-fonts').href;
    ok(href.includes('family=DM+Serif+Display:ital@0;1') && href.includes('family=Source+Serif+4:ital,wght@0,400;0,600;1,400'), 'pide a Google Fonts los pesos de las tipografías nuevas');
    F2.close();
  }

  /* 11d. Foto de portada */
  const PX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  {
    const cfg = TPL('tpl-zocalo');
    Object.assign(cfg.modules[0].s, { img: PX, veil: '80', align: 'izq', size: 'l' });
    const A = mount(cfg, { now: '2026-11-06T15:30:00Z' });
    const box = A.$('.m-hero .hero-box');
    ok(box && box.classList.contains('has-img') && box.classList.contains('al-izq') && box.classList.contains('hs-l'), 'portada con foto, alineada a la izquierda y con título grande');
    eq(A.$('.hero-ph img') && A.$('.hero-ph img').getAttribute('src'), PX, 'la foto subida se muestra');
    ok(/--veil:80%/.test(A.$('.hero-ph i').getAttribute('style')), 'velo fuerte sobre la foto');
    ok(!A.$('.facade'), 'con foto, la cultural no repite la fachada dibujada');
    ok(!A.$('.ph-note'), 'en la app publicada no hay avisos de vista previa');
    A.close();
    const bad = TPL('tpl-zocalo'); bad.modules[0].s.img = 'javascript:alert(1)';
    const B = mount(bad, { now: '2026-11-06T15:30:00Z' });
    ok(!B.$('.hero-ph') && !!B.$('.facade'), 'no acepta fotos javascript: y deja la portada normal');
    B.close();
    const link = TPL('tpl-araucaria'); link.modules[0].s.img = 'https://example.com/portada.jpg';
    const P = mount(link, { mode: 'preview', now: '2026-11-06T15:30:00Z' });
    ok(!!P.$('.ph-note'), 'en la vista previa explica que los enlaces https se ven en la app publicada');
    P.$('.hero-ph img').dispatchEvent(new P.w.Event('error'));
    ok(P.$('.hero-box').classList.contains('ph-fail'), 'si la foto no carga, la portada vuelve a su forma normal');
    P.close();
    const D = mount(TPL('tpl-araucaria'), { now: '2026-11-06T15:30:00Z' });
    eq(D.$('.hero-box') && D.$('.hero-box').className, 'hero-box', 'sin foto ni ajustes, la portada queda como antes');
    D.close();
  }

  /* 11e. Diseños de carta y estilo de botones */
  {
    const cfg = TPL('tpl-antojo'), ca = cfg.modules.find(m => m.type === 'carta');
    ca.s.layout = 'fotos'; cfg.menu.categories[0].items[1].on = false;
    const A = mount(cfg, { now: '2026-11-06T15:30:00Z' });
    eq(A.$$('.lay-fotos .it').length, itemsIn(cfg), 'fotos grandes: todos los platos');
    ok(A.$$('.lay-fotos .it .media').length === itemsIn(cfg) && !!A.$('.lay-fotos .it .it-d'), 'fotos grandes: foto o emoji y descripción');
    ok(!!A.$('.lay-fotos .it .add'), 'fotos grandes: se puede pedir');
    A.close();
    ca.s.layout = 'compacta';
    const B = mount(cfg, { now: '2026-11-06T15:30:00Z' });
    eq(B.$$('.lay-compacta .it').length, itemsIn(cfg), 'compacta: todos los platos');
    ok(!B.$('.lay-compacta .it-d') && !B.$('.lay-compacta .media') && !B.$('.lay-compacta .tag:not(.sold)'), 'compacta: sin descripción, foto ni etiquetas');
    ok(!!B.$('.lay-compacta .it.off .tag.sold'), 'compacta: marca lo agotado');
    ok(!!B.$('.lay-compacta .it-l .add'), 'compacta: el botón + va en la misma línea');
    B.click(B.$('.lay-compacta .it[data-id="malt-arequipe"]'));
    ok(!!B.$('.isheet') && /galleta triturada/.test(B.$('.isheet').textContent), 'compacta: la descripción aparece al tocar el plato');
    B.close();
    for (const bt of ['redondo', 'cuadrado', 'contorno']) {
      const c = TPL('tpl-araucaria'); c.theme.buttons = bt;
      const C = mount(c, { now: '2026-11-06T15:30:00Z' });
      ok(C.$('.app').getAttribute('data-btn') === bt && C.d.getElementById('bk-css').textContent.includes('.app[data-btn="' + bt + '"]'), 'botones «' + bt + '»');
      C.close();
    }
    const D = mount(TPL('tpl-araucaria'), { now: '2026-11-06T15:30:00Z' });
    ok(!D.$('.app').hasAttribute('data-btn'), 'sin elegir, los botones son los de la estética');
    D.close();
  }

  /* 11f. Letra grande y etiquetas nuevas */
  {
    const cfg = TPL('tpl-zocalo'); cfg.theme.textSize = 'grande';
    const A = mount(cfg, { now: '2026-11-06T15:30:00Z' });
    const css = A.d.getElementById('bk-css').textContent;
    ok(/body\{[^}]*font-size:18\.4px/.test(css) && /\[data-skin="cultural"\]\{font-size:19\.6px/.test(css), 'letra grande: el texto sube un 15 %');
    ok(!/font-size:16px;line-height:1\.55/.test(css), 'letra grande: no queda el tamaño normal del cuerpo');
    A.close();
    const N = mount(TPL('tpl-zocalo'), { now: '2026-11-06T15:30:00Z' });
    ok(/body\{[^}]*font-size:16px/.test(N.d.getElementById('bk-css').textContent), 'letra normal: el tamaño de siempre');
    N.close();
    const t = TPL('tpl-zocalo');
    t.menu.categories[0].items[0].tags = ['temporada', 'compartir'];
    t.menu.categories[0].items[1].tags = ['ninos', 'sinlactosa'];
    const T = mount(t, { now: '2026-11-06T15:30:00Z' });
    const labels = T.$$('.it .tag').map(x => x.textContent);
    ok(['De temporada', 'Para compartir', 'Para niños', 'Sin lactosa'].every(l => labels.includes(l)), 'etiquetas nuevas en español');
    ok(['temporada', 'compartir', 'ninos', 'sinlactosa'].every(k => !!T.$('.filters [data-tag="' + k + '"]')), 'las etiquetas nuevas también filtran');
    T.click(T.$('[data-act="filter"][data-tag="sinlactosa"]'));
    eq(T.$$('.carta-body .it').length, 1, 'filtro sin lactosa');
    T.click(T.$('[data-act="lang"][data-l="en"]'));
    ok(T.$$('.it .tag').some(x => x.textContent === 'Dairy-free'), 'etiquetas nuevas en inglés');
    T.close();
  }

  /* 11g. Módulos nuevos: aviso, galería, servicios y preguntas frecuentes */
  {
    const cfg = TPL('tpl-araucaria');
    cfg.modules.unshift({ id: 'av', type: 'aviso', on: true, s: { text: 'Este festivo abrimos de 8 a 8', icon: '📣', style: 'acento', until: '2026-11-10', cta: 'reservas' } });
    cfg.modules.push({ id: 'ga', type: 'galeria', on: true, s: { title: 'La casa por dentro', layout: 'mosaico', items: [{ img: PX, caption: 'El comedor' }, { emoji: '🍷', caption: 'La bodega' }, { img: 'javascript:alert(1)', caption: '' }, { img: '', emoji: '', caption: '' }] } });
    cfg.modules.push({ id: 'sv', type: 'servicios', on: true, s: { title: 'Servicios', list: ['parqueadero', 'mascotas', 'nada'], extra: 'Calefacción, Cambiador de bebé', note: '' } });
    cfg.modules.push({ id: 'fq', type: 'faq', on: true, s: { title: 'Preguntas frecuentes', items: [{ q: '¿Aceptan mascotas?', a: 'Sí, en la terraza.' }, { q: '', a: 'sin pregunta' }] } });
    const A = mount(cfg, { now: '2026-11-06T15:30:00Z' });
    const av = A.$('section[data-mid="av"] .aviso');
    ok(!!av && av.tagName === 'BUTTON' && /festivo/.test(av.textContent) && av.classList.contains('av-acento'), 'aviso con su estilo y botón');
    eq(A.$('main > section').getAttribute('data-mid'), 'av', 'el aviso sale antes de la portada');
    eq(A.$$('section[data-mid="ga"] .gal-i').length, 2, 'galería: fotos y emojis, sin los vacíos');
    ok(!A.$$('img').some(i => /javascript:/i.test(i.getAttribute('src') || '')), 'galería: no acepta imágenes javascript:');
    ok(!!A.$('section[data-mid="ga"] .gal-grid'), 'galería en mosaico');
    A.click(A.$('section[data-mid="ga"] .gal-b[data-i="1"]'));
    ok(!!A.$('.gsheet') && /La bodega/.test(A.$('.gsheet').textContent), 'galería: amplía la foto al tocarla');
    A.click(A.$('.sheet [data-act="gal"][data-i="2"]'));
    ok(/El comedor/.test(A.$('.gsheet').textContent) && /1 \/ 2/.test(A.$('.gal-n').textContent), 'galería: «Siguiente» vuelve a la primera al final');
    A.click(A.$('[data-act="close"]'));
    eq(A.$$('section[data-mid="sv"] .svc').map(x => x.textContent).join('|'), 'Parqueadero|Se admiten mascotas|Calefacción|Cambiador de bebé', 'servicios: los marcados y los escritos a mano');
    eq(A.$$('section[data-mid="sv"] .svc svg').length, 4, 'servicios: cada uno con su ícono');
    eq(A.$$('section[data-mid="fq"] details.fq').length, 1, 'preguntas: solo las que tienen pregunta y respuesta');
    ok(/en la terraza/.test(A.$('section[data-mid="fq"] .fq-a').textContent), 'preguntas: la respuesta va adentro');
    A.click(av);
    A.click(A.$('[data-act="nav"]'));
    const nav = A.$$('.navi').map(x => x.textContent);
    ok(nav.includes('La casa por dentro') && nav.includes('Servicios') && nav.includes('Preguntas frecuentes') && !nav.some(t => /festivo|Aviso/.test(t)), 'el menú de secciones incluye los módulos nuevos, no el aviso');
    eq(A.errors.length, 0, 'módulos nuevos sin errores de script');
    A.close();
    const B = mount(cfg, { now: '2026-11-11T15:30:00Z' });
    ok(!B.$('section[data-mid="av"]'), 'el aviso vencido ya no aparece en la app');
    B.close();
    const C = mount(cfg, { mode: 'preview', now: '2026-11-11T15:30:00Z' });
    ok(/venció/.test(C.$('section[data-mid="av"]').textContent), 'en la vista previa el aviso vencido lo explica');
    C.close();
    const en = JSON.parse(JSON.stringify(cfg)); en.i18n.bilingual = true;
    const E = mount(en, { now: '2026-11-06T15:30:00Z', lang: 'en-US' });
    ok(E.$$('section[data-mid="sv"] .svc').some(x => x.textContent === 'Pet friendly'), 'servicios en inglés');
    E.close();
  }

  /* 11h. Íconos de línea, sin íconos y controles con dibujos */
  {
    const M = ctx.breakApp(null, null, null, { meta: true });
    const firstD = k => (M.icons[k].match(/ d="([^"]+)"/) || [])[1];
    const dOf = el => { const pth = el && el.querySelector('svg.ic path'); return pth ? pth.getAttribute('d') : null; };
    const EMO = /\p{Extended_Pictographic}/u;
    ok(Object.keys(M.icons).length >= 80 && M.iconSets.length === 3, 'el motor entrega sus íconos y grupos al estudio');
    ok(M.iconSets.every(g => g[1].every(k => !!M.icons[k] && !!ctx.ICON_NAMES[k])), 'cada ícono de los grupos existe y tiene nombre en el estudio');
    ok(Object.keys(M.emoIcon).every(e => !!M.icons[M.emoIcon[e]]), 'cada emoji apunta a un ícono que existe');
    eq(M.iconOf('🐟'), 'pescado', 'el emoji de pescado tiene su ícono');
    eq(M.iconOf('☕️'), 'cafe', 'el emoji con variante también se reconoce');
    eq(M.glyph('linea', '', 'x"><script>', ''), '', 'un ícono desconocido no se inyecta');
    eq(M.glyph('emoji', '<b>', '', ''), '&lt;b&gt;', 'el emoji se escapa');
    eq(M.glyph('ninguno', '☕', 'cafe', ''), '', 'sin íconos no se dibuja nada');
    ok(ctx.TEMPLATES.every(t => t.theme.icons === ctx.SKINS[t.theme.skin].defaults.icons), 'cada app de ejemplo usa los íconos de su estética');
    ok(ctx.TEMPLATES.every(t => t.menu.categories.every(c => c.items.every(it => !it.ico || !!M.icons[it.ico]))), 'los íconos elegidos en las apps de ejemplo existen');
    ok(ctx.TEMPLATES.filter(t => t.theme.icons === 'linea').every(t => t.menu.categories.every(c => c.items.every(it => !it.emoji || it.ico || M.iconOf(it.emoji)))), 'en las apps con íconos de línea cada emoji tiene su ícono');

    // Apps guardadas antes de los íconos: sin valor se ven los emojis de siempre
    const old = TPL('tpl-alisos'); delete old.theme.icons;
    const O = mount(old, { now: '2026-11-07T16:00:00Z' });
    ok(!O.$('.m-carta .media.ln') && O.$$('.m-carta .media span').some(x => EMO.test(x.textContent)), 'sin modo de íconos la carta sigue con emojis');
    O.close();

    // Íconos de línea
    const cfg = TPL('tpl-alisos');
    const it0 = cfg.menu.categories[0].items[1];
    it0.ico = 'x"><img src=x onerror="window.__pwn=1">';
    cfg.modules.unshift({ id: 'av', type: 'aviso', on: true, s: { text: 'Festivo abierto', icon: '📣', style: 'acento', until: '', cta: 'none' } });
    const A = mount(cfg, { now: '2026-11-07T16:00:00Z' });
    const media = A.$$('.m-carta .media');
    ok(media.length > 0 && media.every(m => m.classList.contains('ln') || m.classList.contains('none')), 'línea: cada plato con ícono o con su inicial');
    ok(!media.some(m => EMO.test(m.textContent)), 'línea: ningún emoji en la carta');
    eq(dOf(A.$('.m-carta [data-id="ajillo"] .media')), firstD('pescado'), 'línea: la trucha al ajillo lleva el pescado elegido a mano');
    eq(dOf(A.$('.m-carta [data-id="' + it0.id + '"] .media')), firstD(M.iconOf(it0.emoji) || 'cubiertos'), 'línea: un ícono desconocido cae al que corresponde al emoji');
    ok(A.w.__pwn === undefined && !A.$('img[src="x"]'), 'línea: el campo de ícono no inyecta código');
    ok(!!A.$('.cat-h .ci svg.ic') && !!A.$('.chips .ci svg.ic'), 'línea: títulos y pestañas de categoría con ícono');
    eq(dOf(A.$('section[data-mid="av"] .aviso')), firstD('megafono'), 'línea: el aviso lleva su megáfono');
    ok(!!A.$('section[data-mid="galeria"] .gal-i .media.ln svg.ic'), 'línea: la galería sin foto usa ícono');
    const cl = A.$$('section[data-mid="contacto"] .cl');
    ok(cl.length >= 2 && cl.every(x => !!x.querySelector('svg.ic')), 'Contacto: cada fila con su ícono');
    eq(A.errors.length, 0, 'íconos de línea sin errores de script');
    A.close();

    // Sin íconos
    const none = TPL('tpl-alisos'); none.theme.icons = 'ninguno';
    const N = mount(none, { now: '2026-11-07T16:00:00Z' });
    ok(N.$$('.m-carta .media').length > 0 && N.$$('.m-carta .media').every(m => m.classList.contains('none')), 'sin íconos: los platos muestran su inicial');
    ok(!N.$('.cat-h .ci') && !N.$('.m-carta svg.ic:not(.add svg)'), 'sin íconos: categorías sin dibujo');
    N.close();

    // Sellos con ícono de línea y controles con dibujo y nombre en palabras
    const an = TPL('tpl-antojo'); an.theme.icons = 'linea';
    const S1 = mount(an, { now: '2026-11-06T15:30:00Z' });
    S1.click(S1.$('[data-act="stamp"]'));
    ok(!!S1.$('.keypad svg.ic'), 'el teclado del código borra con un ícono');
    '2468'.split('').forEach(k => S1.click(S1.$('.keypad [data-k="' + k + '"]')));
    ok(!!S1.$('.stamp.on svg.ic') && !EMO.test(S1.$('.stamp.on').textContent), 'sellos: el sello puesto lleva ícono de línea');
    S1.click(S1.$('.add'));
    ok(!!S1.$('.add svg.ic'), 'el botón de agregar es un ícono');
    S1.click(S1.$('.fab'));
    eq(S1.$('.lines [data-act="ln"][data-d="-1"]').getAttribute('aria-label'), 'Quitar uno', 'pedido: el botón de menos dice qué hace');
    eq(S1.$('.lines [data-act="ln"][data-d="1"]').getAttribute('aria-label'), 'Agregar uno', 'pedido: el botón de más dice qué hace');
    ok(!!S1.$('.sheet .x svg.ic') && S1.$('.sheet .x').getAttribute('aria-label') === 'Cerrar', 'cerrar con ícono y nombre');
    S1.close();
    const al = mount(TPL('tpl-alisos'), { now: '2026-11-07T16:00:00Z', lang: 'en-US' });
    eq(al.$('[data-act="res-ppl"][data-d="-1"]').getAttribute('aria-label'), 'One less', 'reservas en inglés: botón de menos');
    eq(al.$('[data-act="res-ppl"][data-d="1"]').getAttribute('aria-label'), 'One more', 'reservas en inglés: botón de más');
    al.close();
  }

  /* 11i. Fotos: biblioteca del estudio, archivos del .zip, encuadre y foto de categoría */
  {
    const A1 = 'f'.repeat(32);
    const cfg = TPL('tpl-alisos');
    const hero = cfg.modules.find(m => m.type === 'hero');
    hero.s.img = 'asset:' + A1; hero.s.imgPos = 'bottom';
    cfg.menu.categories[0].img = 'img/' + A1 + '.webp'; cfg.menu.categories[0].imgPos = 'top';
    cfg.menu.categories[0].items[0].img = 'asset:../../etc';
    cfg.menu.categories[0].items[1].img = 'img/../x.webp';
    cfg.menu.categories[1].items[0].img = 'img/' + A1 + '.jpg'; cfg.menu.categories[1].items[0].imgPos = 'bottom';
    const A = mount(cfg, { now: '2026-11-07T16:00:00Z' });
    ok(!A.$('.hero-ph'), 'sin quien la resuelva, una foto de la biblioteca no se muestra (app publicada)');
    ok(A.$('.cat-ph img') && A.$('.cat-ph img').getAttribute('src') === 'img/' + A1 + '.webp' && A.$('.cat-ph img').classList.contains('op-t'), 'foto de categoría del .zip con su encuadre');
    ok(!!A.$('.cat.has-ph') && A.$$('.cat-ph').length === 1, 'solo la categoría con foto lleva franja');
    ok(!A.$$('img').some(i => /\.\.|etc/.test(i.getAttribute('src') || '')), 'no acepta rutas raras ni ids inválidos');
    const it = A.$('[data-id="' + cfg.menu.categories[1].items[0].id + '"] .media img');
    ok(it && it.getAttribute('src') === 'img/' + A1 + '.jpg' && it.classList.contains('op-b'), 'foto de plato del .zip con encuadre abajo');
    eq(A.errors.length, 0, 'fotos sin errores de script');
    A.close();
    const B = mount(cfg, { mode: 'preview', now: '2026-11-07T16:00:00Z', assetURL: id => 'https://artefacto.test/_blob/' + id });
    eq(B.$('.hero-ph img') && B.$('.hero-ph img').getAttribute('src'), 'https://artefacto.test/_blob/' + A1, 'la vista previa del estudio muestra la foto de la biblioteca');
    ok(B.$('.hero-ph img').classList.contains('op-b') && !B.$('.hero-box .ph-note'), 'la portada usa su encuadre y no avisa de enlaces');
    B.close();
    const C = mount(cfg, { mode: 'preview', now: '2026-11-07T16:00:00Z', assetURL: () => 'javascript:alert(1)' });
    ok(!C.$('.hero-ph'), 'una dirección de foto que no es https no se usa');
    C.close();
  }

  /* 11j. Portada por piezas: diseño, alto, logo y decoraciones de la región */
  {
    const M = ctx.breakApp(null, null, null, { meta: true });
    const hero = cfg => cfg.modules.find(m => m.type === 'hero').s;
    const NOW = { now: '2026-11-06T15:30:00Z' };
    // Lo de cada estética sigue igual sin tocar nada
    const auto = { 'tpl-araucaria': '.hero-mono', 'tpl-antojo': '.hero-box.d-stickers .stk', 'tpl-zocalo': '.hero-box.d-fachada .facade', 'tpl-espiga': '.hero-box.d-lomas .hills', 'tpl-esquina': '.hero-box.d-neon .neon' };
    for (const id of Object.keys(auto)) { const A = mount(TPL(id), NOW); ok(!!A.$(auto[id]), id + ': la portada conserva la decoración de su estética'); A.close(); }
    ok(/--leaf:#[0-9a-f]{6}/i.test((() => { const A = mount(TPL('tpl-espiga'), NOW); const t = A.d.getElementById('bk-css').textContent; A.close(); return t; })()), 'el verde de la paleta queda listo para las ilustraciones');
    ok(['stickers', 'fachada', 'lomas', 'neon', 'araucarias', 'cafetal', 'guadua', 'termales', 'willys'].every(k => M.heroDeco(k).length > 20) && /\.art \.a-t1/.test(M.decoCSS), 'el motor entrega las miniaturas y su CSS al estudio');
    // Sin decoración
    const z = TPL('tpl-zocalo'); hero(z).deco = 'ninguna';
    let A = mount(z, NOW); ok(!A.$('.facade') && !A.$('.zocalo') && !A.$('.hero-box[class*=" d-"]'), '«Ninguna» quita la fachada y el zócalo'); A.close();
    // Ilustraciones nuevas en cualquier estética
    const nb = TPL('tpl-neblina'); hero(nb).deco = 'araucarias'; hero(nb).variant = 'texto';
    A = mount(nb, NOW); ok(!!A.$('.m-hero svg.art-arau') && !A.$('.hero-ph'), 'araucarias en la minimalista, sin la foto en «Solo texto»'); A.close();
    const ar = TPL('tpl-araucaria'); hero(ar).deco = 'termales'; hero(ar).logo = 'no';
    A = mount(ar, NOW); ok(!!A.$('.hero-in svg.art-term') && !A.$('.hero-mono'), 'termales arriba del título y sin el monograma'); A.close();
    hero(ar).img = PX;
    A = mount(ar, NOW); ok(!A.$('svg.art-term') && !!A.$('.hero-box.has-img'), 'con foto de fondo la escena de arriba se oculta'); A.close();
    for (const k of ['cafetal', 'guadua', 'willys']) { const c = TPL('tpl-antojo'); hero(c).deco = k; const B = mount(c, NOW); ok(!!B.$('.m-hero svg.art') && !B.$('.stk'), k + ': se dibuja en lugar de los stickers'); B.close(); }
    const mn = TPL('tpl-neblina'); hero(mn).logo = 'si'; hero(mn).variant = 'texto';
    A = mount(mn, NOW); ok(!!A.$('.hero-mono .logo'), 'el logo se puede poner en la portada de cualquier estética'); A.close();
    // Diseños con foto
    const al = TPL('tpl-alisos'); hero(al).img = PX; hero(al).variant = 'arriba'; hero(al).height = 'alta';
    A = mount(al, NOW); ok(!!A.$('.hero-box.v-arriba.hh-alta .hero-ph img') && !A.$('.hero-ph i') && !A.$('.hero-box.has-img'), 'foto arriba y texto abajo, sin velo y alta'); A.close();
    hero(al).variant = 'tarjeta'; hero(al).ribbon = 'Truchas, Termales';
    A = mount(al, NOW); ok(!!A.$('.hero-box.v-tarjeta.has-img') && !!A.$('.hero-in .ribbon') && !A.$('.hero-ph i'), 'tarjeta sobre la foto con la cinta adentro'); A.close();
    hero(al).img = ''; hero(al).variant = 'foto';
    A = mount(al, { mode: 'preview', now: NOW.now }); ok(/necesita una foto/.test(A.$('section[data-mid="hero"]').textContent) && !A.$('.hero-box.has-img'), 'la vista previa avisa si el diseño necesita una foto'); A.close();
    A = mount(al, NOW); ok(!/necesita una foto/.test(A.$('section[data-mid="hero"]').textContent), 'la app publicada no muestra ese aviso'); A.close();
  }

  /* 11k. Marca: logo con ícono, forma del logo, logo horizontal y pantalla de carga */
  {
    const NOW = { now: '2026-11-06T15:30:00Z' };
    const c1 = TPL('tpl-zocalo'); c1.brand.logo = { type: 'icon', value: 'olla', shape: 'cuadrado' };
    let A = mount(c1, NOW);
    ok(!!A.$('.brand-mini .logo.mono.ico svg.ic'), 'logo con un ícono de línea en el encabezado');
    ok(/#bk \.logo:not\(\.hz\)\{border-radius:max\(6px/.test(A.d.getElementById('bk-css').textContent), 'la forma cuadrada le gana a la estética');
    A.close();
    const c2 = TPL('tpl-neblina'); c2.brand.logo = { type: 'icon', value: 'x"><script>window.__pwn=1</script>' };
    A = mount(c2, NOW); ok(!A.$('.logo.ico') && !!A.$('.brand-mini .logo.mono') && A.w.__pwn === undefined, 'un ícono de logo desconocido vuelve a las iniciales sin inyectar nada'); A.close();
    const c3 = TPL('tpl-araucaria'); c3.brand.logo = { type: 'img', value: PX, shape: 'horizontal' };
    A = mount(c3, NOW);
    ok(!!A.$('.brand-mini .logo.hz img') && !A.$('.brand-mini b'), 'logo horizontal: se ve completo y reemplaza el nombre');
    ok(A.$('.brand-mini').getAttribute('aria-label') === c3.brand.name && /#bk \.brand-mini \.logo\.hz\{display:inline-grid/.test(A.d.getElementById('bk-css').textContent), 'el nombre sigue para lectores de pantalla y se ve también en la elegante');
    A.close();
    A = mount(TPL('tpl-espiga'), Object.assign({ body: '<div id="bk-splash">Cargando</div>' }, NOW));
    ok(A.d.getElementById('bk-splash').style.opacity === '0', 'la pantalla de carga se desvanece al arrancar la app');
    await sleep(460);
    ok(!A.d.getElementById('bk-splash'), 'y luego se quita');
    A.close();
    A = mount(TPL('tpl-espiga'), Object.assign({ body: '<div id="bk-splash">Cargando</div>', mode: 'preview' }, NOW));
    ok(!!A.d.getElementById('bk-splash'), 'la vista previa no toca la pantalla de carga');
    A.close();
  }

  /* 11l. Color por elemento y fondo de la app */
  {
    const NOW = { now: '2026-11-06T15:30:00Z' };
    const css = cfg => { const A = mount(cfg, NOW); const t = A.d.getElementById('bk-css').textContent; A.close(); return t; };
    const base = css(TPL('tpl-zocalo'));
    ok(!/--c-(btn|title|price)[:]/.test(base) && /var\(--c-btn,var\(--accent2\)\)/.test(base), 'sin roles no se define ninguno y cada regla conserva su color');
    const z = TPL('tpl-zocalo'); z.theme.roles = { btn: '#1F7A8C', price: 'accent3', title: 'auto', tag: 'rojo', top: '#12', foot: 'ink' };
    const t1 = css(z);
    ok(/--c-btn:#1F7A8C;--c-btn-on:#ffffff/.test(t1), 'un color propio para los botones, con texto legible encima');
    ok(new RegExp('--c-price:' + z.theme.colors.accent3).test(t1), 'un rol puede usar un color de la paleta');
    ok(!/--c-title:|--c-tag:|--c-top:/.test(t1), 'auto y los valores inválidos no cambian nada');
    ok(new RegExp('--c-foot:' + z.theme.colors.ink + ';--c-foot-on:#ffffff').test(t1), 'el pie oscuro lleva texto claro');
    const g = TPL('tpl-espiga'); g.theme.bg = { type: 'degradado', tint: 'accent2' };
    ok(/html\{background:linear-gradient\(180deg,var\(--bg\) 0%,var\(--bg\) 22%,color-mix\(in srgb,var\(--accent2\) 26%/.test(css(g)) && /body\{background-color:transparent\}/.test(css(g)), 'fondo en degradado hacia el acento 2');
    const f = TPL('tpl-neblina'); f.theme.bg = { type: 'foto', img: PX, veil: '60', imgPos: 'top' };
    ok(/url\("data:image\/png;base64,[^"]+"\) center top\/cover fixed/.test(css(f)) && /var\(--bg\) 60%,transparent/.test(css(f)), 'fondo con foto, velo y encuadre');
    f.theme.bg = { type: 'foto', img: 'https://x.test/a.jpg") ;}body{display:none' };
    ok(!/html\{background/.test(css(f)) && !/x\.test/.test(css(f)), 'una foto de fondo inválida no se usa');
    f.theme.bg = { type: 'foto', img: '' };
    ok(!/html\{background/.test(css(f)), 'sin foto, el fondo queda liso');
  }

  /* 11m. Tipografía a fondo */
  {
    const NOW = { now: '2026-11-06T15:30:00Z' };
    const head = cfg => { const A = mount(cfg, NOW); const r = { css: A.d.getElementById('bk-css').textContent, f1: (A.d.getElementById('bk-fonts') || {}).href || '', f2: A.d.getElementById('bk-fonts2') ? A.d.getElementById('bk-fonts2').getAttribute('href') : '', head: A.d.head.innerHTML }; A.close(); return r; };
    const a = TPL('tpl-araucaria'); a.theme.type = { titleWeight: 600, titleCase: 'mayus', titleSpacing: 8, titleScale: 120, lineHeight: 175, priceFont: 'mono' };
    const h = head(a);
    ok(h.css.includes('#bk .hero-t,#bk .sh-t,#bk .cat-h h3{font-weight:600}'), 'grosor de los títulos');
    ok(/text-transform:uppercase/.test(h.css) && h.css.includes('#bk .hero-box{--gwk:1.5}'), 'títulos en mayúsculas, con el tope de tamaño ajustado');
    ok(h.css.includes('letter-spacing:0.08em') && h.css.includes('--gwl:0.08'), 'espacio entre letras');
    ok(h.css.includes('#bk {--ts:1.2}') && h.css.includes('#bk {line-height:1.75}'), 'tamaño de títulos e interlineado');
    ok(/#bk \.price\{font-family:ui-monospace/.test(h.css), 'precios en letra monoespaciada');
    const d0 = TPL('tpl-araucaria'); d0.theme.type = { titleSpacing: 0, titleScale: 100, lineHeight: 155, textScale: 100 };
    const h0 = head(d0), hb = head(TPL('tpl-araucaria'));
    ok(h0.css === hb.css, 'los deslizadores en su valor de partida no cambian nada');
    const t1 = TPL('tpl-neblina'); t1.theme.type = { textScale: 110 };
    ok(/body\{margin:0;[^}]*font-size:17\.6px/.test(head(t1).css), 'el texto sube un 10 %');
    const t2 = TPL('tpl-espiga');
    ok(/font-size:18\.4px/.test(head(t2).css), 'sin mover el deslizador sigue la letra grande');
    const g = TPL('tpl-espiga'); g.theme.fonts.display = 'Josefin Sans';
    const hg = head(g);
    ok(!/Josefin/.test(hg.f1) && /family=Karla/.test(hg.f1), 'una fuente escrita a mano no va en el enlace de las demás');
    eq(hg.f2, 'https://fonts.googleapis.com/css2?family=Josefin+Sans&display=swap', 'la fuente escrita a mano carga en su propio enlace');
    ok(/font-family:"Josefin Sans"|--fd:"Josefin Sans"/.test(hg.css), 'los títulos usan la fuente escrita a mano');
    const bad = TPL('tpl-espiga'); bad.theme.fonts.display = 'Evil"><script>window.__pwn=1</script>';
    const hx = head(bad);
    ok(!/<script/i.test(hx.head.replace(/<style[\s\S]*?<\/style>/g, '')) && !/Evil"/.test(hx.css), 'el nombre de la fuente se limpia');
  }

  /* 11n. Formas, bordes y sombras */
  {
    const NOW = { now: '2026-11-06T15:30:00Z' };
    const css = cfg => { const A = mount(cfg, NOW); const x = A.d.getElementById('bk-css').textContent; A.close(); return x; };
    const base = css(TPL('tpl-antojo'));
    const a = TPL('tpl-antojo'); a.theme.shape = { btn: 'recto', btnFill: 'contorno', photo: '0', chip: 'pildora', card: 'suave' };
    const x = css(a);
    ok(x.includes('#bk .btn,#bk .add,#bk .fab{border-radius:3px}') && x.includes('#bk .chip{border-radius:999px}'), 'esquinas de botones y chips');
    ok(/#bk \.btn\.pri\{background:transparent;color:var\(--ink\);border:2px solid var\(--c-btn,var\(--accent\)\)/.test(x), 'botones de contorno que siguen el color de los botones');
    ok(x.includes('#bk .media,#bk .cat-ph,#bk .gsheet .media{border-radius:0px}') && x.includes('#bk .lay-fotos .media,#bk .feat .media{border-radius:0}'), 'esquinas de las fotos');
    ok(/#bk \.card,#bk \.svc,[^{]*#bk \.wres\{border:0;box-shadow:0 1px 2px/.test(x), 'tarjetas con sombra suave en toda la app');
    const b = TPL('tpl-antojo'); b.theme.shape = { card: 'borde', border: 3 };
    ok(/\{border:3px solid color-mix\(in srgb,var\(--ink\) 18%,transparent\);box-shadow:none\}/.test(css(b)), 'grosor del borde de las tarjetas');
    const c = TPL('tpl-antojo'); c.theme.shape = { btn: 'auto', btnFill: 'auto', photo: 'auto', chip: 'auto', card: 'auto', border: 1.5 };
    ok(css(c) === base, 'en «auto» nada cambia');
  }

  /* 11o. Encabezado, navegación y pie */
  {
    const NOW = { now: '2026-11-06T15:30:00Z' };
    // Pie completo por defecto
    const e = TPL('tpl-espiga'); e.brand.instagram = 'laespiga'; e.brand.whatsapp = '573001234567'; e.brand.legal = 'NIT 900.123.456-7 <b>x</b>';
    let A = mount(e, NOW);
    ok(!!A.$('.foot .foot-tag') && /Hoy\s+6:00 a\. m\./.test(A.$('.foot .foot-hoy').textContent), 'el pie trae el eslogan y el horario de hoy');
    eq(A.$$('.foot .soc').map(a => a.getAttribute('aria-label')).join(','), 'WhatsApp,Instagram', 'redes con íconos y nombre');
    ok(A.$('.foot .soc').getAttribute('href') === 'https://wa.me/573001234567' && !A.$('.foot-legal b') && /<b>x<\/b>/.test(A.$('.foot-legal').textContent), 'enlaces de las redes y texto legal escapado');
    A.close();
    e.theme.foot = { style: 'simple' };
    A = mount(e, NOW); ok(!A.$('.foot-soc') && !A.$('.foot-hoy') && !!A.$('.foot .credit'), 'el pie sencillo es el de antes'); A.close();
    e.theme.foot = { hours: false, social: false, align: 'izq' };
    A = mount(e, NOW); ok(!A.$('.foot-hoy') && !A.$('.foot-soc') && A.$('.foot').classList.contains('fa-izq'), 'el pie se puede ajustar por partes'); A.close();
    // Barra inferior con el pedido
    const an = TPL('tpl-antojo'); an.theme.nav = 'barra';
    A = mount(an, NOW);
    eq(A.$$('.bnav button').map(b => b.getAttribute('data-nav')).join(','), 'top,carta,pedido,sellos,mas', 'barra: inicio, carta, dos atajos y más');
    ok(!A.$('.fab') && !A.$('.top .menu-btn'), 'con la barra no hay botón flotante ni menú arriba');
    A.click(A.$('.add')); A.click(A.$('.add'));
    eq(A.$('.bnav [data-nav="pedido"] .q').textContent, '2', 'la barra cuenta el pedido');
    A.click(A.$('.bnav [data-nav="pedido"]'));
    ok(A.$('.app').classList.contains('sheet-open') && /\$/.test(A.$('.sheet').textContent), 'tocar «Pedido» abre el pedido');
    A.click(A.$('[data-act="close"]'));
    A.click(A.$('.bnav [data-nav="mas"]'));
    ok(A.$$('.navi').length > 3, '«Más» abre todas las secciones');
    A.close();
    // Pestañas arriba
    const z = TPL('tpl-zocalo'); z.theme.nav = 'pestanas';
    A = mount(z, NOW);
    ok(A.$$('.tnav [data-act="goto"]').length >= 5 && A.$$('.tnav button').every(b => A.d.getElementById(b.getAttribute('data-to'))), 'pestañas con las secciones que se ven');
    A.close();
    // Encabezado
    const al = TPL('tpl-alisos'); al.theme.top = { align: 'centro', bg: 'transparente', status: false };
    A = mount(al, NOW);
    ok(!!A.$('.top.top-c .top-l .menu-btn') && !!A.$('.top-c .top-r .lang') && !A.$('.top .status'), 'encabezado centrado: menú, nombre e idioma');
    ok(/#bk \.top\{background:transparent/.test(A.d.getElementById('bk-css').textContent) && /#bk\[data-scrolled\] \.top\{/.test(A.d.getElementById('bk-css').textContent), 'encabezado transparente que se vuelve sólido al bajar');
    Object.defineProperty(A.w, 'pageYOffset', { value: 200, configurable: true });
    A.w.dispatchEvent(new A.w.Event('scroll'));
    ok(A.$('.app').hasAttribute('data-scrolled'), 'al bajar se marca para volverse sólido');
    A.close();
    const nb = TPL('tpl-neblina'); nb.theme.top = { logo: false, name: false };
    A = mount(nb, NOW); ok(!A.$('.brand-mini .logo') && !A.$('.brand-mini b') && A.$('.brand-mini').getAttribute('aria-label') === nb.brand.name, 'el encabezado puede ir sin logo ni nombre'); A.close();
  }

  /* 11p. Espaciado, separadores, títulos y diseño por sección; variantes de módulos */
  {
    const NOW = { now: '2026-11-06T15:30:00Z' };
    const css = cfg => { const A = mount(cfg, NOW); const x = A.d.getElementById('bk-css').textContent; A.close(); return x; };
    const a = TPL('tpl-zocalo'); a.theme.space = { density: 'compacta', sep: 'ornamento' }; a.theme.heads = { align: 'centro', orn: 'linea', kicker: 'ocultar' };
    const x = css(a);
    ok(x.includes('#bk main>.m:not(.m-hero):not(.m-aviso):not(.sp-compacto):not(.sp-amplio){padding-top:30px}'), 'menos espacio entre secciones, salvo las que eligen el suyo');
    ok(/#bk main>\.m\+\.m\.sb:not\(\.m-aviso\)::before,[^{]*#bk main>\.m\.sb\+\.m:not\(\.m-aviso\)::after\{display:none\}/.test(x), 'sin separador junto a una sección con fondo propio');
    ok(x.includes('#bk .m.sa-izq .sh{text-align:left}'), 'la alineación de cada sección le gana a la general');
    ok(/#bk main>\.m\+\.m:not\(\.m-aviso\)::after\{content:"";position:absolute;left:50%;top:1px;width:7px/.test(x), 'separador con ornamento');
    ok(x.includes('#bk .sh{text-align:center}') && /#bk \.sh \.orn\{display:block;width:56px;height:2px/.test(x) && x.includes('#bk .sh-k{display:none}'), 'títulos centrados, con línea y sin antetítulos');
    // Diseño de una sección
    const b = TPL('tpl-zocalo'); const ho = b.modules.find(m => m.type === 'horario');
    Object.assign(ho.s, { _bg: 'invertido', _align: 'centro', _pad: 'amplio', kicker: 'Te esperamos' });
    const pr = b.modules.find(m => m.type === 'contacto'); Object.assign(pr.s, { _bg: 'acento' });
    let A = mount(b, NOW);
    const sec = A.$('section[data-mid="' + ho.id + '"]');
    ok(sec.classList.contains('sb-invertido') && sec.classList.contains('sa-centro') && sec.classList.contains('sp-amplio'), 'la sección lleva su fondo, alineación y espacio');
    ok(new RegExp('--bg:' + b.theme.colors.ink + ';--ink:' + b.theme.colors.bg).test(sec.getAttribute('style')), 'el fondo invertido cambia los colores solo adentro');
    {
      // Los acentos se aclaran u oscurecen hasta leerse sobre el fondo nuevo
      const L = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
      const R = (a, z) => { const p = L(a), q = L(z); return (Math.max(p, q) + 0.05) / (Math.min(p, q) + 0.05); };
      const st = sec.getAttribute('style'), get = k => (st.match(new RegExp('--' + k + ':(#[0-9a-f]{6})', 'i')) || [])[1];
      ok(['accent', 'accent2', 'accent3'].every(k => get(k) && R(get(k), b.theme.colors.ink) >= 4.5), 'acentos legibles sobre el fondo invertido: ' + ['accent', 'accent2', 'accent3'].map(get).join(' '));
    }
    eq(sec.querySelector('.sh-k').textContent, 'Te esperamos', 'antetítulo propio de la sección');
    ok(/--accent:#(ffffff|141414);--on-accent:/.test(A.$('section[data-mid="' + pr.id + '"]').getAttribute('style')), 'en una sección de acento los botones cambian de color');
    A.close();
    b.theme.roles = { btn: '#1F7A8C', price: 'accent3' };
    A = mount(b, NOW);
    ok(/--c-btn:initial;--c-btn-on:initial;--c-price:initial/.test(A.$('section[data-mid="' + ho.id + '"]').getAttribute('style')), 'adentro, los colores por elemento vuelven a los de la estética');
    A.close();
    const bad = TPL('tpl-zocalo'); bad.modules.find(m => m.type === 'horario').s._bg = 'x" onmouseover="alert(1)';
    A = mount(bad, NOW); ok(!A.$('[onmouseover]') && !A.$('section.sb'), 'un fondo desconocido no se usa'); A.close();
    // Variantes
    const v = TPL('tpl-araucaria'), de = v.modules.find(m => m.type === 'destacados');
    de.s.layout = 'cuadricula';
    v.modules.find(m => m.type === 'horario').s.layout = 'compacto';
    v.modules.find(m => m.type === 'contacto').s.layout = 'botones';
    A = mount(v, NOW);
    ok(!!A.$('section[data-mid="' + de.id + '"] .feat-cuadricula .feat') && !A.$('section[data-mid="' + de.id + '"] .rail'), 'destacados en cuadrícula');
    eq(A.$$('.hours.hc dt').map(d => d.firstChild.textContent).join(' | '), 'Lunes | Martes a jueves | Viernes y sábado | Domingo', 'horario compacto con los días seguidos juntos');
    ok(A.$('.hours.hc .hrow.today dt').textContent.indexOf('Viernes y sábado') === 0 && /Cerrado/.test(A.$$('.hours.hc dd')[0].textContent), 'marca el grupo de hoy y los días cerrados');
    ok(!!A.$('.contact.clg .cl'), 'contacto con botones de ícono');
    A.close();
    const zo = TPL('tpl-zocalo');
    zo.modules.find(m => m.type === 'eventos').s.layout = 'linea';
    Object.assign(zo.modules.find(m => m.type === 'resenas').s, { layout: 'destacada', quotes: [{ text: 'El mejor chorizo de la vía.', author: 'Ana' }, { text: '<b>Volvemos</b>', author: 'Luis' }] });
    A = mount(zo, NOW);
    ok(A.$$('.events.tl .ev').length === 3, 'agenda en línea de tiempo');
    ok(A.$$('.quotes.qbig .quote').length === 2 && !A.$('.qbig blockquote b'), 'reseñas con cita grande y texto escapado');
    A.close();
    const pz = TPL('tpl-antojo'); pz.modules.find(m => m.type === 'promos').s.layout = 'carrusel';
    A = mount(pz, NOW); ok(!!A.$('.rail.promo-rail .promo') && !A.$('.promos'), 'promociones en carrusel'); A.close();
    // En inglés el horario compacto también junta los días
    v.i18n = Object.assign({}, v.i18n, { bilingual: true });
    A = mount(v, { now: NOW.now, lang: 'en-US' });
    eq(A.$$('.hours.hc dt').map(d => d.firstChild.textContent).join(' | '), 'Monday | Tuesday to Thursday | Friday and Saturday | Sunday', 'horario compacto en inglés');
    A.close();
  }

  /* 11q. Carta a fondo */
  {
    const NOW = { now: '2026-11-06T15:30:00Z' };
    const css = cfg => { const A = mount(cfg, NOW); const x = A.d.getElementById('bk-css').textContent; A.close(); return x; };
    const L = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
    const R = (a, z) => { const p = L(a), q = L(z); return (Math.max(p, q) + 0.05) / (Math.min(p, q) + 0.05); };
    const lay = (cfg, l) => { cfg.modules.find(m => m.type === 'carta').s.layout = l; return cfg; };
    // En «auto» nada cambia
    const base = css(TPL('tpl-zocalo'));
    const z0 = TPL('tpl-zocalo'); z0.theme.carta = { shape: 'auto', size: 'auto', pos: 'auto', desc: 'auto', price: 'auto', tags: 'auto', lead: 'auto', cat: 'auto', catPhoto: 'auto', catIcon: 'auto', tabs: 'auto', cols: 'auto' };
    ok(css(z0) === base, 'carta en «auto»: nada cambia');
    const zx = TPL('tpl-zocalo'); zx.theme.carta = { shape: 'x;}body{color:red', cols: '9', price: '"><b>', desc: '7' };
    ok(css(zx) === base, 'valores desconocidos en la carta no escriben nada');
    // Fotos: tamaño, posición, forma y columnas
    const a = TPL('tpl-zocalo'); a.theme.carta = { shape: 'circulo', size: 'l', pos: 'der', desc: '2', cols: '3' };
    let x = css(a);
    ok(x.includes('#bk .carta-body.lay-tarjetas .media{width:96px;height:96px;font-size:48px}') && x.includes('#bk .carta-body.lay-tarjetas .it{grid-template-columns:minmax(0,1fr) 96px}'), 'fotos grandes a la derecha en las tarjetas');
    ok(x.includes('#bk .carta-body.lay-cuadricula .media{width:100%;aspect-ratio:1;margin:2px auto 12px;border-radius:50%}'), 'fotos en círculo en la cuadrícula');
    ok(/#bk \.carta-body \.it-d\{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2/.test(x), 'descripción en dos líneas');
    ok(x.includes('#bk .carta-body.lay-cuadricula .items{grid-template-columns:repeat(3,minmax(0,1fr))}') && x.includes('#bk .carta-body.lay-fotos .items{grid-template-columns:repeat(2,minmax(0,1fr))}'), 'tres columnas en la cuadrícula y dos en fotos grandes');
    const ar = TPL('tpl-zocalo'); ar.theme.carta = { shape: 'arco' };
    ok(css(ar).includes('#bk .carta-body.lay-fotos .media{width:calc(100% - 32px);aspect-ratio:4/3;margin:16px 16px 0;border-radius:999px 999px 6px 6px}'), 'fotos grandes en arco');
    // La cuadrícula trae la descripción oculta, y se ve cuando se pide
    let A = mount(lay(TPL('tpl-zocalo'), 'cuadricula'), NOW);
    ok(A.$$('.lay-cuadricula .it-d').length > 0 && /\n\.lay-cuadricula \.it-d\{display:none\}/.test(A.d.getElementById('bk-css').textContent), 'la cuadrícula trae la descripción oculta');
    A.close();
    const gd = lay(TPL('tpl-zocalo'), 'cuadricula'); gd.theme.carta = { desc: 'completa' };
    ok(css(gd).includes('#bk .carta-body.lay-cuadricula .it-d{display:block}'), 'descripción completa en la cuadrícula');
    // Precio y etiquetas legibles
    const pz = TPL('tpl-antojo'); pz.theme.carta = { price: 'color', tags: 'contorno' };
    x = css(pz);
    const pcol = (x.match(/#bk \.carta-body \.price,#bk \.feat \.price\{[^}]*color:var\(--c-price,(#[0-9a-f]{6})\)/) || [])[1];
    const tcol = (x.match(/#bk \.tag:not\(\.sold\)\{color:var\(--c-tag,(#[0-9a-f]{6})\)/) || [])[1];
    ok(!!pcol && R(pcol, pz.theme.colors.bg) >= 4.5 && R(pcol, pz.theme.colors.surface) >= 4.5, 'precio en color que se lee sobre el fondo y las tarjetas: ' + pcol);
    ok(!!tcol && R(tcol, pz.theme.colors.bg) >= 4.5, 'etiquetas de contorno que se leen: ' + tcol);
    const pp = TPL('tpl-zocalo'); pp.theme.carta = { price: 'pildora', tags: 'punto', lead: 'linea' };
    x = css(pp);
    ok(x.includes('#bk .carta-body .price,#bk .feat .price{background:var(--c-price,var(--accent));color:var(--c-price-on,var(--on-accent));padding:3px 10px'), 'precio en píldora');
    ok(x.includes('#bk .tag::before,#bk .tag+.tag::before{content:"";flex:none;width:7px;height:7px') && x.includes('#bk .carta-body .lead{border-bottom-style:solid;border-bottom-width:1px}'), 'etiquetas con punto y guía de línea');
    // Categorías: títulos, íconos, foto y pestañas
    const k = TPL('tpl-zocalo'); k.theme.carta = { cat: 'banda', catIcon: 'mostrar', catPhoto: 'fondo', tabs: 'subrayado' };
    k.menu.categories[0].img = 'https://example.com/cat.jpg';
    x = css(k);
    ok(x.includes('#bk .carta-body .cat-h{background:var(--accent);color:var(--on-accent);padding:12px 16px'), 'títulos de categoría sobre una franja');
    ok(x.includes('#bk .cat-h .ci,#bk .cat-tabs .ci{display:inline-flex}') && x.includes('#bk .carta-body .cat.has-ph>.cat-h{grid-area:1/1;align-self:end'), 'íconos siempre y foto detrás del título');
    ok(x.includes('#bk .cat-tabs .chip.on{background:none;color:var(--ink);border-bottom-color:var(--c-sel,var(--accent))'), 'pestañas subrayadas');
    const el = lay(TPL('tpl-zocalo'), 'lista'); el.theme.skin = 'elegante';
    A = mount(el, NOW);
    ok(!!A.$('.lay-lista .cat-h .ci') && !!A.$('.cat-tabs .ci') && /\[data-skin="elegante"\] \.cat-tabs \.ci\{display:none\}/.test(A.d.getElementById('bk-css').textContent), 'el ícono de la categoría está en la página aunque la estética lo oculte');
    A.close();
    const ln = TPL('tpl-zocalo'); ln.theme.carta = { cat: 'linea', tabs: 'ocultar', catPhoto: 'ocultar' };
    x = css(ln);
    ok(x.includes('#bk .carta-body .cat-h h3::after{content:"";display:block;flex:1') && x.includes('#bk .cat-tabs{display:none}') && x.includes('#bk .cat-ph{display:none}'), 'títulos con línea, sin pestañas y sin foto de categoría');
    ok(x.includes('#bk .carta-body .cat-h{display:block;position:static;background:none;color:inherit;padding:0;border:0;'), 'el estilo de título deshace el encabezado propio de la estética');
  }

  /* 11r. Movimiento */
  {
    const NOW = { now: '2026-11-06T15:30:00Z' };
    const css = (cfg, o) => { const A = mount(cfg, Object.assign({}, NOW, o)); const x = A.d.getElementById('bk-css').textContent; A.close(); return x; };
    // IntersectionObserver de mentira: guarda lo observado para «entrar» a mano
    const io = w => { w.__ios = []; w.IntersectionObserver = class { constructor(cb) { this.cb = cb; this.els = []; w.__ios.push(this); } observe(el) { this.els.push(el); } unobserve(el) { this.els = this.els.filter(e => e !== el); } disconnect() { this.els = []; } }; };
    const base = css(TPL('tpl-zocalo'));
    const z0 = TPL('tpl-zocalo'); z0.theme.fx = { entry: 'auto', reveal: 'auto', tap: 'auto', speed: 'auto', marquee: 'auto', deco: 'auto', confetti: 'auto' };
    ok(css(z0) === base, 'movimiento en «auto»: nada cambia');
    const zx = TPL('tpl-zocalo'); zx.theme.fx = { entry: 'x}body{', reveal: '1', tap: '<b>', speed: '9', marquee: 'loca', deco: 'si' };
    ok(css(zx) === base, 'valores desconocidos de movimiento no escriben nada');
    // Quieto o «reducir movimiento»: nada
    const off = TPL('tpl-zocalo'); off.theme.motion = 'off'; const offBase = css(off);
    off.theme.fx = { entry: 'zoom', reveal: 'subir', tap: 'rebote', marquee: 'rapida', deco: 'animadas' };
    ok(css(off) === offBase, 'con el movimiento quieto no se escribe ninguna animación');
    const red = TPL('tpl-zocalo'); red.theme.fx = { entry: 'zoom', reveal: 'subir', tap: 'rebote' };
    ok(!/#bk\.intro|data-rv|transform:scale\(\.92\);transition-duration/.test(css(red, { reduce: true })), '«reducir movimiento» del celular siempre gana');
    // Entrada, toque y velocidad
    const a = TPL('tpl-zocalo'); a.theme.fx = { entry: 'aparecer', tap: 'rebote', speed: 'lenta' };
    let x = css(a);
    ok(x.includes('#bk.intro .m{animation:fadein 1.35s ease both}#bk.intro .m:nth-child(2){animation-delay:0.12s}'), 'entrada que aparece, más lenta y escalonada');
    ok(x.includes('#bk .btn:active,#bk .add:active,#bk .chip:active,#bk .it:active') && /transform:scale\(\.92\);transition-duration:\.08s/.test(x), 'efecto de rebote al tocar');
    const sp = TPL('tpl-zocalo'); sp.theme.fx = { speed: 'rapida' };
    ok(css(sp).includes('#bk.intro .m{animation:rise 0.48s cubic-bezier(.2,.7,.2,1) both}'), 'la velocidad también cambia la entrada de siempre');
    // Aparición al bajar
    const r = TPL('tpl-zocalo'); r.theme.fx = { reveal: 'zoom' };
    let A = mount(r, Object.assign({ setup: io }, NOW));
    ok(A.$('.app').getAttribute('data-rv') === 'zoom' && A.$$('.rv').length > 5 && !A.$('.m-hero.rv') && !A.$('section.m-carta.rv') && !!A.$('.m-carta .it.rv'), 'las secciones y los platos esperan a entrar en pantalla');
    ok(/#bk\[data-rv\] \.rv:not\(\.rv-in\)\{opacity:0\}#bk\[data-rv\] \.rv\.rv-in:not\(\.rv-now\)\{animation:zoomin 0\.7s/.test(A.d.getElementById('bk-css').textContent), 'reglas de aparición');
    const obs = A.w.__ios.find(o => o.els.some(e => e.classList.contains('rv')));
    const two = obs.els.slice(0, 2);
    obs.cb(two.map(el => ({ target: el, isIntersecting: true })));
    ok(two.every(el => el.classList.contains('rv-in')) && two[1].style.getPropertyValue('--rvd') === '0.07s' && !obs.els.includes(two[0]), 'al entrar aparecen escalonadas y se dejan de observar');
    A.rt.update(r);
    ok(A.$$('.rv').every(el => el.classList.contains('rv-in') && el.classList.contains('rv-now')), 'al volver a pintar, lo que está a la vista aparece sin animación');
    A.close();
    A = mount(r, NOW); ok(!A.$('.app').hasAttribute('data-rv') && !A.$('.rv'), 'sin IntersectionObserver todo se ve de una vez'); A.close();
    // Cinta de palabras y decoraciones
    const ne = TPL('tpl-neblina'); ne.theme.fx = { marquee: 'lenta' };
    const words = ne.modules.find(m => m.type === 'hero').s.ribbon.split(',').length;
    A = mount(ne, NOW);
    ok(A.$$('.ribbon-track span').length === words * 2 && /#bk \.ribbon-track\{display:inline-flex;flex-wrap:nowrap;gap:0;animation:marq 42s linear infinite\}/.test(A.d.getElementById('bk-css').textContent), 'la cinta se mueve en cualquier estética');
    A.close();
    const an = TPL('tpl-antojo'); an.theme.fx = { marquee: 'quieta', deco: 'quietas' };
    const wa = an.modules.find(m => m.type === 'hero').s.ribbon.split(',').length;
    A = mount(an, NOW);
    ok(A.$$('.ribbon-track span').length === wa && A.d.getElementById('bk-css').textContent.includes('#bk .stk,#bk .neon.on{animation:none}'), 'cinta quieta y stickers quietos en la estética animada');
    A.close();
    const de = TPL('tpl-zocalo'); de.theme.fx = { deco: 'animadas' };
    ok(css(de).includes('#bk .stk{animation:float 3.2s ease-in-out infinite}'), 'stickers que flotan con movimiento suave');
    // Confeti
    const tz = TPL('tpl-zocalo'), tm = tz.modules.find(m => m.type === 'trivia'), q0 = tm.s.questions.find(q => q && q.q);
    const hit = cfg => { const B = mount(cfg, NOW); B.click(B.$('section[data-mid="' + tm.id + '"] [data-act="tq"][data-a="' + q0.correct + '"]')); const has = !!B.$('.confetti'); B.close(); return has; };
    ok(!hit(tz), 'con movimiento suave no hay confeti');
    tz.theme.fx = { confetti: 'siempre' };
    ok(hit(tz), 'confeti siempre, aunque el movimiento sea suave');
    tz.theme.motion = 'vivo'; tz.theme.fx = { confetti: 'nunca' };
    ok(!hit(tz), 'sin confeti aunque el movimiento sea vivo');
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
  const LA = 'a1'.padEnd(32, '0'), LB = 'b2'.padEnd(32, '0');
  const assetStore = new Map(), deletedAssets = []; let assetN = 0;
  docs.set('biblioteca-fotos', { kind: 'break-fotos', items: [{ id: LA, w: 1200, h: 800, bytes: 2048, at: 1 }, { id: LB, w: 900, h: 900, bytes: 1024, at: 2 }] });
  const fakeAssets = {
    upload: async b => { const id = ('n' + (++assetN)).padEnd(32, '0'); assetStore.set(id, b); return { id, url: '/_blob/' + id, sizeBytes: b.size, contentType: b.type }; },
    list: async () => ({ assets: [...assetStore.keys()].map(id => ({ id, url: '/_blob/' + id, contentType: 'image/webp', sizeBytes: 1024, createdAt: '2026-11-01T00:00:00Z' })), usage: { files: assetStore.size, bytes: assetStore.size * 1024, maxFiles: 1000, maxBytes: 500 * 1048576 } }),
    delete: async id => { deletedAssets.push(id); return { deleted: assetStore.delete(id) }; }
  };
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    pretendToBeVisual: true, runScripts: 'dangerously', url: 'https://claude.ai/artifact/test', virtualConsole: quietConsole(),
    beforeParse(w) {
      w.matchMedia = q => ({ matches: /min-width: 1000px/.test(q), addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
      w.scrollTo = () => {};
      w.claude = { use: async n => n === 'db' ? fakeDb : n === 'user' ? { id: async () => 'u_test' } : n === 'downloads' ? { save: async r => { saved.push(r); return { status: 'saved' }; } } : n === 'assets' ? fakeAssets : null };
      [LA, LB].forEach(id => assetStore.set(id, new w.Blob([new Uint8Array([82, 73, 70, 70, 1, 2, 3, 4])], { type: 'image/webp' })));
      w.fetch = async u => { const m = /\/_blob\/([\w-]+)$/.exec(String(u)); const b = m && assetStore.get(m[1]); return b ? { ok: true, status: 200, blob: async () => b } : { ok: false, status: 404 }; };
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
  ok(!!ST.lib.cap && ST.lib.index.length === 2, 'la biblioteca de fotos conecta y lee su índice');
  ok(!ST.S.apps.some(a => a.id === 'biblioteca-fotos'), 'el índice de fotos no se confunde con una app');
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
  // Marca: logo con ícono, forma e ícono de la app
  setVal(d.getElementById('f-brand-logo-type'), 'icon', 'change');
  ok(!!$('.icof[data-icof="brand.logo.value"]') && !$('.icof[data-icof="brand.logo.value"] .help'), 'el logo puede ser un ícono de línea');
  click($('.icof[data-icof="brand.logo.value"] [data-a="ico-open"]'));
  click($('.icof[data-icof="brand.logo.value"] [data-a="ico-pick"][data-v="cafe"]'));
  eq(ST.S.cur.brand.logo.value, 'cafe', 'elige el ícono del logo');
  ok(!$('[data-a="set"][data-p="brand.logo.shape"][data-v="horizontal"]'), 'la forma horizontal solo se ofrece para imágenes');
  click($('[data-a="set"][data-p="brand.logo.shape"][data-v="cuadrado"]'));
  eq(ST.S.cur.brand.logo.shape, 'cuadrado', 'elige la forma del logo');
  await sleep(220);
  ok(!!ST.pv.frame.contentDocument.querySelector('.brand-mini .logo.ico svg'), 'la vista previa muestra el logo con ícono');
  ok(!!$('.appi .appi-ic svg'), 'el ícono de la app usa el logo con ícono');
  click($('[data-a="set"][data-p="brand.appIcon.content"][data-v="iniciales"]'));
  ok(!$('.appi .appi-ic svg') && /AC/.test($('.appi .appi-ic').textContent), 'el ícono de la app puede llevar las iniciales');
  click($('[data-a="set"][data-p="brand.appIcon.bg"][data-v="ink"]'));
  eq(ST.S.cur.brand.appIcon.bg, 'ink', 'elige el fondo del ícono');
  ok($('.appi-ic').getAttribute('style').toLowerCase().includes(ST.S.cur.theme.colors.ink.toLowerCase()), 'la vista del ícono usa ese fondo');
  click($('[data-a="set"][data-p="brand.appIcon.content"][data-v="logo"]'));
  click($('[data-a="set"][data-p="brand.appIcon.bg"][data-v="accent"]'));
  setVal(d.getElementById('f-brand-logo-type'), 'mono', 'change');
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
  const cartaIdx = ST.S.cur.modules.findIndex(m => m.type === 'carta');
  click($('[data-a="mod-open"][data-mid="carta"]'));
  eq(d.getElementById('f-modules-' + cartaIdx + '-s-layout').options.length, 5, 'cinco diseños de carta para elegir');
  click($('[data-a="mod-open"][data-mid="hero"]'));
  const heroImg = d.getElementById('f-modules-0-s-img');
  ok(!!heroImg, 'campo de foto en la portada');
  setVal(heroImg, 'https://example.com/portada.jpg');
  eq(ST.S.cur.modules[0].s.img, 'https://example.com/portada.jpg', 'pegar el enlace de la foto de portada');
  eq(d.getElementById('f-modules-0-s-veil').value, '60', 'el velo arranca en «Medio»');
  eq(d.getElementById('f-modules-0-s-align').value, 'auto', 'la alineación arranca en la de la estética');
  ST.S.cur.modules[0].s.img = PX;
  click($('[data-a="mod-open"][data-mid="hero"]')); click($('[data-a="mod-open"][data-mid="hero"]'));
  ok(!!$('.img-row img') && /Foto subida/.test($('.img-row').textContent), 'muestra la foto subida con su peso');
  ok(/con foto/.test($('.mod[data-mid="hero"] .mod-n small').textContent), 'el resumen de la portada dice que tiene foto');
  click($('[data-a="img-clear"]'));
  eq(ST.S.cur.modules[0].s.img, '', 'quitar la foto');
  const pick = $('.imgf[data-imgf="modules.0.s.img"] [data-a="lib-pick"]');
  ok(!!pick, 'el campo de foto ofrece la biblioteca');
  click(pick);
  eq($$('#sheet .libi').length, 2, 'la biblioteca muestra sus fotos');
  ok($$('#sheet .libi').every(b => !!b.getAttribute('aria-label')), 'cada foto de la biblioteca tiene nombre');
  click($('#sheet .libi[data-id="' + LA + '"]'));
  eq(ST.S.cur.modules[0].s.img, 'asset:' + LA, 'elige una foto de la biblioteca para la portada');
  ok($('#sheet').hidden && /Foto de la biblioteca/.test($('.imgf[data-imgf="modules.0.s.img"] .img-row').textContent), 'la hoja se cierra y el campo muestra la foto elegida');
  await sleep(220);
  ok(/\/_blob\/a10+$/.test(ST.pv.frame.contentDocument.querySelector('.hero-ph img').getAttribute('src')), 'la vista previa muestra la foto de la biblioteca');
  click($('[data-a="set"][data-p="modules.0.s.imgPos"][data-v="top"]'));
  eq(ST.S.cur.modules[0].s.imgPos, 'top', 'elige el encuadre de la foto');
  await sleep(220);
  ok(!!ST.pv.frame.contentDocument.querySelector('.hero-ph img.op-t'), 'la vista previa usa el encuadre');
  // Portada por piezas
  eq($$('.mod[data-mid="hero"] .dths .dth').length, 11, 'once opciones de decoración con miniatura');
  ok($('.dth[data-v="auto"]').getAttribute('aria-pressed') === 'true' && /--leaf:/.test($('.dth .dth-a').getAttribute('style')), 'arranca en la de la estética y las miniaturas usan la paleta');
  ok(!!$('.dth[data-v="willys"] .dth-a svg.art-will') && !!$('#deco-css'), 'la miniatura del Willys se dibuja con el CSS del motor');
  click($('[data-a="set"][data-p="modules.0.s.deco"][data-v="araucarias"]'));
  eq(ST.S.cur.modules[0].s.deco, 'araucarias', 'elige las araucarias');
  setVal(d.getElementById('f-modules-0-s-variant'), 'arriba', 'change');
  eq(ST.S.cur.modules[0].s.variant, 'arriba', 'elige foto arriba y texto abajo');
  await sleep(220);
  ok(!!ST.pv.frame.contentDocument.querySelector('.hero-box.v-arriba svg.art-arau'), 'la vista previa muestra el nuevo diseño con las araucarias');
  click($('[data-a="set"][data-p="modules.0.s.height"][data-v="alta"]'));
  eq(ST.S.cur.modules[0].s.height, 'alta', 'elige el alto de la portada');
  click($('[data-a="set"][data-p="modules.0.s.logo"][data-v="si"]'));
  await sleep(220);
  ok(!!ST.pv.frame.contentDocument.querySelector('.hero-box.hh-alta .hero-mono'), 'la vista previa usa el alto y el logo');
  click($('[data-a="set"][data-p="modules.0.s.deco"][data-v="auto"]'));
  click($('[data-a="set"][data-p="modules.0.s.logo"][data-v="auto"]'));
  click($('[data-a="set"][data-p="modules.0.s.height"][data-v="auto"]'));
  setVal(d.getElementById('f-modules-0-s-variant'), 'auto', 'change');
  const heavy = JSON.parse(JSON.stringify(ST.S.cur)); heavy.modules[0].s.img = 'data:image/webp;base64,' + 'A'.repeat(230000);
  ok(ST.checks(heavy).some(c => c.s === 'warn' && /pesa/.test(c.t)), 'la revisión avisa si la app pesa demasiado para guardarla');
  ok(!ST.checks(ST.S.cur).some(c => /pesa/.test(c.t)), 'sin fotos pesadas no hay aviso de peso');
  // Módulos nuevos desde el catálogo
  click($('[data-a="mod-add"]'));
  click($('.mc[data-type="aviso"]'));
  eq(ST.S.cur.modules[0].type, 'aviso', 'el aviso se agrega arriba de todo');
  setVal(d.getElementById('f-modules-0-s-text'), 'Hoy cerramos a las 6');
  ok(!!$('.icof[data-icof="modules.0.s.ico"]') && /Megáfono|Anuncio/.test($('.icof[data-icof="modules.0.s.ico"] .icob').textContent), 'el aviso ofrece elegir su ícono');
  setVal(d.getElementById('f-modules-0-s-until'), '2026-01-01');
  eq(ST.S.cur.modules[0].s.until, '2026-01-01', 'fecha de vencimiento del aviso');
  ok(ST.checks(ST.S.cur).some(c => c.s === 'warn' && /ya venció/.test(c.t)), 'la revisión avisa que el aviso venció');
  click($('[data-a="mod-del"][data-mid="' + ST.S.cur.modules[0].id + '"]'));
  click($('[data-a="confirm-yes"]'));
  click($('[data-a="mod-add"]'));
  click($('.mc[data-type="servicios"]'));
  const svIdx = ST.S.cur.modules.findIndex(m => m.type === 'servicios');
  click($('[data-a="chk"][data-p="modules.' + svIdx + '.s.list"][data-v="mascotas"]'));
  ok(ST.S.cur.modules[svIdx].s.list.includes('mascotas'), 'marcar un servicio');
  click($('[data-a="chk"][data-p="modules.' + svIdx + '.s.list"][data-v="wifi"]'));
  ok(!ST.S.cur.modules[svIdx].s.list.includes('wifi'), 'desmarcar un servicio');
  click($('[data-a="mod-del"][data-mid="' + ST.S.cur.modules[svIdx].id + '"]'));
  click($('[data-a="confirm-yes"]'));
  eq(ST.S.cur.modules.length, nMods, 'los módulos de prueba se quitaron');

  // Estilo: cambiar de estética y de paleta
  click($('[data-a="tab"][data-t="estilo"]'));
  click($('[data-a="skin"][data-s="nocturna"]'));
  eq(ST.S.cur.theme.fonts.display, 'Tilt Neon', 'estética nocturna: tipografía de neón');
  eq(ST.S.cur.theme.icons, 'emoji', 'la nocturna conserva los emojis');
  eq(ST.pv.frame.contentDocument.querySelector('.app').getAttribute('data-skin'), 'nocturna', 'la vista previa cambia a la nocturna');
  ok(/Neón/.test($('.skin[aria-pressed="true"]').textContent), 'la tarjeta de la nocturna queda marcada');
  click($('[data-a="skin"][data-s="cultural"]'));
  eq(ST.S.cur.theme.skin, 'cultural', 'cambia la estética');
  eq(ST.S.cur.theme.fonts.display, 'Alfa Slab One', 'aplica la tipografía de la estética');
  eq(ST.S.cur.theme.icons, 'linea', 'la cultural trae íconos de línea');
  eq(ST.S.cur.modules.find(m => m.type === 'carta').s.layout, 'tarjetas', 'aplica el diseño de carta de la estética');
  eq($$('.pal').length, 5, 'cinco paletas para la estética');
  click($('[data-a="pal"][data-i="2"]'));
  eq(ST.S.cur.theme.colors.bg, '#2A1E17', 'aplica la paleta');
  eq($$('.tex').length, ctx.TEXTURES.length, 'muestras de todas las texturas');
  ok($('.texs').getAttribute('style').includes('--tb:#2A1E17'), 'las muestras usan los colores de la paleta');
  click($('[data-a="tex"][data-v="cuadros"]'));
  eq(ST.S.cur.theme.texture, 'cuadros', 'elige el mantel de cuadros');
  ok($('[data-a="tex"][data-v="cuadros"]').getAttribute('aria-pressed') === 'true', 'la muestra elegida queda marcada');
  await sleep(220);
  eq(ST.pv.frame.contentDocument.documentElement.getAttribute('data-tex'), 'cuadros', 'la vista previa muestra la textura');
  ok($('[data-a="set"][data-p="theme.buttons"][data-v="auto"]').classList.contains('on'), 'los botones arrancan según la estética');
  click($('[data-a="set"][data-p="theme.buttons"][data-v="contorno"]'));
  eq(ST.S.cur.theme.buttons, 'contorno', 'elige botones de contorno');
  await sleep(220);
  eq(ST.pv.frame.contentDocument.querySelector('.app').getAttribute('data-btn'), 'contorno', 'la vista previa usa los botones de contorno');
  ok($('[data-a="set"][data-p="theme.textSize"][data-v="normal"]').classList.contains('on'), 'el texto arranca en tamaño normal');
  click($('[data-a="set"][data-p="theme.textSize"][data-v="grande"]'));
  eq(ST.S.cur.theme.textSize, 'grande', 'elige letra grande');
  await sleep(220);
  ok(/font-size:18\.4px/.test(ST.pv.frame.contentDocument.getElementById('bk-css').textContent), 'la vista previa usa letra grande');
  click($('[data-a="set"][data-p="theme.textSize"][data-v="normal"]'));
  setVal(d.getElementById('h-accent'), '#ff0000');
  eq(ST.S.cur.theme.colors.accent, '#FF0000', 'color escrito a mano');
  eq(d.getElementById('c-accent').value, '#ff0000', 'sincroniza el selector de color');
  setVal(d.getElementById('h-ink'), '#2A1E18');
  ok(/Poco contraste/.test($('#contrast').textContent), 'avisa si el texto no se lee');

  // Estilo: modo sencillo, opciones avanzadas y restablecer
  const basicCards = ctx.STYLE.reduce((a, g) => a + g.cards.filter(c => !c.adv).length, 0);
  eq(ST.S.adv, false, 'el estudio arranca en modo sencillo');
  eq($$('.editor section[data-card]').length, basicCards, 'modo sencillo: todas las tarjetas básicas en una sola página');
  ok(!$('.subnav'), 'modo sencillo: sin secciones');
  const rad = d.getElementById('f-theme-radius');
  ok(!!rad && rad.type === 'range', 'las esquinas son un deslizador');
  setVal(rad, '20');
  eq(ST.S.cur.theme.radius, 20, 'el deslizador cambia las esquinas');
  eq($('output[data-out="theme.radius"]').textContent, '20 px', 'y muestra el valor mientras se mueve');
  ok(!$('[data-a="style-reset"][data-card="forma"]').hidden, 'aparece «Restablecer» en la tarjeta que cambió');
  click($('[data-a="set"][data-p="theme.motion"][data-v="vivo"]'));
  eq(ST.S.cur.theme.motion, 'vivo', 'elige el movimiento con los botones de opción');
  ok(!$('[data-a="style-reset"][data-card="mov"]').hidden && $('[data-a="set"][data-p="theme.motion"][data-v="vivo"]').classList.contains('on'), 'la opción elegida queda marcada');
  click($('[data-a="style-reset"][data-card="forma"]'));
  eq(ST.S.cur.theme.radius, ctx.SKINS.cultural.defaults.radius, 'restablecer devuelve las esquinas de la estética');
  ok(!('buttons' in ST.S.cur.theme), 'y quita la opción de botones, que no viene de la estética');
  ok($('[data-a="style-reset"][data-card="forma"]').hidden, 'la tarjeta restablecida ya no ofrece «Restablecer»');
  eq(ST.S.cur.theme.motion, 'vivo', 'restablecer una tarjeta no toca las demás');
  click($('[data-a="adv"]'));
  eq(ST.S.adv, true, 'activa las opciones avanzadas');
  eq(w.localStorage.getItem('break.studio.adv'), 'true', 'y lo recuerda en el navegador');
  eq($('[data-a="adv"]').getAttribute('aria-checked'), 'true', 'el interruptor queda encendido');
  eq($$('.subnav [data-a="sub"]').length, ctx.STYLE.filter(g => g.cards.length).length, 'modo avanzado: una sección por grupo');
  eq($$('.editor section[data-card]').length, 1, 'modo avanzado: solo se ve la sección abierta');
  click($('[data-a="sub"][data-g="color"]'));
  ok(!!d.getElementById('h-accent') && !$('.skins') && $('[data-a="sub"][data-g="color"]').getAttribute('aria-selected') === 'true', 'cambia a la sección Color');
  click($('[data-a="adv"]'));
  eq($$('.editor section[data-card]').length, basicCards, 'vuelve al modo sencillo');
  ok(!$('#style-foot').hidden, 'avisa que la app tiene ajustes propios');
  click($('[data-a="style-reset-all"]'));
  click($('[data-a="confirm-yes"]'));
  ok(JSON.stringify(ST.S.cur.theme) === JSON.stringify(Object.assign({ skin: 'cultural' }, ctx.SKINS.cultural.defaults)), 'volver a la estética deja el tema como viene de fábrica');
  ok($('#style-foot').hidden && $$('[data-a="style-reset"]').every(b => b.hidden), 'sin ajustes propios no se ofrece restablecer');
  // Estilo: biblioteca de fotos
  ok(!!$('section[data-card="fotos"]') && /2 fotos/.test($('section[data-card="fotos"] [data-lib-meter]').textContent), 'la tarjeta de la biblioteca muestra el espacio usado');
  const clean = $('section[data-card="fotos"] [data-a="lib-clean"]');
  ok(!!clean && /\(1\)/.test(clean.textContent), 'cuenta las fotos que ninguna app usa');
  click(clean);
  click($('[data-a="confirm-yes"]'));
  await sleep(80);
  ok(deletedAssets.length === 1 && deletedAssets[0] === LB, 'borra solo la foto que nadie usa, después de confirmar');
  eq(docs.get('biblioteca-fotos').items.map(f => f.id).join(','), LA, 'el índice de la biblioteca se actualiza');
  // Módulos: diseño de esta sección
  click($('[data-a="tab"][data-t="modulos"]'));
  const hIdx = ST.S.cur.modules.findIndex(m => m.type === 'horario');
  ok(hIdx >= 0, 'la app de prueba tiene horario');
  {
    click($('[data-a="mod-open"][data-mid="' + ST.S.cur.modules[hIdx].id + '"]'));
    ok(!!d.getElementById('f-modules-' + hIdx + '-s-layout') && !!d.getElementById('f-modules-' + hIdx + '-s-_bg') && !!d.getElementById('f-modules-' + hIdx + '-s-kicker'), 'cada módulo trae su diseño, el fondo de la sección y un antetítulo');
    setVal(d.getElementById('f-modules-' + hIdx + '-s-_bg'), 'tinte', 'change');
    eq(ST.S.cur.modules[hIdx].s._bg, 'tinte', 'elige el fondo de la sección');
    await sleep(220);
    ok(!!ST.pv.frame.contentDocument.querySelector('section.m-horario.sb-tinte'), 'la vista previa pinta la sección');
    setVal(d.getElementById('f-modules-' + hIdx + '-s-_bg'), 'auto', 'change');
    setVal(d.getElementById('f-modules-' + hIdx + '-s-layout'), 'compacto', 'change');
    click($('[data-a="mod-open"][data-mid="' + ST.S.cur.modules[hIdx].id + '"]'));
    ok(/días abiertos · compacto/.test($('.mod[data-mid="' + ST.S.cur.modules[hIdx].id + '"] .mod-n small').textContent), 'el resumen del módulo dice el diseño elegido');
  }
  const hrIdx = ST.S.cur.modules.findIndex(m => m.type === 'hero'), hrId = ST.S.cur.modules[hrIdx].id;
  click($('[data-a="mod-open"][data-mid="' + hrId + '"]'));
  ok(!d.getElementById('f-modules-' + hrIdx + '-s-_bg') && $$('[id="f-modules-' + hrIdx + '-s-kicker"]').length === 1, 'la portada no lleva el fondo de sección ni un antetítulo repetido');
  click($('[data-a="mod-open"][data-mid="' + hrId + '"]'));
  const hsIdx = ST.S.cur.modules.findIndex(m => m.type === 'historia');
  if (hsIdx >= 0) {
    click($('[data-a="mod-open"][data-mid="' + ST.S.cur.modules[hsIdx].id + '"]'));
    eq($$('[id="f-modules-' + hsIdx + '-s-kicker"]').length, 1, 'un módulo que ya tiene antetítulo no lo repite');
    click($('[data-a="mod-open"][data-mid="' + ST.S.cur.modules[hsIdx].id + '"]'));
  }
  click($('[data-a="tab"][data-t="estilo"]'));
  // Estilo: estructura
  ok(!!$('section[data-card="navegacion"]') && !!$('section[data-card="pie"]') && !$('section[data-card="encabezado"]'), 'navegación y pie en el modo sencillo; encabezado en el avanzado');
  click($('[data-a="set"][data-p="theme.nav"][data-v="barra"]'));
  eq(ST.S.cur.theme.nav, 'barra', 'elige la barra de abajo');
  await sleep(220);
  ok(!!ST.pv.frame.contentDocument.querySelector('.bnav'), 'la vista previa muestra la barra');
  click($('[data-a="set"][data-p="theme.nav"][data-v="menu"]'));
  click($('[data-a="set"][data-p="theme.foot.style"][data-v="simple"]'));
  eq(ST.S.cur.theme.foot.style, 'simple', 'elige el pie sencillo');
  click($('[data-a="style-reset"][data-card="pie"]'));
  ok(!ST.S.cur.theme.foot || !ST.S.cur.theme.foot.style, 'restablecer el pie');
  // Estilo: carta
  const cIdx = ST.S.cur.modules.findIndex(m => m.type === 'carta'), cLay0 = ST.S.cur.modules[cIdx].s.layout || 'lista';
  ok(!!$('section[data-card="cartadis"] .dths') && !!$('section[data-card="platos"]') && !!$('section[data-card="categorias"]') && !$('section[data-card="precios"]'), 'carta: diseño, platos y categorías en el modo sencillo');
  eq($$('section[data-card="cartadis"] .dth svg.cth').length, 5, 'los cinco diseños de la carta con miniatura');
  click($('[data-a="set"][data-p="modules.' + cIdx + '.s.layout"][data-v="fotos"]'));
  eq(ST.S.cur.modules[cIdx].s.layout, 'fotos', 'elige fotos grandes desde Estilo');
  eq($('[data-a="set"][data-p="modules.' + cIdx + '.s.layout"][data-v="fotos"]').getAttribute('aria-pressed'), 'true', 'la miniatura elegida queda marcada');
  click($('[data-a="set"][data-p="theme.carta.shape"][data-v="arco"]'));
  eq(ST.S.cur.theme.carta.shape, 'arco', 'elige fotos en arco');
  await sleep(220);
  ok(!!ST.pv.frame.contentDocument.querySelector('.carta-body.lay-fotos') && /\.carta-body\.lay-fotos \.media\{width:calc\(100% - 32px\)/.test(ST.pv.frame.contentDocument.getElementById('bk-css').textContent), 'la vista previa usa fotos grandes en arco');
  click($('[data-a="style-reset"][data-card="platos"]'));
  ok(!ST.S.cur.theme.carta || !ST.S.cur.theme.carta.shape, 'restablecer los platos');
  click($('[data-a="set"][data-p="modules.' + cIdx + '.s.layout"][data-v="' + cLay0 + '"]'));
  eq(ST.S.cur.modules[cIdx].s.layout, cLay0, 'vuelve al diseño de antes');
  // Estilo: movimiento
  ok(!!$('section[data-card="mov"] [data-p="theme.fx.reveal"]') && !!$('section[data-card="mov"] [data-a="fx-replay"]') && !$('section[data-card="efectos"]'), 'movimiento: aparición al bajar y «Ver el movimiento» en el modo sencillo');
  click($('[data-a="set"][data-p="theme.fx.reveal"][data-v="subir"]'));
  eq(ST.S.cur.theme.fx.reveal, 'subir', 'elige que las secciones suban al bajar');
  click($('[data-a="adv"]'));
  click($('[data-a="sub"][data-g="movimiento"]'));
  ok(!!$('section[data-card="efectos"]') && !!$('section[data-card="animados"]'), 'movimiento avanzado: efectos y detalles animados');
  click($('[data-a="set"][data-p="theme.fx.entry"][data-v="zoom"]'));
  await sleep(220);
  ok(/#bk\.intro \.m\{animation:zoomin/.test(ST.pv.frame.contentDocument.getElementById('bk-css').textContent), 'la vista previa usa la entrada que crece');
  click($('[data-a="fx-replay"]'));
  ok(ST.pv.frame.contentDocument.querySelector('.app').classList.contains('intro'), '«Ver el movimiento» abre la app otra vez con su entrada');
  click($('[data-a="style-reset"][data-card="efectos"]'));
  click($('[data-a="style-reset"][data-card="mov"]'));
  ok(!ST.S.cur.theme.fx || (!ST.S.cur.theme.fx.entry && !ST.S.cur.theme.fx.reveal), 'restablecer el movimiento');
  click($('[data-a="adv"]'));
  // Estilo: formas avanzadas
  click($('[data-a="adv"]'));
  click($('[data-a="sub"][data-g="formas"]'));
  ok(!!$('section[data-card="piezas"]') && !!$('section[data-card="tarjetas"]'), 'formas avanzadas: botones, fotos, chips y tarjetas');
  click($('[data-a="set"][data-p="theme.shape.card"][data-v="dura"]'));
  click($('[data-a="set"][data-p="theme.shape.btn"][data-v="pildora"]'));
  eq(ST.S.cur.theme.shape.card + ',' + ST.S.cur.theme.shape.btn, 'dura,pildora', 'elige sombra dura y botones en píldora');
  await sleep(220);
  ok(/box-shadow:4px 4px 0 var\(--ink\)/.test(ST.pv.frame.contentDocument.getElementById('bk-css').textContent), 'la vista previa usa la sombra dura');
  click($('[data-a="style-reset"][data-card="tarjetas"]'));
  click($('[data-a="style-reset"][data-card="piezas"]'));
  ok(!ST.S.cur.theme.shape || (!ST.S.cur.theme.shape.card && !ST.S.cur.theme.shape.btn), 'restablecer las formas');
  click($('[data-a="adv"]'));
  // Estilo: tipografías con muestra, otra fuente de Google, títulos y texto
  eq($$('section[data-card="tipografia"] .fontb').length, 2, 'selector de tipografías para títulos y texto');
  click($('[data-a="font-open"][data-k="display"]'));
  eq($$('.fontg [data-a="font-pick"]').length, ctx.DISPLAY_FONTS.length, 'muestra todas las tipografías de títulos');
  ok(/&text=/.test(($('#font-samples') || {}).href || ''), 'las muestras cargan solo las letras necesarias');
  click($('[data-a="font-pick"][data-k="display"][data-v="Playfair Display"]'));
  eq(ST.S.cur.theme.fonts.display, 'Playfair Display', 'elige la tipografía de los títulos');
  ok(!$('.fontg') && /Playfair Display/.test($('[data-a="font-open"][data-k="display"]').textContent), 'el selector se cierra y muestra la elegida');
  click($('[data-a="font-open"][data-k="display"]'));
  setVal(d.getElementById('fc-display'), 'Josefin<Sans>', 'change');
  eq(ST.S.cur.theme.fonts.display, 'JosefinSans', 'otra fuente de Google por nombre, limpio');
  setVal(d.getElementById('fc-display'), 'Josefin Sans', 'change');
  await sleep(220);
  ok(/family=Josefin\+Sans/.test(ST.pv.frame.contentDocument.getElementById('bk-fonts2').getAttribute('href')), 'la vista previa la carga aparte');
  click($('[data-a="font-pick"][data-k="display"][data-v="Playfair Display"]'));
  click($('[data-a="adv"]'));
  click($('[data-a="sub"][data-g="letra"]'));
  eq($$('[data-a="set"][data-p="theme.type.titleWeight"]').map(b => b.getAttribute('data-v')).join(','), 'auto,400,600,700', 'el grosor ofrece los que trae la tipografía');
  click($('[data-a="set"][data-p="theme.type.titleWeight"][data-v="700"]'));
  eq(ST.S.cur.theme.type.titleWeight, '700', 'títulos en negrita');
  click($('[data-a="set"][data-p="theme.type.titleCase"][data-v="mayus"]'));
  eq($('output[data-out="theme.type.lineHeight"]').textContent, '1,55', 'el interlineado se muestra como 1,55');
  setVal(d.getElementById('f-theme-type-lineHeight'), '170');
  eq($('output[data-out="theme.type.lineHeight"]').textContent, '1,70', 'y cambia mientras se mueve');
  await sleep(220);
  ok(/line-height:1\.7\}/.test(ST.pv.frame.contentDocument.getElementById('bk-css').textContent), 'la vista previa usa el interlineado');
  click($('[data-a="style-reset"][data-card="titulos"]'));
  ok(!ST.S.cur.theme.type.titleWeight && !ST.S.cur.theme.type.titleCase, 'restablecer los títulos');
  click($('[data-a="style-reset"][data-card="texto"]'));
  click($('[data-a="adv"]'));
  // Estilo: fondo de la app y color por elemento
  ok(!!$('section[data-card="fondoapp"]') && !$('section[data-card="roles"]'), 'el fondo está en el modo sencillo y el color por elemento en el avanzado');
  click($('[data-a="set"][data-p="theme.bg.type"][data-v="degradado"]'));
  ok(ST.S.cur.theme.bg.type === 'degradado' && !!$('[data-a="set"][data-p="theme.bg.tint"][data-v="accent3"]'), 'el degradado ofrece hacia qué color');
  click($('[data-a="set"][data-p="theme.bg.tint"][data-v="accent3"]'));
  await sleep(220);
  ok(/color-mix\(in srgb,var\(--accent3\) 26%/.test(ST.pv.frame.contentDocument.getElementById('bk-css').textContent), 'la vista previa usa el degradado');
  click($('[data-a="set"][data-p="theme.bg.type"][data-v="foto"]'));
  ok(!!$('.imgf[data-imgf="theme.bg.img"]') && !!$('[data-a="set"][data-p="theme.bg.veil"]'), 'el fondo con foto pide la foto y el velo');
  click($('[data-a="style-reset"][data-card="fondoapp"]'));
  ok(!('bg' in ST.S.cur.theme), 'restablecer deja el fondo liso');
  click($('[data-a="adv"]'));
  click($('[data-a="sub"][data-g="color"]'));
  eq($$('section[data-card="roles"] .fld.role').length, 8, 'ocho elementos con color propio');
  click($('[data-a="set"][data-p="theme.roles.btn"][data-v="accent3"]'));
  eq(ST.S.cur.theme.roles.btn, 'accent3', 'los botones toman el acento 3');
  ok($('[data-a="set"][data-p="theme.roles.btn"][data-v="accent3"]').classList.contains('on'), 'la muestra elegida queda marcada');
  await sleep(220);
  ok(new RegExp('--c-btn:' + ST.S.cur.theme.colors.accent3).test(ST.pv.frame.contentDocument.getElementById('bk-css').textContent), 'la vista previa pinta los botones con ese color');
  const rc = $('input[type="color"][data-p="theme.roles.title"]');
  setVal(rc, ST.S.cur.theme.colors.bg.toLowerCase(), 'change');
  eq(ST.S.cur.theme.roles.title, ST.S.cur.theme.colors.bg.toUpperCase(), 'un color propio para los títulos');
  ok(rc.parentNode.classList.contains('on') && /Títulos sobre el fondo/.test($('#role-contrast').textContent), 'avisa si el color propio no se lee');
  ok(ST.checks(ST.S.cur).some(c => /contraste en los colores por elemento/.test(c.t)), 'la revisión de Publicar también lo avisa');
  ok(!$('[data-a="style-reset"][data-card="roles"]').hidden, 'la tarjeta ofrece «Restablecer»');
  click($('[data-a="style-reset"][data-card="roles"]'));
  ok(!('roles' in ST.S.cur.theme), 'restablecer vuelve a los colores de la estética');
  click($('[data-a="adv"]'));
  // Estilo: íconos
  ok(!!$('section[data-card="iconos"]'), 'la tarjeta «Íconos» está en el modo sencillo');
  ok($('[data-a="set"][data-p="theme.icons"][data-v="linea"]').classList.contains('on'), 'marca los íconos de línea de la estética');
  eq($$('.icosample svg.ic').length, 6, 'la muestra dibuja los íconos de línea');
  click($('[data-a="set"][data-p="theme.icons"][data-v="emoji"]'));
  eq(ST.S.cur.theme.icons, 'emoji', 'elige emojis');
  ok(!$('.icosample svg') && /☕/.test($('.icosample').textContent), 'la muestra cambia a emojis');
  ok(!$('[data-a="style-reset"][data-card="iconos"]').hidden, '«Restablecer» aparece en la tarjeta de íconos');
  await sleep(220);
  ok(!ST.pv.frame.contentDocument.querySelector('.m-carta .media.ln'), 'la vista previa vuelve a los emojis');
  click($('[data-a="set"][data-p="theme.icons"][data-v="ninguno"]'));
  ok(!$('.icosample svg') && !/☕/.test($('.icosample').textContent), 'sin íconos: la muestra usa iniciales');
  click($('[data-a="style-reset"][data-card="iconos"]'));
  eq(ST.S.cur.theme.icons, 'linea', 'restablecer vuelve a los íconos de la estética');
  await sleep(220);
  ok(!!ST.pv.frame.contentDocument.querySelector('.m-carta .media.ln svg.ic'), 'la vista previa muestra los íconos de línea');

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
  const icoP = 'menu.categories.' + nCats + '.items.0.ico';
  click($('#sheet .imgf [data-a="lib-pick"]'));
  click($('#sheet .libi[data-id="' + LA + '"]'));
  eq(ST.S.cur.menu.categories[nCats].items[0].img, 'asset:' + LA, 'el plato usa una foto de la biblioteca');
  ok(!$('#sheet').hidden && /Editar plato/.test($('#sheet').textContent) && /Foto de la biblioteca/.test($('#sheet .imgf').textContent), 'al elegir se vuelve al plato con la foto puesta');
  click($('#sheet [data-a="set"][data-p="menu.categories.' + nCats + '.items.0.imgPos"][data-v="bottom"]'));
  ok(ST.S.cur.menu.categories[nCats].items[0].imgPos === 'bottom' && $('#sheet [data-a="set"][data-v="bottom"]').classList.contains('on'), 'el encuadre se marca dentro de la hoja del plato');
  ok(/Automático$/.test($('#sheet .icob').textContent.trim()) && !/·/.test($('#sheet .icob').textContent), 'sin emoji ni ícono, el plato está en automático');
  setVal(d.getElementById('f-' + base + '-emoji'), '🍰');
  ok(/Automático · Torta/.test($('#sheet .icob').textContent), 'al escribir el emoji se ve el ícono que le corresponde');
  click($('#sheet [data-a="ico-open"]'));
  const total = ST.meta.iconSets.reduce((a, g) => a + g[1].length, 0);
  eq($$('#sheet .icog [data-a="ico-pick"]').length, total + 1, 'el selector ofrece todos los íconos y «Automático»');
  eq($('#sheet [data-a="ico-open"]').getAttribute('aria-expanded'), 'true', 'el selector abierto se anuncia');
  ok(!!$('#sheet [data-a="ico-pick"][data-v="maiz"]').getAttribute('aria-label'), 'cada ícono tiene nombre');
  click($('#sheet [data-a="ico-pick"][data-v="maiz"]'));
  eq(ST.S.cur.menu.categories[nCats].items[0].ico, 'maiz', 'elige un ícono para el plato');
  ok(!$('#sheet .icog') && /Maíz/.test($('#sheet .icob').textContent), 'el selector se cierra y muestra el elegido');
  click($('#sheet [data-a="ico-open"]'));
  ok($('#sheet [data-a="ico-pick"][data-v="maiz"]').getAttribute('aria-pressed') === 'true', 'el ícono elegido queda marcado');
  click($('#sheet [data-a="ico-pick"][data-v=""]'));
  ok(!('ico' in ST.S.cur.menu.categories[nCats].items[0]), '«Automático» quita el ícono elegido');
  click($('#sheet [data-a="ico-open"]'));
  click($('#sheet [data-a="ico-pick"][data-v="maiz"]'));
  eq($$('.tg').length, 12, 'doce etiquetas para los platos');
  click($('[data-a="item-tag"][data-tag="nuevo"]'));
  click($('[data-a="item-tag"][data-tag="sinlactosa"]'));
  click($('[data-a="sheet-close"]'));
  const it = ST.S.cur.menu.categories[nCats].items[0];
  ok(it.name === 'Torta de choclo' && it.price === 9500 && it.tags.includes('nuevo') && it.tags.includes('sinlactosa'), 'plato guardado con precio y etiquetas');
  ok($$('.ir-n').some(n => n.textContent.includes('Torta de choclo')), 'el plato aparece en la lista');
  ok(!!$$('.ir-m').find(b => b.textContent.includes('Torta de choclo')).querySelector('.ir-e svg.ic'), 'la lista muestra el ícono de línea del plato');
  ok(!!$('.cat-b .imgf[data-imgf="menu.categories.' + nCats + '.img"]'), 'la categoría tiene campo de foto');
  click($('.cat-b [data-a="ico-open"]'));
  click($('.cat-b [data-a="ico-pick"][data-v="torta"]'));
  eq(ST.S.cur.menu.categories[nCats].ico, 'torta', 'elige el ícono de la categoría');
  ok(!!$$('.cat-e.open .ci svg.ic').length, 'la categoría muestra su ícono en la lista');

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
  ok(h && h.data.includes('"data:image/webp;base64,') && !/"asset:[\w-]{8,64}"/.test(h.data), 'el .html lleva incrustadas las fotos de la biblioteca');
  ok(h && /<body>\n<div id="bk-splash"/.test(h.data), 'el .html abre con la pantalla de carga');
  {
    const cfgOg = JSON.parse(JSON.stringify(ST.S.cur)); cfgOg.meta = Object.assign({}, cfgOg.meta, { url: 'https://antojo.pages.dev/' });
    const withOg = ST.buildAppHTML(cfgOg, { pwa: true, og: true });
    ok(withOg.includes('<meta property="og:image" content="https://antojo.pages.dev/og.png">') && withOg.includes('summary_large_image'), 'con la dirección publicada, el enlace se comparte con og.png');
    ok(!ST.buildAppHTML(cfgOg, { pwa: true, og: false }).includes('og:image'), 'sin la imagen no se anuncia');
    cfgOg.brand.splash = false;
    ok(!/<div id="bk-splash"/.test(ST.buildAppHTML(cfgOg, { pwa: false })), 'la pantalla de carga se puede quitar');
  }
  ok(h && !/<\/script>[\s\S]*<\/script>/.test(h.data.replace(/<script>[\s\S]*?<\/script>/, '')), 'el .html tiene un solo bloque de script');
  click($('[data-a="exp-json"]'));
  await sleep(60);
  const j = saved.find(s => s.filename.endsWith('.json'));
  ok(j && JSON.parse(j.data).format === 'break-app' && JSON.parse(j.data).app.brand.name === 'Antojo Centro', 'descarga la configuración .json');
  ok(j && /^data:image\/webp;base64,/.test(JSON.parse(j.data).app.modules[0].s.img), 'el .json también lleva las fotos');
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
    ok(names.includes('img/' + LA + '.webp'), 'el .zip trae las fotos de la biblioteca en img/');
    ok((await zip.file('sw.js').async('string')).includes('"./img/' + LA + '.webp"'), 'el service worker guarda las fotos para abrir sin señal');
    ok((await zip.file('index.html').async('string')).includes('"img/' + LA + '.webp"'), 'la app del .zip apunta a sus fotos');
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
