/* Break · panel del local. El dueño entra con el PIN de su local y cambia el contenido (carta, precios, «agotado
   hoy»…) sin tocar el diseño. Habla con el servidor del panel (worker/) en la misma dirección donde se abre:
   /panel/<slug>. Usa el motor (breakApp) para la vista previa y su saneador para no guardar nada inválido. */
(function () {
  'use strict';
  const META = breakApp(null, null, null, { meta: true });
  const $ = function (s, el) { return (el || document).querySelector(s); };
  const $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  const attr = esc;
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function money(n) { return '$' + Math.round(Number(n) || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 }); }
  const TAG_NAME = {}; TAGS.forEach(function (t) { TAG_NAME[t[0]] = t[1]; });
  const ICO = {
    up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4"/></svg>'
  };

  /* ---------- Local, dirección del servidor y almacenamiento ---------- */
  const qs = new URLSearchParams(location.search);
  const SLUG = ((/\/panel\/([a-z0-9-]{2,40})\/?$/.exec(location.pathname) || [])[1]) || (/^[a-z0-9-]{2,40}$/.test(qs.get('local') || '') ? qs.get('local') : '');
  /* El panel habla con el servidor que lo sirve; para probarlo en local se puede pasar ?api=http://localhost:8787 */
  const API = (function () {
    const a = (qs.get('api') || '').replace(/\/+$/, '');
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(a)) return a;
    return /^https?:$/.test(location.protocol) ? location.origin : '';
  })();
  const K_SES = 'break.panel.' + SLUG, K_DRAFT = 'break.panel.' + SLUG + '.borrador';
  function stGet(store, k) { try { const v = window[store].getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function stSet(store, k, v) { try { if (v == null) window[store].removeItem(k); else window[store].setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }

  /* ---------- Estado ---------- */
  const P = {
    token: '', name: '', app: null, doc: null, draft: null, dirty: false, saving: false,
    tab: 'carta', openCats: {}, q: '', pv: false, note: '', status: '', statusKind: '', sheet: null
  };

  async function api(method, path, body, raw) {
    const h = {};
    if (P.token) h.Authorization = 'Bearer ' + P.token;
    let payload;
    if (raw) { payload = raw; h['Content-Type'] = raw.type || 'application/octet-stream'; } else if (body !== undefined) { payload = JSON.stringify(body); h['Content-Type'] = 'application/json'; }
    let res;
    try { res = await fetch(API + '/api/' + SLUG + path, { method: method, headers: h, body: payload, cache: 'no-store' }); } catch (e) { const err = new Error('No hay conexión. Revise el internet y vuelva a intentar.'); err.status = 0; throw err; }
    let data = null; try { data = await res.json(); } catch (e) { data = null; }
    if (!res.ok) { const err = new Error((data && data.error) || 'No se pudo completar. Intente de nuevo.'); err.status = res.status; err.data = data; throw err; }
    return data;
  }

  /* Fecha de hoy en la zona horaria del local, para «agotado hoy». */
  function hoy() {
    const tz = (P.app && P.app.brand && P.app.brand.tz) || 'America/Bogota';
    try {
      const p = {}; new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return p.year + '-' + p.month + '-' + p.day;
    } catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  function bilingual() { return !!(P.app && P.app.i18n && P.app.i18n.bilingual); }
  function uid(prefix) { return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* ---------- Avisos ---------- */
  let toastT = null;
  function toast(t) {
    const el = $('#toast'); el.textContent = t; el.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('show'); }, 2800);
  }

  /* ---------- Entrada ---------- */
  function showLogin(msg) {
    P.token = ''; stSet('sessionStorage', K_SES, null);
    $('#top').innerHTML = '<div class="top-in"><span class="wm">break<i>panel</i></span></div>';
    $('#bar').hidden = true; $('#pvbox').hidden = true;
    if (!SLUG || !API) {
      $('#ed').innerHTML = '<div class="login card"><h1>Panel del local</h1><p>Esta dirección no corresponde a ningún local. Use el enlace que le dieron, que termina en <b>/panel/</b> y el nombre de su local.</p></div>';
      return;
    }
    $('#ed').innerHTML = '<form class="login card" data-form="login" novalidate><h1>Panel del local</h1><p>Escriba el PIN de 6 números de <b>' + esc(SLUG) + '</b> para cambiar su carta y sus avisos.</p>' +
      '<label class="lab" for="pin">PIN</label><input class="in pin" id="pin" name="pin" type="password" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required>' +
      (msg ? '<p class="err" role="alert">' + esc(msg) + '</p>' : '') +
      '<button class="btn pri wide" type="submit" style="margin-top:16px">Entrar</button></form>';
    const pin = $('#pin'); if (pin) pin.focus();
  }
  async function login(pin) {
    if (!/^\d{6}$/.test(pin)) { showLogin('El PIN tiene 6 números.'); return; }
    const btn = $('form[data-form="login"] button'); if (btn) { btn.disabled = true; btn.textContent = 'Entrando…'; }
    try {
      const r = await api('POST', '/entrar', { pin: pin });
      P.token = r.token; stSet('sessionStorage', K_SES, { token: r.token, exp: r.exp });
      await load();
    } catch (e) { showLogin(e.message); }
  }

  /* ---------- Cargar y guardar ---------- */
  async function load() {
    $('#ed').innerHTML = '<p class="empty">Cargando…</p>';
    let r;
    try { r = await api('GET', '/panel'); } catch (e) { if (e.status === 401) { showLogin(e.message); return; } $('#ed').innerHTML = '<div class="login card"><p class="err">' + esc(e.message) + '</p><button class="btn wide" data-a="retry" style="margin-top:14px">Volver a intentar</button></div>'; return; }
    P.name = r.name || SLUG; P.app = r.app || { brand: {}, menu: { categories: [] }, modules: [] }; P.doc = r.doc;
    const base = P.doc ? P.doc.contenido : META.contenidoOf(P.app);
    P.draft = META.sanitizeContenido(clone(base)); P.dirty = false; P.note = '';
    /* Si quedaron cambios sin guardar sobre esta misma versión (se cerró la página o venció la sesión), se recuperan. */
    const d = stGet('localStorage', K_DRAFT);
    if (d && d.contenido && d.base === (P.doc ? P.doc.v : 0)) { P.draft = META.sanitizeContenido(d.contenido); P.dirty = true; P.note = 'Recuperamos cambios que no alcanzó a guardar. Revíselos y toque «Guardar cambios».'; }
    else if (d) stSet('localStorage', K_DRAFT, null);
    if (P.draft.menu && P.draft.menu.categories.length) P.openCats[P.draft.menu.categories[0].id] = true;
    setStatus(P.dirty ? 'dirty' : 'clean');
    render(); pvBoot();
  }
  function markDirty() {
    P.dirty = true; setStatus('dirty');
    stSet('localStorage', K_DRAFT, { base: P.doc ? P.doc.v : 0, contenido: P.draft });
    renderBar(); pvUpdate();
  }
  function setStatus(kind, text) {
    P.statusKind = kind;
    P.status = text || (kind === 'dirty' ? 'Cambios sin guardar' : kind === 'saving' ? 'Guardando…' : kind === 'ok' ? 'Guardado' : P.doc ? 'Al día · versión ' + P.doc.v : 'Sin publicar todavía');
  }
  async function save() {
    if (P.saving || !P.dirty) return;
    P.saving = true; setStatus('saving'); renderBar();
    try {
      P.doc = await api('PUT', '/contenido', { base: P.doc ? P.doc.v : 0, contenido: P.draft });
      P.draft = clone(P.doc.contenido); P.dirty = false; stSet('localStorage', K_DRAFT, null); P.note = '';
      setStatus('ok', 'Guardado · versión ' + P.doc.v + '. La app ya lo muestra.'); toast('Cambios guardados');
    } catch (e) {
      if (e.status === 401) { P.saving = false; showLogin(e.message + ' Sus cambios quedaron guardados en este celular.'); return; }
      if (e.status === 409 && e.data && e.data.doc) {
        P.doc = e.data.doc; P.draft = clone(P.doc.contenido); P.dirty = false; stSet('localStorage', K_DRAFT, null);
        P.note = e.message + ' Vuelva a hacer su cambio.'; setStatus('bad', 'Se cargó la versión más reciente');
      } else setStatus('bad', e.message);
    }
    P.saving = false; render(); pvUpdate();
  }
  async function undoServer() {
    try {
      P.doc = await api('POST', '/deshacer');
      P.draft = clone(P.doc.contenido); P.dirty = false; stSet('localStorage', K_DRAFT, null); P.note = '';
      setStatus('ok', 'Volvió a la versión anterior (versión ' + P.doc.v + ').'); toast('Se deshizo el último guardado');
    } catch (e) { if (e.status === 401) { showLogin(e.message); return; } setStatus('bad', e.message); }
    render(); pvUpdate();
  }
  function discard() {
    P.draft = clone(P.doc ? P.doc.contenido : META.contenidoOf(P.app)); P.dirty = false; P.note = '';
    stSet('localStorage', K_DRAFT, null); setStatus('clean'); render(); pvUpdate();
  }

  /* ---------- Pantalla ---------- */
  const TABS = [['carta', 'Carta']];
  function render() {
    $('#top').innerHTML = '<div class="top-in"><div class="top-n"><b>' + esc(P.name) + '</b><small>Panel del local</small></div>' +
      '<button type="button" class="btn sm top-pv" data-a="pv">Ver la app</button><button type="button" class="btn sm" data-a="logout">Salir</button></div>' +
      (TABS.length > 1 ? '<nav class="tabs" role="tablist" aria-label="Secciones del panel">' + TABS.map(function (t) {
        return '<button type="button" class="tab" role="tab" data-a="tab" data-t="' + t[0] + '" aria-selected="' + (P.tab === t[0]) + '">' + esc(t[1]) + '</button>';
      }).join('') + '</nav>' : '');
    const note = P.note ? '<p class="note" role="status">' + esc(P.note) + '</p>' : '';
    $('#ed').innerHTML = note + (VIEWS[P.tab] || VIEWS.carta)();
    $('#bar').hidden = false; renderBar();
    $('#pvbox').hidden = !P.pv;
  }
  function renderBar() {
    const cls = P.statusKind === 'dirty' ? 'dirty' : P.statusKind === 'ok' ? 'ok' : P.statusKind === 'bad' ? 'bad' : '';
    $('#bar').innerHTML = '<div class="bar-in"><p class="bar-st ' + cls + '" role="status">' + esc(P.status) + '</p>' +
      (P.dirty ? '<button type="button" class="btn sm" data-a="discard">Descartar</button>' : (P.doc && P.doc.v > 1 ? '<button type="button" class="btn sm" data-a="undo">Deshacer último guardado</button>' : '')) +
      '<button type="button" class="btn pri" data-a="save"' + (P.dirty && !P.saving ? '' : ' disabled') + '>' + (P.saving ? 'Guardando…' : 'Guardar cambios') + '</button></div>';
  }

  /* ---------- Carta ---------- */
  function cats() { P.draft.menu = P.draft.menu || { categories: [] }; return P.draft.menu.categories; }
  function itemState(it) {
    if (it.on === false) return ['off', 'No disponible'];
    if (it.soldDate === hoy()) return ['sold', 'Agotado hoy'];
    return ['', ''];
  }
  const VIEWS = {
    carta: function () {
      const q = P.q.trim().toLowerCase(), C = cats();
      const match = function (it) { return !q || String(it.name || '').toLowerCase().indexOf(q) >= 0; };
      const list = C.map(function (c, ci) {
        const its = c.items.map(function (it, ii) { return { it: it, ii: ii }; }).filter(function (x) { return match(x.it); });
        if (q && !its.length) return '';
        const open = q || P.openCats[c.id];
        return '<section class="cat card' + (open ? ' open' : '') + '"><div class="cat-h">' +
          '<button type="button" class="cat-tg" data-a="cat-tg" data-c="' + ci + '" aria-expanded="' + !!open + '"><span>' + esc(c.name || 'Sin nombre') + '</span><small>' + c.items.length + (c.items.length === 1 ? ' plato' : ' platos') + '</small></button>' +
          '<button type="button" class="ib" data-a="cat-mv" data-c="' + ci + '" data-d="-1" aria-label="Subir categoría"' + (ci === 0 ? ' disabled' : '') + '>' + ICO.up + '</button>' +
          '<button type="button" class="ib" data-a="cat-mv" data-c="' + ci + '" data-d="1" aria-label="Bajar categoría"' + (ci === C.length - 1 ? ' disabled' : '') + '>' + ICO.down + '</button>' +
          '<button type="button" class="ib" data-a="cat-ed" data-c="' + ci + '" aria-label="Editar categoría">' + ICO.edit + '</button></div>' +
          (open ? '<div class="items">' + (its.length ? its.map(function (x) {
            const it = x.it, st = itemState(it);
            return '<div class="it ' + st[0] + '"><button type="button" class="it-m" data-a="it-ed" data-c="' + ci + '" data-i="' + x.ii + '"><b>' + esc(it.name || 'Plato sin nombre') + '</b><span>' + esc(money(it.price)) + '</span>' + (st[1] ? '<em>' + st[1] + '</em>' : '') + '</button>' +
              '<label class="sw"><input type="checkbox" class="soldsw" data-a="sold" data-c="' + ci + '" data-i="' + x.ii + '"' + (it.soldDate === hoy() ? ' checked' : '') + (it.on === false ? ' disabled' : '') + '>Agotado hoy</label></div>';
          }).join('') : '<p class="empty">Esta categoría no tiene platos.</p>') +
            (q ? '' : '<div class="add-row"><button type="button" class="btn sm" data-a="it-add" data-c="' + ci + '">+ Agregar plato</button></div>') + '</div>' : '') + '</section>';
      }).join('');
      return '<p class="intro">Toque un plato para cambiar su nombre, precio o descripción. «Agotado hoy» se quita solo mañana.</p>' +
        '<div class="search"><label class="vh" for="q">Buscar plato</label><input class="in" id="q" type="search" data-in="q" placeholder="Buscar plato" value="' + attr(P.q) + '" autocomplete="off"></div>' +
        (list || '<p class="empty">' + (q ? 'Ningún plato se llama así.' : 'La carta está vacía.') + '</p>') +
        (q ? '' : '<button type="button" class="btn wide" data-a="cat-add">+ Agregar categoría</button>');
    }
  };

  /* ---------- Hojas de edición ---------- */
  function openSheet(html, onClose) {
    P.sheet = { onClose: onClose || null };
    $('#sheet').innerHTML = html; $('#sheet').hidden = false; $('#sheetbg').hidden = false; document.body.classList.add('noscroll');
    const f = $('#sheet input, #sheet textarea, #sheet select'); if (f) f.focus();
  }
  function closeSheet(cancel) {
    if (!P.sheet) return;
    const cb = P.sheet.onClose; P.sheet = null;
    $('#sheet').hidden = true; $('#sheetbg').hidden = true; $('#sheet').innerHTML = ''; document.body.classList.remove('noscroll');
    if (cancel && cb) cb();
  }
  function ask(title, text, yes, fn, bad) {
    openSheet('<div class="sheet-h"><h2 id="sheet-t">' + esc(title) + '</h2></div><p>' + esc(text) + '</p><div class="sheet-f"><button type="button" class="btn" data-a="sheet-x">Cancelar</button><button type="button" class="btn ' + (bad ? 'bad' : 'pri') + '" data-a="ask-yes">' + esc(yes) + '</button></div>');
    P.sheet.yes = fn;
  }
  function fld(label, name, val, opt) {
    opt = opt || {};
    const id = 'f-' + name;
    const ctl = opt.area ? '<textarea class="in" id="' + id + '" name="' + name + '" maxlength="' + (opt.max || 300) + '">' + esc(val) + '</textarea>'
      : '<input class="in" id="' + id + '" name="' + name + '" type="' + (opt.type || 'text') + '"' + (opt.mode ? ' inputmode="' + opt.mode + '"' : '') + ' maxlength="' + (opt.max || 80) + '" value="' + attr(val) + '"' + (opt.ph ? ' placeholder="' + attr(opt.ph) + '"' : '') + '>';
    return '<div class="fld' + (opt.en ? ' en' : '') + '"><label class="lab" for="' + id + '">' + esc(label) + (opt.en ? ' <b>EN</b>' : '') + '</label>' + ctl + (opt.help ? '<p class="help">' + esc(opt.help) + '</p>' : '') + '</div>';
  }
  function val(name) { const el = $('#sheet [name="' + name + '"]'); return el ? el.value : ''; }
  function setTx(o, k) { o[k] = val(k).trim(); if (bilingual()) { const en = val(k + '_en').trim(); if (en) o[k + '_en'] = en; else delete o[k + '_en']; } }
  function priceIn(v) { return Math.round(Number(String(v).replace(/[^\d]/g, '')) || 0); }

  function editItem(ci, ii, isNew) {
    const c = cats()[ci], it = c.items[ii];
    const tags = it.tags || [], C = cats();
    openSheet('<form data-form="item" data-c="' + ci + '" data-i="' + ii + '" novalidate><div class="sheet-h"><h2 id="sheet-t">' + (isNew ? 'Plato nuevo' : 'Editar plato') + '</h2><button type="button" class="btn sm" data-a="sheet-x">Cerrar</button></div>' +
      fld('Nombre', 'name', it.name, { max: 80 }) + (bilingual() ? fld('Nombre', 'name_en', it.name_en || '', { max: 80, en: true }) : '') +
      fld('Precio', 'price', it.price ? money(it.price) : '', { mode: 'numeric', ph: '$15.900', help: 'En pesos, sin centavos.' }) +
      fld('Descripción', 'desc', it.desc || '', { area: true, max: 300 }) + (bilingual() ? fld('Descripción', 'desc_en', it.desc_en || '', { area: true, max: 300, en: true }) : '') +
      '<div class="fld"><span class="lab">Etiquetas</span><div class="chips" role="group" aria-label="Etiquetas">' + TAGS.map(function (t) {
        return '<button type="button" class="chip" data-a="tag" data-t="' + t[0] + '" aria-pressed="' + (tags.indexOf(t[0]) >= 0) + '">' + esc(t[1]) + '</button>';
      }).join('') + '</div></div>' +
      '<div class="fld row2"><label class="sw"><input type="checkbox" name="on"' + (it.on !== false ? ' checked' : '') + '>Disponible</label>' +
      '<label class="sw"><input type="checkbox" class="soldsw" name="sold"' + (it.soldDate === hoy() ? ' checked' : '') + '>Agotado hoy</label></div>' +
      (C.length > 1 ? '<div class="fld"><label class="lab" for="f-cat">Categoría</label><select class="in" id="f-cat" name="cat">' + C.map(function (x, k) { return '<option value="' + k + '"' + (k === ci ? ' selected' : '') + '>' + esc(x.name || 'Sin nombre') + '</option>'; }).join('') + '</select></div>' : '') +
      '<div class="fld row2"><button type="button" class="btn sm" data-a="it-mv" data-d="-1"' + (ii === 0 ? ' disabled' : '') + '>Subir en la lista</button><button type="button" class="btn sm" data-a="it-mv" data-d="1"' + (ii === c.items.length - 1 ? ' disabled' : '') + '>Bajar en la lista</button></div>' +
      '<div class="sheet-f"><button type="submit" class="btn pri">Listo</button></div>' +
      (isNew ? '' : '<div class="danger"><button type="button" class="btn bad wide" data-a="it-del">Eliminar este plato</button></div>') + '</form>',
      isNew ? function () { c.items.splice(ii, 1); render(); } : null);
    P.sheet.isNew = !!isNew;
  }
  /* Pasa lo escrito en la hoja al plato (sin cerrarla). */
  function readItem(it) {
    setTx(it, 'name'); setTx(it, 'desc');
    it.price = priceIn(val('price'));
    it.tags = $$('#sheet [data-a="tag"][aria-pressed="true"]').map(function (b) { return b.getAttribute('data-t'); });
    it.on = !!$('#sheet [name="on"]').checked;
    if ($('#sheet [name="sold"]').checked) it.soldDate = hoy(); else delete it.soldDate;
  }
  function applyItem(form) {
    const ci = +form.getAttribute('data-c'), ii = +form.getAttribute('data-i'), c = cats()[ci], it = c.items[ii];
    if (!val('name').trim()) { toast('Escriba el nombre del plato.'); const n = $('#sheet [name="name"]'); if (n) n.focus(); return; }
    readItem(it);
    const sel = $('#sheet [name="cat"]'), to = sel ? +sel.value : ci;
    if (to !== ci && cats()[to]) { c.items.splice(ii, 1); cats()[to].items.push(it); P.openCats[cats()[to].id] = true; }
    P.sheet.onClose = null; closeSheet(); markDirty(); render();
  }
  function editCat(ci, isNew) {
    const c = cats()[ci];
    openSheet('<form data-form="cat" data-c="' + ci + '" novalidate><div class="sheet-h"><h2 id="sheet-t">' + (isNew ? 'Categoría nueva' : 'Editar categoría') + '</h2><button type="button" class="btn sm" data-a="sheet-x">Cerrar</button></div>' +
      fld('Nombre', 'name', c.name, { max: 60, ph: 'Desayunos' }) + (bilingual() ? fld('Nombre', 'name_en', c.name_en || '', { max: 60, en: true }) : '') +
      fld('Nota', 'note', c.note || '', { max: 160, ph: 'Hasta las 11:00 a. m.', help: 'Opcional. Sale debajo del nombre.' }) + (bilingual() ? fld('Nota', 'note_en', c.note_en || '', { max: 160, en: true }) : '') +
      '<div class="sheet-f"><button type="submit" class="btn pri">Listo</button></div>' +
      (isNew ? '' : '<div class="danger"><button type="button" class="btn bad wide" data-a="cat-del">Eliminar la categoría' + (c.items.length ? ' y sus ' + c.items.length + ' platos' : '') + '</button></div>') + '</form>',
      isNew ? function () { cats().splice(ci, 1); render(); } : null);
  }
  function applyCat(form) {
    const c = cats()[+form.getAttribute('data-c')];
    if (!val('name').trim()) { toast('Escriba el nombre de la categoría.'); return; }
    setTx(c, 'name'); setTx(c, 'note');
    P.sheet.onClose = null; closeSheet(); markDirty(); render();
  }
  function move(arr, i, d) { const j = i + d; if (j < 0 || j >= arr.length) return false; const x = arr[i]; arr[i] = arr[j]; arr[j] = x; return true; }

  /* ---------- Vista previa ---------- */
  const PV = { rt: null, timer: null };
  function previewCfg() { return META.mergeContenido(P.app, P.draft); }
  function pvBoot() {
    const fr = $('#pv'); if (!fr || PV.rt) { pvUpdate(true); return; }
    try {
      const d = fr.contentDocument; d.open();
      d.write('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vista previa</title></head><body></body></html>'); d.close();
      PV.rt = breakApp(fr.contentWindow, d, previewCfg(), { mode: 'preview' });
    } catch (e) { PV.rt = null; }
  }
  function pvUpdate(now) {
    if (!PV.rt) return;
    clearTimeout(PV.timer);
    const run = function () { try { PV.rt.update(previewCfg()); } catch (e) { /* la vista previa no es esencial */ } };
    if (now) run(); else PV.timer = setTimeout(run, 200);
  }

  /* ---------- Eventos ---------- */
  document.addEventListener('click', function (e) {
    const b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
    const a = b.getAttribute('data-a'), ci = +b.getAttribute('data-c'), ii = +b.getAttribute('data-i');
    switch (a) {
      case 'retry': load(); break;
      case 'logout': if (P.dirty) ask('¿Salir sin guardar?', 'Tiene cambios sin guardar. Quedan guardados en este celular para la próxima vez.', 'Salir', function () { showLogin(); }); else showLogin(); break;
      case 'tab': P.tab = b.getAttribute('data-t'); render(); break;
      case 'pv': P.pv = true; $('#pvbox').hidden = false; pvUpdate(true); break;
      case 'pv-close': P.pv = false; $('#pvbox').hidden = true; break;
      case 'save': save(); break;
      case 'discard': ask('¿Descartar los cambios?', 'Se pierden los cambios que no ha guardado.', 'Descartar', discard, true); break;
      case 'undo': ask('¿Deshacer el último guardado?', 'La app vuelve a mostrar la versión anterior.', 'Deshacer', undoServer, true); break;
      case 'cat-tg': { const c = cats()[ci]; P.openCats[c.id] = !P.openCats[c.id]; render(); break; }
      case 'cat-mv': if (move(cats(), ci, +b.getAttribute('data-d'))) { markDirty(); render(); } break;
      case 'cat-ed': editCat(ci); break;
      case 'cat-add': { const c = { id: uid('cat'), name: '', note: '', icon: '', ico: '', img: '', imgPos: '', items: [] }; cats().push(c); P.openCats[c.id] = true; editCat(cats().length - 1, true); break; }
      case 'cat-del': {
        const form = $('#sheet form'), k = +form.getAttribute('data-c');
        ask('¿Eliminar la categoría?', 'Se elimina «' + (cats()[k].name || 'Sin nombre') + '» con todos sus platos.', 'Eliminar', function () { cats().splice(k, 1); markDirty(); render(); }, true);
        break;
      }
      case 'it-ed': editItem(ci, ii); break;
      case 'it-add': { const c = cats()[ci]; c.items.push({ id: uid('it'), name: '', desc: '', price: 0, emoji: '', ico: '', img: '', imgPos: '', tags: [], on: true }); editItem(ci, c.items.length - 1, true); break; }
      case 'it-mv': {
        const form = $('#sheet form'), k = +form.getAttribute('data-c'), j = +form.getAttribute('data-i'), d = +b.getAttribute('data-d');
        readItem(cats()[k].items[j]);
        if (move(cats()[k].items, j, d)) { P.sheet.onClose = null; markDirty(); editItem(k, j + d); render(); }
        break;
      }
      case 'it-del': {
        const form = $('#sheet form'), k = +form.getAttribute('data-c'), j = +form.getAttribute('data-i');
        ask('¿Eliminar el plato?', 'Se elimina «' + (cats()[k].items[j].name || 'Plato sin nombre') + '» de la carta.', 'Eliminar', function () { cats()[k].items.splice(j, 1); markDirty(); render(); }, true);
        break;
      }
      case 'tag': b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); break;
      case 'sheet-x': closeSheet(true); break;
      case 'ask-yes': { const fn = P.sheet && P.sheet.yes; closeSheet(); if (fn) fn(); break; }
    }
  });
  document.addEventListener('change', function (e) {
    const t = e.target;
    if (t.getAttribute('data-a') === 'sold') {
      const it = cats()[+t.getAttribute('data-c')].items[+t.getAttribute('data-i')];
      if (t.checked) it.soldDate = hoy(); else delete it.soldDate;
      markDirty(); render();
    }
  });
  document.addEventListener('input', function (e) {
    const t = e.target;
    if (t.getAttribute('data-in') === 'q') {
      P.q = t.value; const pos = t.selectionStart; render();
      const q = $('#q'); if (q) { q.focus(); try { q.setSelectionRange(pos, pos); } catch (err) { /* sin selección */ } }
    }
  });
  document.addEventListener('submit', function (e) {
    const f = e.target, kind = f.getAttribute('data-form'); if (!kind) return;
    e.preventDefault();
    if (kind === 'login') { const p = f.querySelector('[name="pin"]'); login(String((p && p.value) || '').trim()); }
    if (kind === 'item') applyItem(f);
    if (kind === 'cat') applyCat(f);
  });
  $('#sheetbg').addEventListener('click', function () { closeSheet(true); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && P.sheet) closeSheet(true); });
  window.addEventListener('beforeunload', function (e) { if (P.dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- Arranque ---------- */
  const ses = stGet('sessionStorage', K_SES);
  if (SLUG && API && ses && ses.token && ses.exp > Date.now()) { P.token = ses.token; load(); } else showLogin();
  window.__breakPanel = { P: P, save: save, load: load, hoy: hoy };
})();
