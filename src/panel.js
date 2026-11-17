/* Break · panel del local. El dueño entra con el PIN de su local y cambia el contenido (carta, precios, «agotado
   hoy», promos, menú del día, aviso, horario y festivos) sin tocar el diseño. Habla con el servidor del panel (worker/) en la misma dirección donde se abre:
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
    token: '', name: '', app: null, base: null, doc: null, draft: null, dirty: false, saving: false,
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
    P.base = META.contenidoOf(P.app);
    const base = P.doc ? P.doc.contenido : P.base;
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
  const TABS = [['carta', 'Carta'], ['promos', 'Promos'], ['avisos', 'Avisos y horario']];
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

  /* ---------- Promos, menú del día, aviso, horario y festivos ---------- */
  const DAYS = [[1, 'Lun', 'Lunes'], [2, 'Mar', 'Martes'], [3, 'Mié', 'Miércoles'], [4, 'Jue', 'Jueves'], [5, 'Vie', 'Viernes'], [6, 'Sáb', 'Sábado'], [0, 'Dom', 'Domingo']];
  /* Los mismos topes del saneador (C_MAX en el motor): lo que pase de ahí se perdería al guardar. */
  const LIM = { promos: 20, parts: 12, holidays: 40 };
  const AV_STYLES = [['acento', 'Con color'], ['suave', 'Suave'], ['alerta', 'Alerta']];
  /* Módulos de un tipo que la app sí tiene, en el orden de la app: el contenido solo se aplica a esos. */
  function modsOf(type) {
    P.draft.modules = P.draft.modules || {};
    const base = (P.base && P.base.modules) || {};
    return ((P.app && P.app.modules) || []).filter(function (m) { return m && m.type === type && m.id && base[m.id]; }).map(function (m) {
      let d = P.draft.modules[m.id];
      if (!d || d.type !== type) d = P.draft.modules[m.id] = clone(base[m.id]);
      return { id: m.id, m: d };
    });
  }
  function modS(id) { return P.draft.modules[id].s; }
  function hours() { if (!Array.isArray(P.draft.hours) || P.draft.hours.length !== 7) P.draft.hours = clone(P.base.hours); return P.draft.hours; }
  function holidays() { if (!Array.isArray(P.draft.holidays)) P.draft.holidays = clone(P.base.holidays || []); return P.draft.holidays; }
  function fmtHora(t) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(t || ''); if (!m) return '';
    const h = +m[1]; return ((h % 12) || 12) + ':' + m[2] + (h < 12 ? ' a. m.' : ' p. m.');
  }
  function fmtDias(days) {
    const set = DAYS.filter(function (d) { return (days || []).map(Number).indexOf(d[0]) >= 0; });
    if (!set.length) return '';
    if (set.length === 7) return 'Todos los días';
    const idx = set.map(function (d) { return DAYS.indexOf(d); });
    const seguidos = idx.every(function (v, i) { return i === 0 || v === idx[i - 1] + 1; });
    if (set.length >= 3 && seguidos) return set[0][1] + ' a ' + set[set.length - 1][1].toLowerCase();
    return set.map(function (d, i) { return i ? d[1].toLowerCase() : d[1]; }).join(', ');
  }
  function fmtFecha(iso) {
    try { return new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso + 'T12:00:00Z')); } catch (e) { return iso; }
  }
  function none(what) { return '<p class="none">Su app no tiene sección de ' + what + '; pídasela a quien la diseñó.</p>'; }
  function offNote(m) { return m.on === false ? '<p class="st warn">Esta sección está apagada en la app: los cambios no se ven hasta que la enciendan en el diseño.</p>' : ''; }
  function mvBtns(act, id, i, n, what) {
    return '<button type="button" class="ib" data-a="' + act + '" data-m="' + attr(id) + '" data-i="' + i + '" data-d="-1" aria-label="Subir ' + what + '"' + (i === 0 ? ' disabled' : '') + '>' + ICO.up + '</button>' +
      '<button type="button" class="ib" data-a="' + act + '" data-m="' + attr(id) + '" data-i="' + i + '" data-d="1" aria-label="Bajar ' + what + '"' + (i === n - 1 ? ' disabled' : '') + '>' + ICO.down + '</button>';
  }

  function promosCard(x) {
    const s = x.m.s, L = s.items || (s.items = []);
    return '<section class="blk card" data-mod="' + attr(x.id) + '"><div class="cat-h"><div class="blk-t"><b>' + esc(s.title || 'Promociones') + '</b><small>' + L.length + (L.length === 1 ? ' promoción' : ' promociones') + '</small></div>' +
      '<button type="button" class="ib" data-a="mt-ed" data-m="' + attr(x.id) + '" aria-label="Cambiar el título de la sección">' + ICO.edit + '</button></div>' + offNote(x.m) +
      '<div class="items">' + (L.length ? L.map(function (p, i) {
        const sub = [fmtDias(p.days), +p.price ? money(p.price) : ''].filter(Boolean).join(' · ');
        return '<div class="it"><button type="button" class="it-m" data-a="pr-ed" data-m="' + attr(x.id) + '" data-i="' + i + '"><b>' + esc(p.title || 'Promoción sin título') + '</b><span>' + esc(sub || 'Sin días ni precio') + '</span></button>' +
          mvBtns('pr-mv', x.id, i, L.length, 'promoción') + '</div>';
      }).join('') : '<p class="empty">Todavía no hay promociones.</p>') +
      (L.length < LIM.promos ? '<div class="add-row"><button type="button" class="btn sm" data-a="pr-add" data-m="' + attr(x.id) + '">+ Agregar promoción</button></div>' : '') + '</div></section>';
  }
  function menudiaCard(x) {
    const s = x.m.s, L = s.parts || (s.parts = []);
    const days = (s.days && s.days.length) ? s.days : [1, 2, 3, 4, 5];
    const sub = [fmtDias(days), s.from && s.to ? fmtHora(s.from) + ' – ' + fmtHora(s.to) : '', +s.price ? money(s.price) : ''].filter(Boolean).join(' · ');
    return '<section class="blk card" data-mod="' + attr(x.id) + '"><div class="cat-h"><div class="blk-t"><b>' + esc(s.title || 'Menú del día') + '</b><small>' + esc(sub) + '</small></div>' +
      '<button type="button" class="ib" data-a="md-ed" data-m="' + attr(x.id) + '" aria-label="Cambiar días, horas, precio y nota">' + ICO.edit + '</button></div>' + offNote(x.m) +
      '<div class="items parts">' + (L.length ? L.map(function (p, i) {
        const id = 'pt-' + x.id + '-' + i, lab = p.label || 'Parte ' + (i + 1);
        return '<div class="part"><label class="lab" for="' + attr(id) + '">' + esc(lab) + '</label><div class="part-r"><input class="in" id="' + attr(id) + '" type="text" data-in="part" data-m="' + attr(x.id) + '" data-i="' + i + '" maxlength="160" value="' + attr(p.value || '') + '" placeholder="Lo de hoy" autocomplete="off">' +
          '<button type="button" class="ib" data-a="pt-ed" data-m="' + attr(x.id) + '" data-i="' + i + '" aria-label="Editar o quitar «' + attr(lab) + '»">' + ICO.edit + '</button></div></div>';
      }).join('') : '<p class="empty">El menú no tiene partes todavía.</p>') +
      (bilingual() && L.length ? '<p class="help pad">Su app también está en inglés: toque el lápiz de cada parte para cambiar el texto en inglés.</p>' : '') +
      (s.note ? '<p class="help pad">Nota: ' + esc(s.note) + '</p>' : '') +
      (L.length < LIM.parts ? '<div class="add-row"><button type="button" class="btn sm" data-a="pt-add" data-m="' + attr(x.id) + '">+ Agregar parte</button></div>' : '') + '</div></section>';
  }
  /* Qué pasa hoy con un aviso: sin texto o vencido, la app no lo muestra. */
  function avisoState(m) {
    const s = m.s;
    if (!s.text) return ['', 'No hay aviso: la app no muestra nada.'];
    if (m.on === false) return ['warn', 'Está apagado. Tóquelo y dé «Listo» para volver a mostrarlo.'];
    if (s.until && s.until < hoy()) return ['warn', 'Venció el ' + fmtFecha(s.until) + ': la app ya no lo muestra.'];
    return ['ok', s.until ? 'Se muestra en la app hasta el ' + fmtFecha(s.until) + '.' : 'Se muestra en la app.'];
  }
  function avisoCard(x, i, n) {
    const s = x.m.s, st = avisoState(x.m);
    return '<section class="blk card avc" data-mod="' + attr(x.id) + '">' + (n > 1 ? '<div class="cat-h"><div class="blk-t"><b>Aviso ' + (i + 1) + '</b></div></div>' : '') +
      (s.text ? '<p class="av-x av-' + attr(s.style || 'acento') + '">' + (s.icon ? '<span aria-hidden="true">' + esc(s.icon) + '</span> ' : '') + esc(s.text) + '</p>' : '') +
      '<p class="st ' + st[0] + '">' + esc(st[1]) + '</p>' +
      '<div class="add-row"><button type="button" class="btn sm" data-a="av-ed" data-m="' + attr(x.id) + '">' + (s.text ? 'Cambiar el aviso' : 'Escribir un aviso') + '</button>' +
      (s.text ? '<button type="button" class="btn sm bad" data-a="av-del" data-m="' + attr(x.id) + '">Quitar el aviso</button>' : '') + '</div></section>';
  }
  function hoursCard() {
    const H = hours();
    return '<section class="blk card"><div class="hrs">' + DAYS.map(function (d) {
      const h = H.filter(function (x) { return +x.d === d[0]; })[0] || { closed: true };
      return '<div class="hr-r' + (h.closed ? ' closed' : '') + '"><b title="' + d[2] + '">' + d[1] + '</b>' +
        '<label class="sw"><input type="checkbox" data-a="hr-on" data-d="' + d[0] + '" aria-label="' + d[2] + ' abierto"' + (h.closed ? '' : ' checked') + '></label>' +
        (h.closed ? '<span class="hr-x">Cerrado</span>' :
          '<input class="in" type="time" data-in="hr" data-d="' + d[0] + '" data-k="open" aria-label="' + d[2] + ' abre" value="' + attr(h.open || '') + '">' +
          '<input class="in" type="time" data-in="hr" data-d="' + d[0] + '" data-k="close" aria-label="' + d[2] + ' cierra" value="' + attr(h.close || '') + '">') + '</div>';
    }).join('') + '</div><div class="add-row"><button type="button" class="btn sm" data-a="hr-copy">Copiar el lunes a todos</button></div></section>';
  }
  function holidayRow(x) {
    const h = x.h;
    return '<div class="it"><button type="button" class="it-m" data-a="hol-ed" data-i="' + x.i + '"><b>' + esc(fmtFecha(h.date)) + (h.name ? ' · ' + esc(h.name) : '') + '</b><span>' +
      esc(h.closed ? 'Cerrado' : 'Abre de ' + fmtHora(h.open) + ' a ' + fmtHora(h.close)) + '</span></button></div>';
  }
  function holidaysCards() {
    const td = hoy(), all = holidays().map(function (h, i) { return { h: h, i: i }; }).sort(function (a, b) { return a.h.date < b.h.date ? -1 : a.h.date > b.h.date ? 1 : 0; });
    const next = all.filter(function (x) { return x.h.date >= td; }), past = all.filter(function (x) { return x.h.date < td; });
    return '<section class="blk card"><div class="items">' + (next.length ? next.map(holidayRow).join('') : '<p class="empty">No hay festivos ni días especiales por venir.</p>') +
      (holidays().length < LIM.holidays ? '<div class="add-row"><button type="button" class="btn sm" data-a="hol-add">+ Agregar festivo</button></div>' : '') + '</div></section>' +
      (past.length ? '<section class="blk card past"><div class="cat-h"><div class="blk-t"><b>Ya pasaron</b><small>' + past.length + '</small></div>' +
        '<button type="button" class="btn sm" data-a="hol-clean">Quitar los que ya pasaron</button></div><div class="items">' + past.map(holidayRow).join('') + '</div></section>' : '');
  }
  VIEWS.promos = function () {
    const pr = modsOf('promos'), md = modsOf('menudia');
    return '<h2 class="sec-t">Promociones</h2>' + (pr.length ? '<p class="intro">Toque una promoción para cambiarla. La app resalta sola las del día.</p>' + pr.map(promosCard).join('') : none('promociones')) +
      '<h2 class="sec-t">Menú del día</h2>' + (md.length ? '<p class="intro">Escriba lo de hoy en cada parte y guarde.</p>' + md.map(menudiaCard).join('') : none('menú del día'));
  };
  VIEWS.avisos = function () {
    const av = modsOf('aviso');
    return '<h2 class="sec-t">Aviso destacado</h2>' + (av.length ? av.map(function (x, i) { return avisoCard(x, i, av.length); }).join('') : none('aviso destacado')) +
      '<h2 class="sec-t">Horario de la semana</h2><p class="intro">Hora de Colombia. La app dice sola si el local está abierto.</p>' + hoursCard() +
      '<h2 class="sec-t">Festivos y días especiales</h2><p class="intro">Para una fecha puntual: ese día le gana al horario de la semana.</p>' + holidaysCards();
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
  /* Hojas de promos, menú del día, aviso y festivos. */
  function sheetHead(t) { return '<div class="sheet-h"><h2 id="sheet-t">' + esc(t) + '</h2><button type="button" class="btn sm" data-a="sheet-x">Cerrar</button></div>'; }
  function txFld(label, k, o, opt) { return fld(label, k, o[k] || '', opt) + (bilingual() ? fld(label, k + '_en', o[k + '_en'] || '', Object.assign({}, opt, { en: true, ph: '', help: '' })) : ''); }
  function daysFld(days) {
    return '<div class="fld"><span class="lab">Días</span><div class="chips days" role="group" aria-label="Días">' + DAYS.map(function (d) {
      return '<button type="button" class="chip" data-a="tag" data-t="' + d[0] + '" aria-pressed="' + ((days || []).map(Number).indexOf(d[0]) >= 0) + '" aria-label="' + d[2] + '">' + d[1] + '</button>';
    }).join('') + '</div></div>';
  }
  function readDays() { return $$('#sheet .days [aria-pressed="true"]').map(function (b) { return +b.getAttribute('data-t'); }); }
  function done() { P.sheet.onClose = null; closeSheet(); markDirty(); render(); }
  function need(name, msg) { if (val(name).trim()) return true; toast(msg); const n = $('#sheet [name="' + name + '"]'); if (n) n.focus(); return false; }

  function editModTitle(id) {
    openSheet('<form data-form="mtitle" data-m="' + attr(id) + '" novalidate>' + sheetHead('Título de la sección') +
      txFld('Título', 'title', modS(id), { max: 80, ph: 'Promos de la semana' }) + '<div class="sheet-f"><button type="submit" class="btn pri">Listo</button></div></form>');
  }
  function editPromo(id, i, isNew) {
    const L = modS(id).items, p = L[i];
    openSheet('<form data-form="promo" data-m="' + attr(id) + '" data-i="' + i + '" novalidate>' + sheetHead(isNew ? 'Promoción nueva' : 'Editar promoción') +
      txFld('Título', 'title', p, { max: 80, ph: '2 × 1 en malteadas' }) + daysFld(p.days) +
      txFld('Detalle', 'desc', p, { area: true, max: 240 }) +
      fld('Precio', 'price', +p.price ? money(p.price) : '', { mode: 'numeric', ph: '$15.900', help: 'Opcional. En pesos, sin centavos.' }) +
      '<div class="sheet-f"><button type="submit" class="btn pri">Listo</button></div>' +
      (isNew ? '' : '<div class="danger"><button type="button" class="btn bad wide" data-a="pr-del">Quitar esta promoción</button></div>') + '</form>',
      isNew ? function () { L.splice(i, 1); render(); } : null);
  }
  function editMenudia(id) {
    const s = modS(id);
    openSheet('<form data-form="menudia" data-m="' + attr(id) + '" novalidate>' + sheetHead('Menú del día') +
      txFld('Título', 'title', s, { max: 80, ph: 'Menú del día' }) + daysFld((s.days && s.days.length) ? s.days : [1, 2, 3, 4, 5]) +
      '<div class="row2">' + fld('Desde', 'from', s.from || '', { type: 'time' }) + fld('Hasta', 'to', s.to || '', { type: 'time' }) + '</div>' +
      fld('Precio', 'price', +s.price ? money(s.price) : '', { mode: 'numeric', ph: '$15.000', help: 'En pesos, sin centavos.' }) +
      txFld('Nota', 'note', s, { max: 200, ph: 'Mientras haya.', help: 'Opcional. Sale debajo del menú.' }) +
      '<div class="sheet-f"><button type="submit" class="btn pri">Listo</button></div></form>');
  }
  function editPart(id, i, isNew) {
    const L = modS(id).parts, p = L[i];
    openSheet('<form data-form="part" data-m="' + attr(id) + '" data-i="' + i + '" novalidate>' + sheetHead(isNew ? 'Parte nueva' : 'Editar parte') +
      txFld('Nombre de la parte', 'label', p, { max: 40, ph: 'Sopa' }) + txFld('Lo de hoy', 'value', p, { max: 160, ph: 'Sancocho de gallina' }) +
      (isNew ? '' : '<div class="fld row2"><button type="button" class="btn sm" data-a="pt-mv" data-d="-1"' + (i === 0 ? ' disabled' : '') + '>Subir en la lista</button><button type="button" class="btn sm" data-a="pt-mv" data-d="1"' + (i === L.length - 1 ? ' disabled' : '') + '>Bajar en la lista</button></div>') +
      '<div class="sheet-f"><button type="submit" class="btn pri">Listo</button></div>' +
      (isNew ? '' : '<div class="danger"><button type="button" class="btn bad wide" data-a="pt-del">Quitar esta parte</button></div>') + '</form>',
      isNew ? function () { L.splice(i, 1); render(); } : null);
  }
  function editAviso(id) {
    const s = modS(id), icons = !(P.app.theme && P.app.theme.icons === 'ninguno');
    openSheet('<form data-form="aviso" data-m="' + attr(id) + '" novalidate>' + sheetHead(s.text ? 'Cambiar el aviso' : 'Escribir un aviso') +
      txFld('Aviso', 'text', s, { area: true, max: 200, ph: 'Este festivo abrimos de 8:00 a. m. a 8:00 p. m.' }) +
      (icons ? fld('Emoji', 'icon', s.icon || '', { max: 16, ph: '📣', help: 'Opcional. Va al lado del texto.' }) : '') +
      '<div class="fld"><span class="lab">Estilo</span><div class="chips seg" role="group" aria-label="Estilo">' + AV_STYLES.map(function (o) {
        return '<button type="button" class="chip" data-a="seg" data-v="' + o[0] + '" aria-pressed="' + ((s.style || 'acento') === o[0]) + '">' + o[1] + '</button>';
      }).join('') + '</div></div>' +
      fld('Mostrar hasta', 'until', s.until || '', { type: 'date', help: 'Ese día todavía se ve; al siguiente se quita solo. Vacío: se ve hasta que usted lo quite.' }) +
      '<div class="sheet-f"><button type="submit" class="btn pri">Listo</button></div></form>');
  }
  function editHoliday(i, isNew) {
    const h = holidays()[i], open = !h.closed;
    openSheet('<form data-form="holiday" data-i="' + i + '" novalidate>' + sheetHead(isNew ? 'Festivo nuevo' : 'Editar festivo') +
      fld('Fecha', 'date', h.date || '', { type: 'date' }) + txFld('Nombre', 'name', h, { max: 60, ph: 'Navidad', help: 'Opcional.' }) +
      '<div class="fld"><label class="sw"><input type="checkbox" name="open" data-a="hol-open"' + (open ? ' checked' : '') + '>Abrimos ese día, con otro horario</label></div>' +
      '<div class="row2" id="hol-times"' + (open ? '' : ' hidden') + '>' + fld('Abre', 'open_t', h.open || '', { type: 'time' }) + fld('Cierra', 'close_t', h.close || '', { type: 'time' }) + '</div>' +
      '<p class="help" id="hol-closed"' + (open ? ' hidden' : '') + '>La app dirá «Cerrado» ese día.</p>' +
      '<div class="sheet-f"><button type="submit" class="btn pri">Listo</button></div>' +
      (isNew ? '' : '<div class="danger"><button type="button" class="btn bad wide" data-a="hol-del">Quitar este festivo</button></div>') + '</form>',
      isNew ? function () { holidays().splice(i, 1); render(); } : null);
  }
  const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;
  const APPLY = {
    mtitle: function (f) { setTx(modS(f.getAttribute('data-m')), 'title'); done(); },
    promo: function (f) {
      const p = modS(f.getAttribute('data-m')).items[+f.getAttribute('data-i')];
      if (!need('title', 'Escriba el título de la promoción.')) return;
      setTx(p, 'title'); setTx(p, 'desc'); p.days = readDays(); p.price = priceIn(val('price')); done();
    },
    menudia: function (f) {
      const s = modS(f.getAttribute('data-m')), a = val('from'), b = val('to');
      if ((a || b) && !(TIME_RE.test(a) && TIME_RE.test(b))) { toast('Escriba las dos horas, o deje las dos vacías.'); return; }
      setTx(s, 'title'); setTx(s, 'note'); s.days = readDays(); s.from = a; s.to = b; s.price = priceIn(val('price')); done();
    },
    part: function (f) {
      const p = modS(f.getAttribute('data-m')).parts[+f.getAttribute('data-i')];
      if (!val('label').trim() && !val('value').trim()) { toast('Escriba el nombre de la parte.'); return; }
      setTx(p, 'label'); setTx(p, 'value'); done();
    },
    aviso: function (f) {
      const m = P.draft.modules[f.getAttribute('data-m')], s = m.s, u = val('until');
      if (!need('text', 'Escriba el aviso.')) return;
      if (u && u < hoy()) { toast('Esa fecha ya pasó: el aviso no se vería. Cámbiela o déjela vacía.'); return; }
      setTx(s, 'text'); s.until = u;
      const ic = $('#sheet [name="icon"]'); if (ic) s.icon = ic.value.trim();
      const st = $('#sheet .seg [aria-pressed="true"]'); s.style = st ? st.getAttribute('data-v') : 'acento';
      m.on = true; done();
    },
    holiday: function (f) {
      const H = holidays(), i = +f.getAttribute('data-i'), h = H[i], date = val('date'), open = $('#sheet [name="open"]').checked;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { toast('Elija la fecha.'); return; }
      if (H.some(function (x, k) { return k !== i && x.date === date; })) { toast('Ya hay un festivo en esa fecha.'); return; }
      if (open && !(TIME_RE.test(val('open_t')) && TIME_RE.test(val('close_t')))) { toast('Escriba la hora de abrir y la de cerrar.'); return; }
      h.date = date; setTx(h, 'name'); h.closed = !open; h.open = open ? val('open_t') : ''; h.close = open ? val('close_t') : '';
      H.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
      done();
    }
  };
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
    const a = b.getAttribute('data-a'), ci = +b.getAttribute('data-c'), ii = +b.getAttribute('data-i'), mid = b.getAttribute('data-m');
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
      case 'mt-ed': editModTitle(mid); break;
      case 'pr-ed': editPromo(mid, ii); break;
      case 'pr-add': { const L = modS(mid).items; L.push({ days: [], title: '', desc: '', price: 0 }); editPromo(mid, L.length - 1, true); break; }
      case 'pr-mv': if (move(modS(mid).items, ii, +b.getAttribute('data-d'))) { markDirty(); render(); } break;
      case 'pr-del': {
        const form = $('#sheet form'), id = form.getAttribute('data-m'), j = +form.getAttribute('data-i');
        ask('¿Quitar la promoción?', 'Se quita «' + (modS(id).items[j].title || 'Promoción sin título') + '».', 'Quitar', function () { modS(id).items.splice(j, 1); markDirty(); render(); }, true);
        break;
      }
      case 'md-ed': editMenudia(mid); break;
      case 'pt-ed': editPart(mid, ii); break;
      case 'pt-add': { const L = modS(mid).parts; L.push({ label: '', value: '' }); editPart(mid, L.length - 1, true); break; }
      case 'pt-mv': {
        const form = $('#sheet form'), id = form.getAttribute('data-m'), j = +form.getAttribute('data-i'), d = +b.getAttribute('data-d'), L = modS(id).parts;
        setTx(L[j], 'label'); setTx(L[j], 'value');
        if (move(L, j, d)) { markDirty(); editPart(id, j + d); render(); }
        break;
      }
      case 'pt-del': {
        const form = $('#sheet form'), id = form.getAttribute('data-m'), j = +form.getAttribute('data-i');
        ask('¿Quitar esta parte?', 'Se quita «' + (modS(id).parts[j].label || 'Parte ' + (j + 1)) + '» del menú del día.', 'Quitar', function () { modS(id).parts.splice(j, 1); markDirty(); render(); }, true);
        break;
      }
      case 'av-ed': editAviso(mid); break;
      case 'av-del': ask('¿Quitar el aviso?', 'La app deja de mostrarlo. Después puede escribir otro.', 'Quitar', function () { const s = modS(mid); s.text = ''; delete s.text_en; s.until = ''; markDirty(); render(); }, true); break;
      case 'seg': $$('[data-a="seg"]', b.parentNode).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); break;
      case 'hr-copy': {
        const H = hours(), mon = H.filter(function (h) { return +h.d === 1; })[0];
        if (mon) { H.forEach(function (h) { if (h !== mon) { h.open = mon.open; h.close = mon.close; h.closed = mon.closed; } }); markDirty(); render(); toast('El horario del lunes quedó en toda la semana.'); }
        break;
      }
      case 'hol-ed': editHoliday(ii); break;
      case 'hol-add': { const H = holidays(); H.push({ date: '', closed: true, open: '', close: '', name: '' }); editHoliday(H.length - 1, true); break; }
      case 'hol-del': {
        const j = +$('#sheet form').getAttribute('data-i');
        ask('¿Quitar el festivo?', 'Ese día vuelve al horario de la semana.', 'Quitar', function () { holidays().splice(j, 1); markDirty(); render(); }, true);
        break;
      }
      case 'hol-clean': { const td = hoy(); P.draft.holidays = holidays().filter(function (h) { return h.date >= td; }); markDirty(); render(); toast('Se quitaron los festivos que ya pasaron.'); break; }
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
    if (t.getAttribute('data-a') === 'hr-on') {
      /* Al abrir un día se le pone el horario de otro día abierto, para no dejarlo sin horas. */
      const H = hours(), h = H.filter(function (x) { return +x.d === +t.getAttribute('data-d'); })[0];
      if (!h) return;
      if (t.checked) {
        const ref = H.filter(function (x) { return !x.closed && x.open && x.close; })[0];
        h.closed = false; if (!h.open || !h.close) { h.open = ref ? ref.open : '08:00'; h.close = ref ? ref.close : '18:00'; }
      } else h.closed = true;
      markDirty(); render();
    }
    if (t.getAttribute('data-a') === 'hol-open') { $('#hol-times').hidden = !t.checked; $('#hol-closed').hidden = t.checked; }
    /* Una hora que se dejó a medias vuelve a la que estaba. */
    if (t.getAttribute('data-in') === 'hr' && !t.value) render();
  });
  document.addEventListener('input', function (e) {
    const t = e.target;
    /* Lo de hoy en el menú del día y las horas de la semana se escriben directo, sin abrir una hoja. */
    if (t.getAttribute('data-in') === 'part') {
      const p = modS(t.getAttribute('data-m')).parts[+t.getAttribute('data-i')];
      if (p) { p.value = t.value; markDirty(); }
    }
    if (t.getAttribute('data-in') === 'hr' && TIME_RE.test(t.value)) {
      const h = hours().filter(function (x) { return +x.d === +t.getAttribute('data-d'); })[0];
      if (h) { h[t.getAttribute('data-k')] = t.value; markDirty(); }
    }
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
    if (APPLY[kind]) APPLY[kind](f);
  });
  $('#sheetbg').addEventListener('click', function () { closeSheet(true); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && P.sheet) closeSheet(true); });
  window.addEventListener('beforeunload', function (e) { if (P.dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- Arranque ---------- */
  const ses = stGet('sessionStorage', K_SES);
  if (SLUG && API && ses && ses.token && ses.exp > Date.now()) { P.token = ses.token; load(); } else showLogin();
  window.__breakPanel = { P: P, save: save, load: load, hoy: hoy };
})();
