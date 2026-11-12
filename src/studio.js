/* Break Studio · editor de apps de menú. Usa breakApp() para la vista previa y para exportar. */
(function () {
  'use strict';
  const $ = function (s, el) { return (el || document).querySelector(s); };
  const esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  const attr = esc;
  const clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  const uid = function (p) { return (p || 'id') + '-' + Math.random().toString(36).slice(2, 7) + Date.now().toString(36).slice(-3); };
  const money = function (n) { return '$' + Math.round(Number(n) || 0).toLocaleString('es-CO'); };
  const sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  const DESKTOP = window.matchMedia ? window.matchMedia('(min-width: 1000px)') : { matches: false };
  const JSZIP_SRC = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
  const QR_SRC = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js';
  /* Constantes del motor: íconos de línea, sus grupos y la función que decide qué dibujo se ve. */
  const META = breakApp(null, null, null, { meta: true });
  const DAYS = [[1, 'L', 'Lunes'], [2, 'M', 'Martes'], [3, 'X', 'Miércoles'], [4, 'J', 'Jueves'], [5, 'V', 'Viernes'], [6, 'S', 'Sábado'], [0, 'D', 'Domingo']];

  function getPath(o, p) { return p.split('.').reduce(function (a, k) { return a == null ? undefined : a[k]; }, o); }
  function setPath(o, p, v) {
    const ks = p.split('.'); let a = o;
    for (let i = 0; i < ks.length - 1; i++) {
      if (a[ks[i]] == null || typeof a[ks[i]] !== 'object') a[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {};
      a = a[ks[i]];
    }
    a[ks[ks.length - 1]] = v;
  }
  /* Fecha de hoy en Colombia (AAAA-MM-DD) y fecha corta en español para los resúmenes. */
  function todayISO() { try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  function fmtDay(iso) { try { return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(iso + 'T12:00:00Z')); } catch (e) { return iso; } }
  function move(arr, i, d) { const j = i + d; if (!arr || j < 0 || j >= arr.length) return false; const x = arr.splice(i, 1)[0]; arr.splice(j, 0, x); return true; }
  function lsGet(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento local */ } }
  function slug(s) { return String(s || 'app').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'app'; }
  function ago(ts) {
    if (!ts) return '';
    const m = Math.round((Date.now() - ts) / 60000);
    if (m < 1) return 'hace un momento';
    if (m < 60) return 'hace ' + m + ' min';
    const h = Math.round(m / 60);
    if (h < 24) return 'hace ' + h + ' h';
    const d = Math.round(h / 24);
    return d === 1 ? 'ayer' : 'hace ' + d + ' días';
  }
  function lum(hex) {
    let h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    if (h.length !== 6) return 0.5;
    const ch = [0, 2, 4].map(function (i) { const v = parseInt(h.slice(i, i + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }
  function contrast(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function onColor(hex) { const L = lum(hex); return (L + 0.05) / 0.05 > 1.05 / (L + 0.05) ? '#141414' : '#ffffff'; }
  function useCap(name) {
    try { if (window.claude && typeof window.claude.use === 'function') return Promise.resolve(window.claude.use(name)).catch(function () { return null; }); } catch (e) { /* sin runtime */ }
    return Promise.resolve(null);
  }
  function loadScript(src, globalName) {
    if (window[globalName]) return Promise.resolve(window[globalName]);
    loadScript.cache = loadScript.cache || {};
    if (loadScript.cache[src]) return loadScript.cache[src];
    loadScript.cache[src] = new Promise(function (res, rej) {
      const s = document.createElement('script'); s.src = src; s.async = true;
      s.onload = function () { if (window[globalName]) res(window[globalName]); else { loadScript.cache[src] = null; rej(new Error('missing')); } };
      s.onerror = function () { loadScript.cache[src] = null; rej(new Error('load')); };
      document.head.appendChild(s);
    });
    return loadScript.cache[src];
  }

  /* ---------- Estado ---------- */
  const S = {
    apps: [], cur: null, kind: 'tpl', tpl: {}, tab: DESKTOP.matches ? 'estilo' : 'vista',
    openMod: null, openCat: null, edit: null, save: 'idle', store: 'loading', storeNote: '', dirty: false,
    pvLang: 'es', full: false, confirmFn: null, sheetOnClose: null, restored: false, opener: null,
    /* Estilo: «Opciones avanzadas» se recuerda en el navegador; sub es la sección abierta en ese modo. */
    adv: !!lsGet('break.studio.adv', false), sub: 'estetica'
  };
  let saveTimer = null;

  /* ---------- Vista previa ---------- */
  const PV = { frame: null, rt: null, ready: false, cfgId: null, timer: null };
  function pvBoot() {
    PV.frame = $('#pv');
    try {
      const d = PV.frame.contentDocument;
      d.open();
      d.write('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vista previa</title></head><body></body></html>');
      d.close();
      PV.rt = breakApp(PV.frame.contentWindow, d, clone(S.cur), { mode: 'preview', assetURL: assetURL });
      PV.ready = true; PV.cfgId = S.cur.id;
    } catch (e) { toast('La vista previa no pudo arrancar: ' + e.message); }
  }
  function pvUpdate(now) {
    if (!PV.ready || !S.cur) return;
    clearTimeout(PV.timer);
    const run = function () {
      try {
        if (PV.cfgId !== S.cur.id) { PV.rt.reset(clone(S.cur)); PV.cfgId = S.cur.id; if (S.pvLang === 'en') PV.rt.setLang('en'); }
        else PV.rt.update(clone(S.cur));
      } catch (e) { toast('Error en la vista previa: ' + e.message); }
    };
    if (now) run(); else PV.timer = setTimeout(run, 140);
  }
  function pvFocus(mid) { if (PV.ready) { clearTimeout(PV.timer); PV.rt.update(clone(S.cur)); PV.rt.focus(mid); } }

  /* ---------- Almacenamiento ---------- */
  const Store = { kind: 'none', col: null, unsub: null };
  const WQ = {};
  function validApp(a) { return a && typeof a === 'object' && a.v && a.id && a.brand && a.theme && a.menu && Array.isArray(a.modules); }
  async function storeInit() {
    const db = await useCap('db');
    let uidv = null;
    if (db) {
      const user = await useCap('user');
      if (user) { try { uidv = await user.id(); } catch (e) { uidv = null; } }
    }
    if (db && uidv) { try { Store.col = db.collection('data/users/' + uidv); } catch (e) { Store.col = null; } }
    if (!Store.col) { localInit(); return; }
    Store.kind = 'db';
    let fresh = false;
    const timer = setTimeout(function () { if (!fresh) { S.storeNote = 'Tus apps guardadas todavía no cargan. Revisa la conexión.'; renderChrome(); } }, 10000);
    Store.unsub = Store.col.onSnapshot(function (snap) {
      if (!snap.metadata.fromCache) { fresh = true; clearTimeout(timer); S.storeNote = ''; }
      const all = snap.docs.map(function (d) { return d.data(); });
      const lib = all.filter(function (x) { return x && x.kind === 'break-fotos'; })[0];
      if (lib) libFromDoc(lib);
      onRemoteList(all);
    }, function (err) {
      clearTimeout(timer);
      Store.kind = 'down';
      S.store = 'ready';
      S.storeNote = err && err.code === 'revoked' ? 'El guardado ya no está disponible en esta vista.' : 'Se perdió la conexión con tus apps guardadas.';
      renderChrome();
    });
  }
  function localInit() {
    let ok = true;
    try { localStorage.setItem('break.studio.probe', '1'); localStorage.removeItem('break.studio.probe'); } catch (e) { ok = false; }
    Store.kind = ok ? 'local' : 'memory';
    const all = ok ? lsGet('break.studio.apps', {}) : {};
    onRemoteList(Object.keys(all).map(function (k) { return all[k]; }));
  }
  function onRemoteList(list) {
    S.apps = list.filter(validApp).map(clone).sort(function (a, b) { return (b.updated || 0) - (a.updated || 0); });
    S.store = 'ready';
    if (S.kind === 'app' && S.cur) {
      const remote = S.apps.filter(function (a) { return a.id === S.cur.id; })[0];
      const busy = S.dirty || saveTimer || isWriting(S.cur.id);
      if (!remote && !busy && Store.kind === 'db') { toast('Esta app se eliminó en otro dispositivo.'); openTemplate(TEMPLATES[0].id); return; }
      if (remote && !busy && (remote.updated || 0) > (S.cur.updated || 0)) { S.cur = clone(remote); renderAll(); pvUpdate(true); }
    }
    if (!S.restored) {
      S.restored = true;
      const last = lsGet('break.studio.last', null);
      const tplUntouched = S.kind === 'tpl' && !(S.tpl[S.cur.id] && S.tpl[S.cur.id].dirty);
      if (last && last.kind === 'app' && tplUntouched && S.apps.some(function (a) { return a.id === last.id; })) { openApp(last.id); return; }
    }
    renderChrome();
  }
  function storeWrite(app) {
    const body = clone(app);
    if (Store.kind === 'db') {
      if (JSON.stringify(body).length > 240000) return Promise.reject({ code: 'too_big' });
      return Store.col.doc(app.id).set(body);
    }
    if (Store.kind === 'local') {
      const all = lsGet('break.studio.apps', {}); all[app.id] = body;
      try { localStorage.setItem('break.studio.apps', JSON.stringify(all)); } catch (e) { return Promise.reject({ code: 'quota_exceeded' }); }
      return Promise.resolve();
    }
    if (Store.kind === 'memory') return Promise.resolve();
    return Promise.reject({ code: 'unavailable' });
  }
  function storeRemove(id) {
    if (Store.kind === 'db') return Store.col.doc(id).delete();
    if (Store.kind === 'local') { const all = lsGet('break.studio.apps', {}); delete all[id]; lsSet('break.studio.apps', all); }
    return Promise.resolve();
  }
  function isWriting(id) { const q = WQ[id]; return !!(q && (q.busy || q.next)); }
  function upsertList(app) {
    const i = S.apps.findIndex(function (a) { return a.id === app.id; });
    if (i >= 0) S.apps[i] = clone(app); else S.apps.unshift(clone(app));
    S.apps.sort(function (a, b) { return (b.updated || 0) - (a.updated || 0); });
  }
  function persist(app) {
    const q = WQ[app.id] || (WQ[app.id] = { busy: false, next: null });
    q.next = clone(app);
    if (!q.busy) drain(app.id);
  }
  async function drain(id) {
    const q = WQ[id]; q.busy = true;
    while (q.next) {
      const body = q.next; q.next = null;
      setSave('saving');
      let tries = 0;
      for (;;) {
        try { await storeWrite(body); break; } catch (e) {
          const code = e && e.code;
          if (code === 'unavailable' && Store.kind === 'db' && tries < 1) { tries += 1; await sleep(700 + Math.random() * 900); continue; }
          q.busy = false; q.next = null; S.dirty = false;
          setSave('error');
          toast(code === 'too_big' ? 'La app pesa demasiado para guardarla. Usa un logo más liviano.' : code === 'quota_exceeded' ? 'No queda espacio para guardar más apps. Elimina alguna que no uses.' : 'No se pudo guardar. Revisa la conexión e intenta de nuevo.');
          return;
        }
      }
      upsertList(body);
    }
    q.busy = false;
    if (S.kind === 'app' && S.cur && S.cur.id === id && !saveTimer) { S.dirty = false; setSave('saved'); }
  }
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { saveTimer = null; if (S.kind === 'app') persist(S.cur); }, 900);
  }
  function flushSave() {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; if (S.kind === 'app') persist(S.cur); }
  }
  function setSave(st) { S.save = st; updateSaveChip(); }

  /* ---------- Biblioteca de fotos (capacidad assets de claude.ai) ---------- */
  /* Las fotos subidas se guardan aparte de la app (hasta 20 MB cada una) y la app guarda solo «asset:<id>», así
     no choca con el límite de cada documento. El índice de la biblioteca es un documento propio de la cuenta
     (LIB_DOC); assets.list() solo da el espacio usado y las fotos que nadie apunta. Sin la capacidad (fuera de
     claude.ai, o para quien no puede editar) las fotos se incrustan en la app, como antes. */
  const LIB_DOC = 'biblioteca-fotos';
  const LIB = { cap: null, ready: false, index: [], usage: null, listed: null, loading: false, wq: Promise.resolve() };
  /* Dirección de una foto de la biblioteca: «/_blob/<id>» en el sitio del Artifact, completa para que también
     la resuelva el iframe de la vista previa. */
  function assetURL(id) {
    try { if (/^https?:$/.test(location.protocol)) return new URL('/_blob/' + id, location.href).href; } catch (e) { /* abajo */ }
    return '/_blob/' + id;
  }
  function isAssetRef(v) { return typeof v === 'string' && /^asset:[\w-]{8,64}$/.test(v); }
  function imgSrc(v) { v = String(v || ''); return isAssetRef(v) ? assetURL(v.slice(6)) : v; }
  function fmtBytes(n) { n = +n || 0; return n >= 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
  function libFromDoc(doc) {
    LIB.index = (Array.isArray(doc.items) ? doc.items : []).filter(function (f) { return f && /^[\w-]{8,64}$/.test(f.id); });
  }
  function libSave() {
    if (Store.kind !== 'db' || !Store.col) return;
    const body = { kind: 'break-fotos', items: LIB.index.slice(-1500) };
    LIB.wq = LIB.wq.then(function () { return Store.col.doc(LIB_DOC).set(body); }).catch(function () { /* se vuelve a guardar con la próxima foto */ });
  }
  function libInit() {
    useCap('assets').then(function (cap) { LIB.cap = cap; LIB.ready = true; if (cap) libRefresh(); renderEditor(); });
  }
  /* Espacio usado y fotos guardadas, para el medidor y para «Borrar fotos sin usar». */
  function libRefresh() {
    if (!LIB.cap || LIB.loading) return;
    LIB.loading = true;
    LIB.cap.list().then(function (r) {
      LIB.usage = r && r.usage || null;
      LIB.listed = (r && Array.isArray(r.assets) ? r.assets : []).map(function (a) { return a.id; });
    }, function () { LIB.usage = null; }).then(function () { LIB.loading = false; libPaint(); });
  }
  function libMeter() {
    const u = LIB.usage;
    if (!u) return 'Calculando el espacio…';
    return u.files + (u.files === 1 ? ' foto' : ' fotos') + ' · ' + fmtBytes(u.bytes) + (u.maxBytes ? ' de ' + fmtBytes(u.maxBytes) : '');
  }
  /* Fotos de la biblioteca que usan las apps guardadas, la que está abierta y las plantillas en edición. */
  function usedAssets() {
    const used = {};
    const scan = function (o) {
      if (typeof o === 'string') { if (isAssetRef(o)) used[o.slice(6)] = true; return; }
      if (o && typeof o === 'object') Object.keys(o).forEach(function (k) { scan(o[k]); });
    };
    S.apps.forEach(scan); scan(S.cur);
    Object.keys(S.tpl).forEach(function (k) { if (S.tpl[k]) scan(S.tpl[k].cfg); });
    return used;
  }
  function unusedAssets() {
    const used = usedAssets(), seen = {}, out = [];
    LIB.index.map(function (f) { return f.id; }).concat(LIB.listed || []).forEach(function (id) { if (!used[id] && !seen[id]) { seen[id] = true; out.push(id); } });
    return out;
  }
  /* Actualiza el medidor y el botón de limpieza sin volver a pintar el editor. */
  function libPaint() {
    const ms = document.querySelectorAll('[data-lib-meter]');
    for (let i = 0; i < ms.length; i++) ms[i].textContent = libMeter();
    const n = unusedAssets().length, bs = document.querySelectorAll('[data-a="lib-clean"]');
    for (let i = 0; i < bs.length; i++) { bs[i].disabled = !n; bs[i].textContent = n ? 'Borrar fotos sin usar (' + n + ')' : 'No hay fotos sin usar'; }
  }
  function canvasBlob(cv, type, q) { return new Promise(function (res) { try { cv.toBlob(function (b) { res(b); }, type, q); } catch (e) { res(null); } }); }
  /* Reduce la foto (cuadrada y centrada para el logo) y la pasa a WebP, o a JPG si el navegador no sabe. */
  async function encodePhoto(im, side, square) {
    let sx = 0, sy = 0, sw = im.width, sh = im.height, w, h;
    if (square) { const m = Math.min(im.width, im.height); sx = (im.width - m) / 2; sy = (im.height - m) / 2; sw = sh = m; w = h = Math.max(1, Math.min(side, m)); }
    else { const r = Math.min(1, side / Math.max(im.width, im.height)); w = Math.max(1, Math.round(im.width * r)); h = Math.max(1, Math.round(im.height * r)); }
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    cv.getContext('2d').drawImage(im, sx, sy, sw, sh, 0, 0, w, h);
    let b = await canvasBlob(cv, 'image/webp', 0.82);
    if (!b || b.type !== 'image/webp') b = await canvasBlob(cv, 'image/jpeg', 0.85);
    return { blob: b, w: w, h: h };
  }
  /* Sube una foto a la biblioteca y la anota en el índice. Devuelve su id, o null con un aviso. */
  async function libUpload(blob, w, h) {
    if (!LIB.cap || !blob) return null;
    for (let tries = 0; ; tries++) {
      try {
        const r = await LIB.cap.upload(blob);
        LIB.index.push({ id: r.id, w: w || 0, h: h || 0, bytes: r.sizeBytes || blob.size, at: Date.now() });
        libSave(); LIB.usage = null; libRefresh();
        return r.id;
      } catch (e) {
        const code = e && e.code;
        if (code === 'store_unavailable' && tries < 1) { await sleep(900); continue; }
        toast(code === 'too_large' ? 'La foto es demasiado grande.' : code === 'quota_or_state' ? 'La biblioteca de fotos está llena. Borra las fotos que no uses.'
          : code === 'rate_limited' ? 'Espera un momento antes de subir otra foto.' : code === 'unsupported_type' ? 'Ese formato de imagen no se puede guardar.'
          : code === 'upstream_auth' ? 'Vuelve a cargar la página para subir fotos.' : 'No se pudo subir la foto. Revisa la conexión.');
        return null;
      }
    }
  }
  function dataURLBlob(url) {
    const m = /^data:([^;,]+)(;base64)?,(.*)$/.exec(String(url)); if (!m) return null;
    const bin = m[2] ? atob(m[3]) : decodeURIComponent(m[3]), arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: m[1] });
  }
  function blobToDataURL(b) { return new Promise(function (res, rej) { const r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = rej; r.readAsDataURL(b); }); }
  function walkStrings(o, fn) {
    Object.keys(o).forEach(function (k) {
      const v = o[k];
      if (typeof v === 'string') { const r = fn(v); if (r !== undefined) o[k] = r; } else if (v && typeof v === 'object') walkStrings(v, fn);
    });
  }
  /* Fotos incrustadas de una app (sin las ilustraciones SVG), para pasarlas a la biblioteca. */
  function embeddedPhotos(c) {
    const out = {};
    walkStrings(clone(c), function (v) { if (/^data:image\/(png|jpe?g|webp|gif);base64,/.test(v)) out[v] = true; });
    return Object.keys(out);
  }
  async function internalize(c) {
    let n = 0;
    for (const url of embeddedPhotos(c)) {
      const b = dataURLBlob(url); if (!b) continue;
      const id = await libUpload(b, 0, 0); if (!id) break;
      walkStrings(c, function (v) { return v === url ? 'asset:' + id : undefined; });
      n++;
    }
    return n;
  }
  const IMG_EXT = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif' };
  /* Copia de la app lista para salir de claude.ai: las fotos de la biblioteca se incrustan (.html y .json) o
     se vuelven archivos img/… (.zip). Las que no se puedan traer se quitan y se cuentan en `missing`. */
  async function materialize(c, asFiles) {
    const x = clone(c), ids = {};
    walkStrings(x, function (v) { if (isAssetRef(v)) ids[v.slice(6)] = true; });
    const map = {}, files = []; let missing = 0;
    for (const id of Object.keys(ids)) {
      try {
        const r = await fetch(assetURL(id));
        if (!r.ok) throw new Error(String(r.status));
        const b = await r.blob(), ext = IMG_EXT[b.type] || 'webp';
        if (asFiles) { const path = 'img/' + id + '.' + ext; files.push({ path: path, blob: b }); map[id] = path; }
        else map[id] = await blobToDataURL(b);
      } catch (e) { missing++; map[id] = ''; }
    }
    walkStrings(x, function (v) { return isAssetRef(v) ? map[v.slice(6)] : undefined; });
    return { cfg: x, files: files, missing: missing };
  }
  function missingNote(n) { if (n) toast(n === 1 ? 'Una foto de la biblioteca no se pudo incluir. Ábrela en claude.ai y vuelve a exportar.' : n + ' fotos de la biblioteca no se pudieron incluir. Ábrelas en claude.ai y vuelve a exportar.'); }
  /* Galería de la biblioteca: para elegir una foto (path) o solo para ver y limpiar. */
  function libGrid(path) {
    const used = usedAssets(), list = LIB.index.slice().reverse();
    if (!list.length) return '<p class="empty">Todavía no hay fotos. Súbelas desde la portada, los platos, las categorías o la galería.</p>';
    return '<div class="libg">' + list.map(function (f, i) {
      const inUse = !!used[f.id], label = 'Foto ' + (list.length - i) + (f.w ? ' · ' + f.w + ' × ' + f.h : '') + (inUse ? ' · en uso' : '');
      const inner = '<img src="' + attr(assetURL(f.id)) + '" alt="" loading="lazy">' + (inUse ? '<em>En uso</em>' : '');
      return path ? '<button type="button" class="libi" data-a="lib-use" data-id="' + attr(f.id) + '" data-ip="' + attr(path) + '" aria-label="' + attr(label) + '">' + inner + '</button>'
        : '<span class="libi" role="img" aria-label="' + attr(label) + '">' + inner + '</span>';
    }).join('') + '</div>';
  }
  function openLibrary(path) {
    const back = S.edit ? { ci: S.edit.ci, ii: S.edit.ii } : null;
    openSheet(sheetHead(path ? 'Elegir foto' : 'Biblioteca de fotos') + '<p class="help" data-lib-meter>' + esc(libMeter()) + '</p>' + libGrid(path) +
      (path ? '<label class="btn filebtn">Subir una foto nueva<input type="file" accept="image/*" data-a="img-file" data-ip="' + attr(path) + '" data-max="1100" hidden></label>' : ''),
      'lib', function () { if (back) openItemSheet(back.ci, back.ii); else { renderEditor(); renderTabs(); } });
    libRefresh();
  }

  /* ---------- Edición ---------- */
  function edited() {
    if (S.kind === 'tpl') { if (S.tpl[S.cur.id]) S.tpl[S.cur.id].dirty = true; updateSaveChip(); }
    else { S.cur.updated = Date.now(); S.dirty = true; setSave('saving'); scheduleSave(); }
    pvUpdate(false);
  }
  function openTemplate(id) {
    const t = TEMPLATES.filter(function (x) { return x.id === id; })[0] || TEMPLATES[0];
    flushSave();
    if (!S.tpl[t.id]) S.tpl[t.id] = { cfg: clone(t), dirty: false };
    S.cur = S.tpl[t.id].cfg; S.kind = 'tpl'; S.openMod = null; S.openCat = null; S.pvLang = 'es'; S.save = 'idle';
    lsSet('break.studio.last', { kind: 'tpl', id: t.id });
    renderAll(); pvUpdate(true);
  }
  function openApp(id) {
    const a = S.apps.filter(function (x) { return x.id === id; })[0];
    if (!a) return;
    flushSave();
    S.cur = clone(a); S.kind = 'app'; S.openMod = null; S.openCat = null; S.pvLang = 'es'; S.dirty = false; S.save = 'saved';
    lsSet('break.studio.last', { kind: 'app', id: id });
    closeSheet(); renderAll(); pvUpdate(true);
  }
  function storeReady() { return S.store === 'ready' && (Store.kind === 'db' || Store.kind === 'local' || Store.kind === 'memory'); }
  function createApp(from, name) {
    if (!storeReady()) { toast(S.store === 'loading' ? 'Estoy conectando con tu cuenta. Intenta en unos segundos.' : 'El guardado no está disponible ahora.'); return; }
    let base;
    if (from === 'blank') base = blankApp(name);
    else {
      const src = (S.tpl[from] && S.tpl[from].cfg) || TEMPLATES.filter(function (t) { return t.id === from; })[0] || S.apps.filter(function (a) { return a.id === from; })[0];
      base = clone(src || TEMPLATES[0]);
    }
    base.id = uid('a'); base.template = false; base.created = base.updated = Date.now(); base.from = from;
    if (name) base.brand.name = name;
    S.apps.unshift(clone(base));
    if (S.tpl[from]) S.tpl[from] = null;
    S.cur = base; S.kind = 'app'; S.openMod = null; S.openCat = null; S.dirty = false; S.pvLang = 'es';
    lsSet('break.studio.last', { kind: 'app', id: base.id });
    persist(base);
    closeSheet(); renderAll(); pvUpdate(true);
    toast('Creaste «' + base.brand.name + '». Los cambios se guardan solos.');
  }
  function saveAsApp() { createApp(S.cur.id, S.cur.brand.name); }
  function dupApp(id) {
    const a = S.apps.filter(function (x) { return x.id === id; })[0]; if (!a) return;
    createApp(id, (a.brand.name || 'App') + ' (copia)');
  }
  function delApp(id) {
    storeRemove(id).then(function () {
      S.apps = S.apps.filter(function (a) { return a.id !== id; });
      if (S.kind === 'app' && S.cur.id === id) { S.kind = 'tpl'; openTemplate(TEMPLATES[0].id); }
      toast('App eliminada.'); renderChrome();
    }, function () { toast('No se pudo eliminar. Intenta de nuevo.'); });
  }
  function applySkin(k) {
    const sk = SKINS[k]; if (!sk) return;
    const th = S.cur.theme, d = clone(sk.defaults);
    th.skin = k; th.colors = d.colors; th.fonts = d.fonts; th.radius = d.radius; th.motion = d.motion; th.texture = d.texture; th.icons = d.icons;
    const carta = S.cur.modules.filter(function (m) { return m.type === 'carta'; })[0];
    if (carta) carta.s.layout = sk.layout;
    edited(); renderEditor(); renderHeader(); pvUpdate(true);
  }
  function applyPalette(i) {
    const sk = SKINS[S.cur.theme.skin] || SKINS.elegante, p = sk.palettes[i]; if (!p) return;
    S.cur.theme.colors = clone(p.colors);
    edited(); renderEditor(); renderHeader();
  }
  function modIndex(mid) { return S.cur.modules.findIndex(function (m) { return m.id === mid; }); }
  function addMod(type) {
    const def = MODULES[type]; if (!def) return;
    if (def.single && S.cur.modules.some(function (m) { return m.type === type; })) { toast('Este módulo ya está en la app.'); return; }
    const m = { id: uid(type), type: type, on: true, s: clone(def.defaults) };
    const ci = S.cur.modules.findIndex(function (x) { return x.type === 'contacto'; });
    if (type === 'aviso') S.cur.modules.unshift(m);
    else if (ci >= 0) S.cur.modules.splice(ci, 0, m); else S.cur.modules.push(m);
    S.openMod = m.id;
    closeSheet(); edited(); renderEditor();
    setTimeout(function () { pvFocus(m.id); const row = document.querySelector('.mod[data-mid="' + m.id + '"]'); if (row && row.scrollIntoView) row.scrollIntoView({ block: 'nearest' }); }, 180);
    toast('Añadiste «' + def.label + '».');
  }
  function catOf(ci) { return S.cur.menu.categories[ci]; }
  function addCat() {
    const c = { id: uid('cat'), name: 'Nueva categoría', icon: '', note: '', items: [] };
    S.cur.menu.categories.push(c); S.openCat = c.id; edited(); renderEditor();
  }
  function addItem(ci) {
    const c = catOf(ci); if (!c) return;
    c.items.push({ id: uid('it'), name: 'Nuevo plato', desc: '', price: 0, emoji: '', img: '', tags: [], on: true });
    edited(); renderEditor(); openItemSheet(ci, c.items.length - 1);
  }
  function copyMonday() {
    const H = S.cur.brand.hours, mon = H.filter(function (h) { return h.d === 1; })[0]; if (!mon) return;
    H.forEach(function (h) { if (h !== mon) { h.open = mon.open; h.close = mon.close; h.closed = mon.closed; } });
    edited(); renderEditor(); toast('Copié el horario del lunes a toda la semana.');
  }
  function ensureHours() {
    const H = S.cur.brand.hours = Array.isArray(S.cur.brand.hours) ? S.cur.brand.hours : [];
    DAYS.forEach(function (d) { if (!H.some(function (h) { return h.d === d[0]; })) H.push({ d: d[0], open: '08:00', close: '18:00', closed: true }); });
  }

  /* ---------- Campos ---------- */
  function fid(path) { return 'f-' + path.replace(/[^\w]/g, '-'); }
  function bilingual() { return !!(S.cur.i18n && S.cur.i18n.bilingual); }
  function inputCtl(f, path, val, id) {
    const ph = f.ph ? ' placeholder="' + attr(f.ph) + '"' : '';
    if (f.t === 'area') return '<textarea class="in" id="' + id + '" rows="' + (f.rows || 3) + '" data-p="' + attr(path) + '"' + ph + '>' + esc(val || '') + '</textarea>';
    return '<input class="in" id="' + id + '" type="text" data-p="' + attr(path) + '" value="' + attr(val || '') + '"' + ph + ' autocomplete="off">';
  }
  function fieldHTML(f, base) {
    if (f.t === 'hint') return '<p class="hint">' + esc(f.text) + '</p>';
    if (f.t === 'sep') return '<h4 class="sep">' + esc(f.label) + '</h4>';
    const path = base + '.' + f.k, id = fid(path);
    let val = getPath(S.cur, path);
    let ctl = '';
    switch (f.t) {
      case 'text': case 'area': ctl = inputCtl(f, path, val, id); break;
      case 'num':
        ctl = '<div class="numrow"><input class="in num" id="' + id + '" type="number" inputmode="numeric" data-p="' + attr(path) + '" data-type="num" value="' + attr(val == null ? '' : val) + '"' +
          (f.min != null ? ' min="' + f.min + '"' : '') + (f.max != null ? ' max="' + f.max + '"' : '') + ' step="' + (f.step || 1) + '">' +
          (f.money ? '<output class="money" data-money="' + attr(path) + '">' + esc(money(val)) + '</output>' : '') + '</div>';
        break;
      case 'img': return imgFieldHTML(f, path, base);
      case 'seg': {
        /* Botones de opción. Sin valor guardado se marca `def`. */
        const cur = (val == null || val === '') ? f.def : val;
        return '<div class="fld"><span class="lab">' + esc(f.label) + '</span><div class="seg" role="group" aria-label="' + attr(f.label) + '">' + f.opts.map(function (o) {
          const on = String(cur) === String(o[0]);
          return '<button type="button" class="' + (on ? 'on' : '') + '" data-a="set" data-p="' + attr(path) + '" data-v="' + attr(o[0]) + '" aria-pressed="' + on + '">' + esc(o[1]) + '</button>';
        }).join('') + '</div>' + (f.help ? '<p class="help">' + esc(f.help) + '</p>' : '') + '</div>';
      }
      case 'range': {
        const v = (val == null || val === '') ? (f.def != null ? f.def : (f.min || 0)) : (+val || 0);
        return '<div class="fld"><label class="lab" for="' + id + '">' + esc(f.label) + ' · <output data-out="' + attr(path) + '">' + v + (f.unit ? ' ' + esc(f.unit) : '') + '</output></label>' +
          '<input type="range" id="' + id + '" min="' + (f.min || 0) + '" max="' + f.max + '" step="' + (f.step || 1) + '" value="' + v + '" data-p="' + attr(path) + '" data-type="num"' + (f.unit ? ' data-unit="' + attr(f.unit) + '"' : '') + '>' +
          (f.help ? '<p class="help">' + esc(f.help) + '</p>' : '') + '</div>';
      }
      case 'sel':
        if (val == null && f.def != null) val = f.def;
        ctl = '<select class="in" id="' + id + '" data-p="' + attr(path) + '"' + (f.rerender ? ' data-rr="1"' : '') + '>' + f.opts.map(function (o) {
          return '<option value="' + attr(o[0]) + '"' + (String(val) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
        }).join('') + '</select>';
        break;
      case 'tag':
        ctl = '<select class="in" id="' + id + '" data-p="' + attr(path) + '">' + TAGS.map(function (o) { return '<option value="' + o[0] + '"' + (val === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>';
        break;
      case 'cat':
        ctl = '<select class="in" id="' + id + '" data-p="' + attr(path) + '"><option value="">Toda la carta</option>' + S.cur.menu.categories.map(function (c) {
          return '<option value="' + attr(c.id) + '"' + (val === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>';
        }).join('') + '</select>';
        break;
      case 'time': ctl = '<input class="in" id="' + id + '" type="time" data-p="' + attr(path) + '" value="' + attr(val || '') + '">'; break;
      case 'date': ctl = '<input class="in" id="' + id + '" type="date" data-p="' + attr(path) + '" value="' + attr(val || '') + '">'; break;
      case 'checks': {
        const v = Array.isArray(val) ? val : [];
        return '<div class="fld"><span class="lab">' + esc(f.label) + '</span><div class="tagpick" role="group" aria-label="' + attr(f.label) + '">' + f.opts.map(function (o) {
          const on = v.indexOf(o[0]) >= 0;
          return '<button type="button" class="tg' + (on ? ' on' : '') + '" data-a="chk" data-p="' + attr(path) + '" data-v="' + attr(o[0]) + '" aria-pressed="' + on + '">' + esc(o[1]) + '</button>';
        }).join('') + '</div></div>';
      }
      case 'bool':
        if (val == null) val = !!f.def;
        return '<label class="row-sw" for="' + id + '"><span>' + esc(f.label) + '</span><input type="checkbox" class="sw" id="' + id + '" data-p="' + attr(path) + '" data-type="bool"' + (val ? ' checked' : '') + '></label>';
      case 'days': {
        const v = (val || []).map(Number);
        ctl = '<div class="days" role="group" aria-label="' + attr(f.label) + '">' + DAYS.map(function (d) {
          const on = v.indexOf(d[0]) >= 0;
          return '<button type="button" class="day' + (on ? ' on' : '') + '" data-a="day" data-p="' + attr(path) + '" data-d="' + d[0] + '" aria-pressed="' + on + '" title="' + d[2] + '">' + d[1] + '</button>';
        }).join('') + '</div>';
        return '<div class="fld"><span class="lab">' + esc(f.label) + '</span>' + ctl + '</div>';
      }
      case 'list': return listHTML(f, Array.isArray(val) ? val : [], path);
      case 'icon': return icoFieldHTML({ p: path, em: f.emoji ? base + '.' + f.emoji : '', fb: f.fb || '', label: f.label, always: !!f.always });
      case 'thumbs': {
        /* Opciones con miniatura dibujada en los colores de la app (por ahora, la decoración de la portada). */
        const cur = (val == null || val === '') ? (f.def || '') : val, art = artStyle();
        return '<div class="fld"><span class="lab">' + esc(f.label) + '</span><div class="dths" role="group" aria-label="' + attr(f.label) + '">' + f.opts.map(function (o) {
          const on = String(cur) === String(o[0]);
          return '<button type="button" class="dth' + (on ? ' on' : '') + '" data-a="set" data-p="' + attr(path) + '" data-v="' + attr(o[0]) + '" aria-pressed="' + on + '">' +
            '<span class="dth-a" aria-hidden="true" style="' + attr(art) + '">' + thumbArt(f.art, o[0]) + '</span><span class="dth-n">' + esc(o[1]) + '</span></button>';
        }).join('') + '</div>' + (f.help ? '<p class="help">' + esc(f.help) + '</p>' : '') + '</div>';
      }
      default: ctl = '';
    }
    let html = '<div class="fld"><label class="lab" for="' + id + '">' + esc(f.label) + '</label>' + ctl + (f.help ? '<p class="help">' + esc(f.help) + '</p>' : '') + '</div>';
    if (f.i18n && bilingual() && (f.t === 'text' || f.t === 'area')) {
      const p2 = path + '_en', id2 = fid(p2);
      html += '<div class="fld en"><label class="lab" for="' + id2 + '">' + esc(f.label) + ' <b>EN</b></label>' + inputCtl({ t: f.t, rows: f.rows, ph: 'English' }, p2, getPath(S.cur, p2), id2) + '</div>';
    }
    return html;
  }
  /* ---------- Miniaturas de decoración ---------- */
  /* Colores de la app para pintar las miniaturas (los mismos que usa el motor). */
  function artStyle() {
    const c = S.cur.theme.colors || {}, hx = function (v, d) { return /^#[0-9a-f]{6}$/i.test(String(v || '')) ? v : d; };
    const x = { bg: hx(c.bg, '#ffffff'), surface: hx(c.surface, '#ffffff'), ink: hx(c.ink, '#111111'), accent: hx(c.accent, '#888888'), accent2: hx(c.accent2, '#888888'), accent3: hx(c.accent3, '#888888') };
    return '--bg:' + x.bg + ';--surface:' + x.surface + ';--ink:' + x.ink + ';--accent:' + x.accent + ';--accent2:' + x.accent2 + ';--accent3:' + x.accent3 + ';' + META.artVars(x);
  }
  function thumbArt(kind, v) {
    if (kind !== 'heroDeco') return '';
    if (v === 'ninguna') return '<span class="dth-none">Sin decoración</span>';
    if (v === 'auto') {
      const a = META.heroAuto[S.cur.theme.skin] || {};
      if (a.deco) return META.heroDeco(a.deco);
      if (a.logo) return '<span class="dth-mono">' + esc(String(S.cur.brand.name || 'B').charAt(0)) + '</span>';
      return '<span class="dth-none">La estética no trae</span>';
    }
    return META.heroDeco(v);
  }
  /* El CSS de las decoraciones viene del motor; aquí se limita a las miniaturas. */
  function decoStyles() {
    if (document.getElementById('deco-css')) return;
    const st = document.createElement('style'); st.id = 'deco-css';
    st.textContent = String(META.decoCSS).replace(/(^|\})\s*([^{}@]+)\{/g, function (m, a, sel) { return a + sel.split(',').map(function (x) { return '.dth-a ' + x.trim(); }).join(',') + '{'; });
    document.head.appendChild(st);
  }

  /* ---------- Marca: forma del logo e ícono de la app ---------- */
  function logoShapeHTML(lt) {
    const opts = [['auto', 'Según la estética'], ['circulo', 'Círculo'], ['cuadrado', 'Cuadrado']].concat(lt === 'img' ? [['horizontal', 'Horizontal']] : []);
    return fieldHTML({ k: 'logo.shape', t: 'seg', label: 'Forma del logo', def: 'auto', opts: opts, help: lt === 'img' ? 'Horizontal: para logos anchos con el nombre escrito. Se muestran completos y reemplazan el nombre en el encabezado.' : '' }, 'brand');
  }
  const ICON_BG = [['accent', 'Acento'], ['accent2', 'Acento 2'], ['accent3', 'Acento 3'], ['ink', 'Texto'], ['surface', 'Tarjetas'], ['bg', 'Fondo']];
  /* Ícono de la app: fondo de la paleta y el logo, las iniciales o un ícono de línea. */
  function appIconSpec(c) {
    const ai = c.brand.appIcon || {}, col = c.theme.colors || {}, l = c.brand.logo || {};
    const ok = function (v) { return /^#[0-9a-f]{6}$/i.test(String(v || '')); };
    const acc = ok(col.accent) ? col.accent : '#333333', bg = ok(col[ai.bg]) ? col[ai.bg] : acc;
    const fg = ai.bg && ai.bg !== 'accent' && contrast(acc, bg) >= 3 ? acc : onColor(bg);
    let kind = 'text', value = initials(c.brand.name);
    if (ai.content === 'icono') { if (META.icons[ai.icon]) { kind = 'icon'; value = ai.icon; } }
    else if (ai.content !== 'iniciales') {
      if (l.type === 'icon' && META.icons[l.value]) { kind = 'icon'; value = l.value; }
      else if (l.type === 'img' && l.value) { kind = 'img'; value = l.value; }
      else if ((l.type === 'emoji' || l.type === 'mono') && l.value) { kind = l.type === 'emoji' ? 'emoji' : 'text'; value = String(l.value).slice(0, 3); }
    }
    return { bg: bg, fg: fg, kind: kind, value: value, wide: l.shape === 'horizontal' };
  }
  function iconSVGMarkup(key, color, size) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"' + (size ? ' width="' + size + '" height="' + size + '"' : '') + ' fill="none" stroke="' + color + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + (META.icons[key] || '') + '</svg>';
  }
  /* Vista del ícono en el estudio (con la foto del logo, como queda en el celular). */
  function appIconPreview(c) {
    const sp = appIconSpec(c);
    const inner = sp.kind === 'icon' ? iconSVGMarkup(sp.value, sp.fg, 0)
      : sp.kind === 'img' ? '<img src="' + attr(imgSrc(sp.value)) + '" alt=""' + (sp.wide ? ' class="wide"' : '') + '>'
      : '<b style="font-size:' + (sp.kind === 'emoji' ? 34 : String(sp.value).length > 2 ? 22 : 28) + 'px">' + esc(sp.value) + '</b>';
    return '<span class="appi-ic" style="background:' + attr(sp.bg) + ';color:' + attr(sp.fg) + '">' + inner + '</span>';
  }
  function appIconCard() {
    const ai = S.cur.brand.appIcon || {}, col = S.cur.theme.colors || {}, cur = ai.bg || 'accent';
    return '<section class="card"><div class="card-h"><h2>Ícono de la app</h2><p>El que se ve en la pantalla del celular al instalar la app y en la pestaña del navegador.</p></div>' +
      '<div class="appi" aria-hidden="true">' + appIconPreview(S.cur) + '<span>' + esc(String(S.cur.brand.name || '').slice(0, 14)) + '</span></div>' +
      fieldHTML({ k: 'appIcon.content', t: 'seg', label: 'Dibujo', def: 'logo', opts: [['logo', 'El logo'], ['iniciales', 'Iniciales'], ['icono', 'Un ícono']] }, 'brand') +
      (ai.content === 'icono' ? fieldHTML({ k: 'appIcon.icon', t: 'icon', label: 'Ícono', always: true }, 'brand') : '') +
      '<div class="fld"><span class="lab">Fondo</span><div class="swpick" role="group" aria-label="Fondo del ícono">' + ICON_BG.map(function (o) {
        const on = cur === o[0];
        return '<button type="button" class="' + (on ? 'on' : '') + '" data-a="set" data-p="brand.appIcon.bg" data-v="' + o[0] + '" aria-pressed="' + on + '"><i style="background:' + attr(col[o[0]] || '#888888') + '"></i>' + o[1] + '</button>';
      }).join('') + '</div></div></section>';
  }

  /* ---------- Fotos ---------- */
  const POS_OPTS = [['top', 'Arriba'], ['center', 'Centro'], ['bottom', 'Abajo']];
  function posClass(v) { return v === 'top' ? ' class="op-t"' : v === 'bottom' ? ' class="op-b"' : ''; }
  /* Campo de foto: enlace https, foto de la biblioteca o foto incrustada, con su encuadre. Se puede volver a
     pintar en su sitio (repaintImg) porque guarda su definición en atributos. */
  function imgFieldHTML(f, path, base) {
    const v = String(getPath(S.cur, path) || ''), isData = /^data:image\//.test(v), isAsset = isAssetRef(v), id = fid(path), has = !!v;
    const posP = base + '.' + f.k + 'Pos', pos = getPath(S.cur, posP);
    let h = '<div class="fld imgf" data-imgf="' + attr(path) + '" data-base="' + attr(base) + '" data-k="' + attr(f.k) + '" data-label="' + attr(f.label) + '" data-max="' + (+f.max || 1100) + '" data-help="' + attr(f.help || '') + '">';
    if (isData || isAsset) {
      h += '<span class="lab">' + esc(f.label) + '</span><div class="img-row"><img src="' + attr(imgSrc(v)) + '" alt="Foto actual" width="96" height="64"' + posClass(pos) + '>' +
        '<span class="help">' + (isAsset ? 'Foto de la biblioteca' : 'Foto subida · ' + Math.round(v.length * 0.75 / 1024) + ' KB') + '</span>' +
        '<button type="button" class="btn sm" data-a="img-clear" data-ip="' + attr(path) + '">Quitar</button></div>';
    } else h += '<label class="lab" for="' + id + '">' + esc(f.label) + '</label>' + inputCtl({ t: 'text', ph: 'https://…' }, path, v, id);
    h += '<div class="img-acts"><label class="btn sm filebtn img-up">' + (isData || isAsset ? 'Cambiar foto' : 'Subir foto') + '<input type="file" accept="image/*" data-a="img-file" data-ip="' + attr(path) + '" data-max="' + (+f.max || 1100) + '" hidden></label>' +
      (LIB.cap && LIB.index.length ? '<button type="button" class="btn sm" data-a="lib-pick" data-ip="' + attr(path) + '">Elegir de la biblioteca</button>' : '') + '</div>';
    if (has) h += fieldHTML({ k: f.k + 'Pos', t: 'seg', label: 'Encuadre', def: 'center', opts: POS_OPTS }, base);
    return h + (f.help ? '<p class="help">' + esc(f.help) + '</p>' : '') + '</div>';
  }
  function repaintImg(path) {
    const bs = document.querySelectorAll('.imgf');
    for (let i = 0; i < bs.length; i++) {
      const b = bs[i]; if (b.getAttribute('data-imgf') !== path) continue;
      b.outerHTML = imgFieldHTML({ k: b.getAttribute('data-k'), label: b.getAttribute('data-label'), max: +b.getAttribute('data-max'), help: b.getAttribute('data-help') }, path, b.getAttribute('data-base'));
    }
  }
  function photoChanged(path) { edited(); renderEditor(); repaintImg(path); }

  /* ---------- Íconos ---------- */
  function iconMode() { const m = S.cur && S.cur.theme.icons; return m === 'linea' || m === 'ninguno' ? m : 'emoji'; }
  /* Lo mismo que muestra la app para un emoji y un ícono elegido (HTML seguro hecho por el motor). */
  function glyphHTML(emoji, key, fb) { return META.glyph(iconMode(), emoji, key, fb); }
  function icoSVG(k) { return META.glyph('linea', '', k, ''); }
  function icoName(k) { return ICON_NAMES[k] || k; }
  function delPath(o, p) {
    const ks = p.split('.'), last = ks.pop(), parent = ks.length ? getPath(o, ks.join('.')) : o;
    if (parent && typeof parent === 'object') delete parent[last];
  }
  /* Campo de ícono: muestra lo que se verá y abre la cuadrícula con los íconos del motor.
     o = { p: ruta del ícono, em: ruta del emoji del mismo elemento, fb: ícono de respaldo, label }. */
  function icoFieldHTML(o) {
    const key = String(getPath(S.cur, o.p) || ''), own = META.icons[key] ? key : '';
    const em = o.em ? String(getPath(S.cur, o.em) || '') : '';
    const auto = META.iconOf(em) || (em ? (o.fb || 'cubiertos') : o.fb);
    const name = own ? icoName(own) : 'Automático' + (auto ? ' · ' + icoName(auto) : '');
    const k = own || auto, id = fid(o.p), mode = iconMode();
    const help = o.always ? '' : mode === 'ninguno' ? 'La app está en «Sin íconos» (Estilo › Íconos).'
      : mode === 'emoji' ? 'La app muestra emojis: este ícono se ve si no hay emoji o si eliges íconos de línea en Estilo.'
      : (own ? '' : 'En automático se usa el ícono que corresponde al emoji.');
    return '<div class="fld icof" data-icof="' + attr(o.p) + '" data-em="' + attr(o.em || '') + '" data-fb="' + attr(o.fb || '') + '" data-label="' + attr(o.label) + '"' + (o.always ? ' data-always="1"' : '') + '>' +
      '<span class="lab" id="' + id + '-l">' + esc(o.label) + '</span>' +
      '<button type="button" class="icob" id="' + id + '" data-a="ico-open" data-p="' + attr(o.p) + '" aria-expanded="false" aria-labelledby="' + id + '-l ' + id + '-v">' +
      '<span class="icov" aria-hidden="true">' + (k ? icoSVG(k) : '—') + '</span><span id="' + id + '-v">' + esc(name) + '</span><span class="icoc" aria-hidden="true"></span></button>' +
      (help ? '<p class="help">' + esc(help) + '</p>' : '') + '</div>';
  }
  function icoGridHTML(p) {
    const cur = String(getPath(S.cur, p) || '');
    return '<div class="icog" role="group" aria-label="Elegir ícono">' +
      '<button type="button" class="tg' + (cur ? '' : ' on') + '" data-a="ico-pick" data-p="' + attr(p) + '" data-v="" aria-pressed="' + !cur + '">Automático</button>' +
      META.iconSets.map(function (g) {
        return '<div class="icos"><h5 class="lab">' + esc(g[0]) + '</h5><div class="icol">' + g[1].map(function (k) {
          const on = k === cur;
          return '<button type="button" data-a="ico-pick" data-p="' + attr(p) + '" data-v="' + k + '" aria-pressed="' + on + '" aria-label="' + attr(icoName(k)) + '" title="' + attr(icoName(k)) + '">' + icoSVG(k) + '</button>';
        }).join('') + '</div></div>';
      }).join('') + '</div>';
  }
  /* Vuelve a pintar los campos de ícono de una ruta o del emoji que los acompaña. */
  function repaintIco(path) {
    const bs = document.querySelectorAll('.icof');
    for (let i = 0; i < bs.length; i++) {
      const b = bs[i];
      if (b.getAttribute('data-icof') !== path && b.getAttribute('data-em') !== path) continue;
      b.outerHTML = icoFieldHTML({ p: b.getAttribute('data-icof'), em: b.getAttribute('data-em'), fb: b.getAttribute('data-fb'), label: b.getAttribute('data-label'), always: b.hasAttribute('data-always') });
    }
  }
  function listHTML(f, arr, path) {
    return '<div class="fld list"><div class="list-h"><span class="lab">' + esc(f.label) + '</span><span class="cnt">' + arr.length + '</span></div>' +
      (arr.length ? '<ol class="litems">' + arr.map(function (it, i) {
        return '<li class="li"><div class="li-h"><span class="li-n">' + esc(f.item) + ' ' + (i + 1) + '</span><div class="ctl">' +
          '<button type="button" class="ib" data-a="li-mv" data-p="' + attr(path) + '" data-i="' + i + '" data-d="-1" aria-label="Subir"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
          '<button type="button" class="ib" data-a="li-mv" data-p="' + attr(path) + '" data-i="' + i + '" data-d="1" aria-label="Bajar"' + (i === arr.length - 1 ? ' disabled' : '') + '>↓</button>' +
          '<button type="button" class="ib danger" data-a="li-del" data-p="' + attr(path) + '" data-i="' + i + '" aria-label="Eliminar">×</button></div></div>' +
          f.fields.map(function (sf) { return fieldHTML(sf, path + '.' + i); }).join('') + '</li>';
      }).join('') + '</ol>' : '') +
      '<button type="button" class="btn sm" data-a="li-add" data-p="' + attr(path) + '" data-blank="' + attr(JSON.stringify(f.blank || {})) + '">+ ' + esc(f.item) + '</button></div>';
  }

  /* ---------- Paneles ---------- */
  function tplBanner() {
    if (S.kind !== 'tpl') return '';
    const dirty = S.tpl[S.cur.id] && S.tpl[S.cur.id].dirty;
    return '<div class="banner"><div><b>' + (dirty ? 'Tienes cambios sin guardar en esta plantilla.' : 'Estás viendo la plantilla «' + esc(S.cur.brand.name) + '».') + '</b>' +
      '<p>Edítala para probar. Para conservar los cambios, guárdala como una app tuya.</p></div>' +
      '<button class="btn pri" data-a="save-as"' + (storeReady() ? '' : ' disabled') + '>' + (storeReady() ? 'Guardar como mi app' : 'Conectando…') + '</button></div>';
  }
  /* Colores de la app para pintar las muestras de textura (solo hexadecimales válidos). */
  function texVars() {
    const c = S.cur.theme.colors || {}, hx = function (v, d) { return /^#[0-9a-f]{6}$/i.test(String(v || '')) ? v : d; };
    return '--tb:' + hx(c.bg, '#ffffff') + ';--ti:' + hx(c.ink, '#111111') + ';--ta:' + hx(c.accent, '#888888') + ';--ta2:' + hx(c.accent2, '#888888') + ';--ta3:' + hx(c.accent3, '#888888');
  }
  function swatches(colors) { return ['bg', 'surface', 'accent', 'accent2', 'accent3'].map(function (k) { return '<i style="background:' + attr(colors[k]) + '"></i>'; }).join(''); }
  function contrastHTML() {
    const c = S.cur.theme.colors, out = [];
    const r1 = contrast(c.ink, c.bg), r2 = contrast(c.ink, c.surface), r3 = contrast(c.muted, c.bg);
    if (r1 < 4.5) out.push('Texto sobre fondo: ' + r1.toFixed(1).replace('.', ',') + ':1');
    if (r2 < 4.5) out.push('Texto sobre tarjetas: ' + r2.toFixed(1).replace('.', ',') + ':1');
    if (r3 < 3) out.push('Texto suave sobre fondo: ' + r3.toFixed(1).replace('.', ',') + ':1');
    if (!out.length) return '<p class="okline">Buen contraste: el texto se lee bien sobre el fondo y las tarjetas.</p>';
    return '<p class="warnline"><b>Poco contraste.</b> ' + esc(out.join(' · ')) + '. Lo recomendable es 4,5:1 o más.</p>';
  }
  /* Contraste de los colores por elemento que son texto (títulos, antetítulos y precios). */
  function roleHexOf(v, c) { return /^#[0-9a-f]{6}$/i.test(String(v || '')) ? v : (v && v !== 'auto' && /^#[0-9a-f]{6}$/i.test(String(c[v] || '')) ? c[v] : ''); }
  function roleWarnings(cfg) {
    const R = cfg.theme.roles || {}, c = cfg.theme.colors || {}, out = [];
    [['title', 'Títulos'], ['kicker', 'Antetítulos'], ['price', 'Precios']].forEach(function (r) {
      const h = roleHexOf(R[r[0]], c); if (!h) return;
      const x = contrast(h, c.bg); if (x < 3) out.push(r[1] + ' sobre el fondo: ' + x.toFixed(1).replace('.', ',') + ':1');
      if (r[0] === 'price') { const y = contrast(h, c.surface); if (y < 3) out.push('Precios sobre las tarjetas: ' + y.toFixed(1).replace('.', ',') + ':1'); }
    });
    return out;
  }
  function roleContrastHTML() {
    const w = roleWarnings(S.cur);
    return w.length ? '<p class="warnline"><b>Poco contraste.</b> ' + esc(w.join(' · ')) + '. Para títulos y precios, lo recomendable es 3:1 o más.</p>' : '';
  }
  /* ---------- Estilo: se arma desde el esquema STYLE del catálogo ---------- */
  function skinDefaults() { return (SKINS[S.cur.theme.skin] || SKINS.elegante).defaults; }
  /* Valor por defecto que declara el esquema para cada ruta (el resto arranca vacío o en «auto»). */
  const STYLE_DEF = {};
  STYLE.forEach(function (g) { g.cards.forEach(function (c) { (c.fields || []).forEach(function (f) { if (f.k && f.def != null) STYLE_DEF[f.k] = f.def; }); }); });
  function sameVal(a, b) {
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const ka = Object.keys(a), kb = Object.keys(b);
      return ka.length === kb.length && ka.every(function (k) { return sameVal(a[k], b[k]); });
    }
    return String(a == null ? '' : a).toLowerCase() === String(b == null ? '' : b).toLowerCase();
  }
  /* ¿La ruta de theme está como la trae la estética? */
  function isDefaultAt(p) {
    const v = getPath(S.cur.theme, p), d = getPath(skinDefaults(), p);
    if (d !== undefined) return sameVal(v, d);
    if (v && typeof v === 'object') return Object.keys(v).every(function (k) { return isDefaultAt(p + '.' + k); });
    return v == null || v === '' || v === 'auto' || (STYLE_DEF[p] != null && String(STYLE_DEF[p]) === String(v));
  }
  function cardKeys(c) { return c.keys || (c.fields || []).map(function (f) { return f.k; }).filter(Boolean); }
  function cardChanged(c) { return cardKeys(c).some(function (k) { return !isDefaultAt(k); }); }
  function themeChanged() {
    return Object.keys(Object.assign({}, skinDefaults(), S.cur.theme)).some(function (k) { return k !== 'skin' && !isDefaultAt(k); });
  }
  function findCard(id) {
    let out = null;
    STYLE.forEach(function (g) { g.cards.forEach(function (c) { if (c.id === id) out = c; }); });
    return out;
  }
  function resetKeys(keys) {
    const th = S.cur.theme, d = skinDefaults();
    keys.forEach(function (k) {
      const dv = getPath(d, k);
      if (dv !== undefined) { setPath(th, k, clone(dv)); return; }
      const ks = k.split('.'), last = ks.pop(), parent = ks.length ? getPath(th, ks.join('.')) : th;
      if (parent && typeof parent === 'object') delete parent[last];
    });
  }
  /* Muestra u oculta los botones «Restablecer» sin volver a pintar el editor (para no cortar un deslizador a medio mover). */
  function syncResets() {
    STYLE.forEach(function (g) { g.cards.forEach(function (c) {
      const bs = document.querySelectorAll('[data-a="style-reset"]');
      for (let i = 0; i < bs.length; i++) if (bs[i].getAttribute('data-card') === c.id) bs[i].hidden = !cardChanged(c);
    }); });
    const foot = $('#style-foot'); if (foot) foot.hidden = !themeChanged();
  }
  function fontSel(k, label, list) {
    const cur = S.cur.theme.fonts[k], id = fid('theme.fonts.' + k);
    const opts = list.indexOf(cur) < 0 && cur ? [cur].concat(list) : list;
    return '<div class="fld"><label class="lab" for="' + id + '">' + label + '</label><select class="in" id="' + id + '" data-p="theme.fonts.' + k + '">' + opts.map(function (f) {
      return '<option' + (f === cur ? ' selected' : '') + '>' + esc(f) + '</option>';
    }).join('') + '</select></div>';
  }
  /* Tarjetas con dibujo propio. */
  const STYLE_CARDS = {
    skins: function () {
      const th = S.cur.theme;
      return '<div class="skins">' + Object.keys(SKINS).map(function (k) {
        const on = th.skin === k;
        return '<button type="button" class="skin" data-a="skin" data-s="' + k + '" aria-pressed="' + on + '"><span class="skin-art sk-' + k + '" aria-hidden="true">' + esc(SKINS[k].art || SKINS[k].label) + '</span><span class="skin-t"><span class="skin-n">' + SKINS[k].label + (on ? ' <em>· actual</em>' : '') + '</span><span class="skin-d">' + esc(SKINS[k].desc) + '</span></span></button>';
      }).join('') + '</div>';
    },
    colors: function () {
      const th = S.cur.theme, sk = SKINS[th.skin] || SKINS.elegante;
      return '<div class="pals">' + sk.palettes.map(function (p, i) { return '<button type="button" class="pal" data-a="pal" data-i="' + i + '"><span class="sws">' + swatches(p.colors) + '</span>' + esc(p.name) + '</button>'; }).join('') + '</div>' +
        '<div class="colors">' + COLOR_KEYS.map(function (ck) {
          const v = String(th.colors[ck[0]] || '#000000').toUpperCase(), id = 'c-' + ck[0];
          return '<div class="crow"><input type="color" id="' + id + '" value="' + attr(v.toLowerCase()) + '" data-p="theme.colors.' + ck[0] + '" data-type="color" data-pair="h-' + ck[0] + '" aria-label="' + ck[1] + '"><label for="h-' + ck[0] + '">' + ck[1] + '</label>' +
            '<input class="in hex" id="h-' + ck[0] + '" value="' + attr(v) + '" maxlength="7" spellcheck="false" autocomplete="off" data-p="theme.colors.' + ck[0] + '" data-type="color" data-pair="' + id + '"></div>';
        }).join('') + '</div><div id="contrast">' + contrastHTML() + '</div>';
    },
    fonts: function () { return '<div class="grid2">' + fontSel('display', 'Títulos', DISPLAY_FONTS) + fontSel('body', 'Texto', BODY_FONTS) + '</div>'; },
    photos: function () {
      if (!LIB.ready) return '<p class="help">Conectando con la biblioteca de fotos…</p>';
      if (!LIB.cap) return '<p class="help">La biblioteca funciona en claude.ai para quien puede editar el estudio. Mientras tanto, cada foto subida se guarda dentro de la app y pesa unos 100 KB.</p>';
      const emb = embeddedPhotos(S.cur), n = unusedAssets().length;
      return '<p class="help" data-lib-meter>' + esc(libMeter()) + '</p>' + libGrid('') +
        (emb.length ? '<p class="warnline">Esta app tiene ' + emb.length + (emb.length === 1 ? ' foto guardada' : ' fotos guardadas') + ' dentro de ella. Pásalas a la biblioteca para que la app pese menos.</p>' : '') +
        '<div class="lib-acts">' + (emb.length ? '<button type="button" class="btn sm pri" data-a="lib-move">Pasar a la biblioteca</button>' : '') +
        '<button type="button" class="btn sm" data-a="lib-clean"' + (n ? '' : ' disabled') + '>' + (n ? 'Borrar fotos sin usar (' + n + ')' : 'No hay fotos sin usar') + '</button></div>';
    },
    bgapp: function () {
      const b = S.cur.theme.bg || {}, t = b.type === 'degradado' || b.type === 'foto' ? b.type : 'liso', col = S.cur.theme.colors || {};
      let h = fieldHTML({ k: 'bg.type', t: 'seg', label: 'Tipo', def: 'liso', opts: [['liso', 'Liso'], ['degradado', 'Degradado'], ['foto', 'Foto con velo']] }, 'theme');
      if (t === 'degradado') {
        const cur = b.tint === 'accent2' || b.tint === 'accent3' ? b.tint : 'accent';
        h += '<div class="fld"><span class="lab">Hacia el color</span><div class="swpick" role="group" aria-label="Color del degradado">' + [['accent', 'Acento'], ['accent2', 'Acento 2'], ['accent3', 'Acento 3']].map(function (o) {
          const on = cur === o[0];
          return '<button type="button" class="' + (on ? 'on' : '') + '" data-a="set" data-p="theme.bg.tint" data-v="' + o[0] + '" aria-pressed="' + on + '"><i style="background:' + attr(col[o[0]] || '#888888') + '"></i>' + o[1] + '</button>';
        }).join('') + '</div></div>';
      }
      if (t === 'foto') h += fieldHTML({ k: 'bg.img', t: 'img', label: 'Foto de fondo', max: 1400 }, 'theme') +
        fieldHTML({ k: 'bg.veil', t: 'seg', label: 'Velo', def: '80', opts: [['40', 'Suave'], ['60', 'Medio'], ['80', 'Fuerte']], help: 'Con velo fuerte el texto se lee mejor. La foto queda quieta detrás al desplazar.' }, 'theme');
      return h;
    },
    roles: function () {
      const R = S.cur.theme.roles || {}, col = S.cur.theme.colors || {};
      return '<div class="roles">' + ROLES.map(function (r) {
        const v = R[r[0]] || 'auto', custom = /^#[0-9a-f]{6}$/i.test(v), p = 'theme.roles.' + r[0];
        return '<div class="fld role"><span class="lab" id="rl-' + r[0] + '">' + esc(r[1]) + '</span><div class="rolepick" role="group" aria-labelledby="rl-' + r[0] + '">' +
          '<button type="button" class="ra' + (v === 'auto' ? ' on' : '') + '" data-a="set" data-p="' + p + '" data-v="auto" aria-pressed="' + (v === 'auto') + '">Auto</button>' +
          ROLE_SWATCHES.map(function (k) {
            const on = v === k[0];
            return '<button type="button" class="' + (on ? 'on' : '') + '" data-a="set" data-p="' + p + '" data-v="' + k[0] + '" aria-pressed="' + on + '" title="' + k[1] + '" aria-label="' + k[1] + '"><i data-sw="' + k[0] + '" style="background:' + attr(col[k[0]] || '#888888') + '"></i></button>';
          }).join('') +
          '<label class="rc' + (custom ? ' on' : '') + '" title="Otro color"><input type="color" value="' + attr(custom ? v.toLowerCase() : '#888888') + '" data-p="' + p + '" data-type="color" aria-label="Otro color para ' + attr(r[1].toLowerCase()) + '"></label>' +
          '</div></div>';
      }).join('') + '</div><div id="role-contrast">' + roleContrastHTML() + '</div>';
    },
    icons: function () {
      const mode = iconMode(), sample = [['☕', 'Café'], ['🥐', 'Croissant'], ['🍲', 'Sancocho'], ['🐟', 'Trucha'], ['🍰', 'Torta'], ['🍺', 'Cerveza']];
      return '<div class="icosample" aria-hidden="true" style="' + attr(texVars()) + '">' + sample.map(function (x) {
        return '<span>' + (META.glyph(mode, x[0], '', '') || '<em>' + x[1].charAt(0) + '</em>') + '</span>';
      }).join('') + '</div>';
    },
    textures: function () {
      const th = S.cur.theme;
      return '<div class="texs" role="group" aria-label="Detalle de fondo" style="' + attr(texVars()) + '">' + TEXTURES.map(function (t) {
        const on = (th.texture || 'none') === t[0];
        return '<button type="button" class="tex" data-a="tex" data-v="' + t[0] + '" aria-pressed="' + on + '"><span class="tex-sw tx-' + t[0] + '" aria-hidden="true"></span>' + esc(t[1]) + '</button>';
      }).join('') + '</div>';
    }
  };
  function styleCard(c) {
    const sk = SKINS[S.cur.theme.skin] || SKINS.elegante;
    const desc = c.card === 'colors' ? 'Paletas sugeridas para la estética ' + sk.label.toLowerCase() + ', o ajusta cada color.' : c.desc;
    const fields = (c.fields || []).filter(function (f) { return S.adv || !f.adv; }).map(function (f) { return fieldHTML(f, 'theme'); }).join('');
    return '<section class="card" data-card="' + attr(c.id) + '"><div class="card-h"><div class="card-t"><h2>' + esc(c.title) + '</h2>' +
      (cardKeys(c).length ? '<button type="button" class="btn sm" data-a="style-reset" data-card="' + attr(c.id) + '"' + (cardChanged(c) ? '' : ' hidden') + '>Restablecer</button>' : '') + '</div>' +
      (desc ? '<p>' + esc(desc) + '</p>' : '') + '</div>' +
      (c.card ? STYLE_CARDS[c.card](c) : '') + fields + '</section>';
  }
  const PANELS = {
    vista: function () { return ''; },
    estilo: function () {
      const sk = SKINS[S.cur.theme.skin] || SKINS.elegante;
      const groups = STYLE.map(function (g) { return { id: g.id, label: g.label, cards: g.cards.filter(function (c) { return S.adv || !c.adv; }) }; })
        .filter(function (g) { return g.cards.length; });
      const head = '<div class="st-head"><div class="adv-t"><b id="adv-l">Opciones avanzadas</b><small>' + (S.adv ? 'Ves todos los ajustes de diseño, por secciones.' : 'Actívalas para ver todos los ajustes de diseño.') + '</small></div>' +
        '<button type="button" class="swb" role="switch" aria-checked="' + S.adv + '" aria-labelledby="adv-l" data-a="adv"></button></div>';
      const foot = '<div class="st-foot" id="style-foot"' + (themeChanged() ? '' : ' hidden') + '><p>Esta app tiene ajustes de diseño propios.</p>' +
        '<button type="button" class="btn sm" data-a="style-reset-all">Volver a la estética ' + esc(sk.label.toLowerCase()) + '</button></div>';
      if (!S.adv) return tplBanner() + head + groups.map(function (g) { return g.cards.map(styleCard).join(''); }).join('') + foot;
      if (!groups.some(function (g) { return g.id === S.sub; })) S.sub = groups[0].id;
      const cur = groups.filter(function (g) { return g.id === S.sub; })[0];
      return tplBanner() + head + '<div class="subnav" role="tablist" aria-label="Secciones de estilo">' + groups.map(function (g) {
        return '<button type="button" role="tab" data-a="sub" data-g="' + g.id + '" aria-selected="' + (g.id === S.sub) + '">' + esc(g.label) + '</button>';
      }).join('') + '</div>' + cur.cards.map(styleCard).join('') + foot;
    },
    modulos: function () {
      const ms = S.cur.modules, on = ms.filter(function (m) { return m.on !== false; }).length;
      return tplBanner() + '<section class="ticket"><div class="tk-h"><div><p class="tk-k">Comanda · ' + esc(S.cur.brand.name || 'App') + '</p><h2>Módulos</h2><p class="tk-s">' + on + ' activos de ' + ms.length + '. El orden de esta lista es el orden en la app.</p></div>' +
        '<button class="btn pri" data-a="mod-add">Añadir módulo</button></div><ol class="mods">' + ms.map(modRow).join('') + '</ol></section>';
    },
    carta: function () {
      const cats = S.cur.menu.categories, n = cats.reduce(function (a, c) { return a + c.items.length; }, 0);
      const noPrice = cats.reduce(function (a, c) { return a + c.items.filter(function (i) { return !(+i.price > 0); }).length; }, 0);
      return tplBanner() + '<section class="card"><div class="card-h row"><div><h2>Carta</h2><p>' + cats.length + ' categorías · ' + n + ' platos' + (noPrice ? ' · <span class="warntxt">' + noPrice + ' sin precio</span>' : '') + '</p></div>' +
        '<button class="btn pri" data-a="cat-add">Nueva categoría</button></div>' +
        (cats.length ? '<div class="cats">' + cats.map(catHTML).join('') + '</div>' : '<p class="empty">La carta está vacía. Crea la primera categoría para empezar a agregar platos.</p>') +
        '<p class="help">Toca un plato para editar nombre, precio, foto y etiquetas. El diseño de la carta (lista, tarjetas, cuadrícula, fotos grandes o compacta) se cambia en Módulos › Carta.</p></section>';
    },
    datos: function () {
      ensureHours();
      const b = S.cur.brand, lt = (b.logo && b.logo.type) || 'mono', lv = String((b.logo && b.logo.value) || '');
      const fields = BRAND_FIELDS.map(function (f) {
        if (f.k === 'logo.value') {
          if (lt === 'img') {
            const isData = /^data:image\//.test(lv), isAsset = isAssetRef(lv);
            return (isData || isAsset ? '<div class="fld"><span class="lab">Imagen del logo</span><div class="logo-row"><img src="' + attr(imgSrc(lv)) + '" alt="Logo actual" width="56" height="56"' + posClass(b.logo.imgPos) + '><span class="help">' + (isAsset ? 'Imagen de la biblioteca' : 'Imagen subida · ' + Math.round(lv.length * 0.75 / 1024) + ' KB') + '</span><button type="button" class="btn sm" data-a="logo-clear">Quitar</button></div></div>'
              : fieldHTML({ k: 'logo.value', t: 'text', label: 'Enlace https de la imagen', ph: 'https://…' }, 'brand')) +
              '<div class="img-acts"><label class="btn sm filebtn">Subir imagen<input type="file" accept="image/*" data-a="logo-file" hidden></label>' +
              (LIB.cap && LIB.index.length ? '<button type="button" class="btn sm" data-a="lib-pick" data-ip="brand.logo.value">Elegir de la biblioteca</button>' : '') + '</div>' +
              (lv && b.logo.shape !== 'horizontal' ? fieldHTML({ k: 'logo.imgPos', t: 'seg', label: 'Encuadre', def: 'center', opts: POS_OPTS }, 'brand') : '') + logoShapeHTML(lt);
          }
          if (lt === 'icon') return fieldHTML({ k: 'logo.value', t: 'icon', label: 'Ícono del logo', always: true }, 'brand') + logoShapeHTML(lt);
          return fieldHTML({ k: 'logo.value', t: 'text', label: lt === 'emoji' ? 'Emoji del logo' : 'Iniciales (vacío = las del nombre)', ph: lt === 'emoji' ? '☕' : 'CZ' }, 'brand') +
            (lt === 'emoji' ? fieldHTML({ k: 'logo.ico', t: 'icon', label: 'Ícono del logo', emoji: 'logo.value' }, 'brand') : '') + logoShapeHTML(lt);
        }
        return fieldHTML(f, 'brand');
      }).join('');
      const H = b.hours;
      const rows = DAYS.map(function (d) {
        const i = H.findIndex(function (h) { return h.d === d[0]; }), h = H[i], base = 'brand.hours.' + i;
        return '<div class="hr' + (h.closed ? ' closed' : '') + '"><span class="hd">' + d[2] + '</span><input type="checkbox" class="sw" id="' + fid(base + '.closed') + '" data-p="' + base + '.closed" data-type="boolinv"' + (h.closed ? '' : ' checked') + ' aria-label="' + d[2] + ' abierto">' +
          '<input class="in" type="time" aria-label="' + d[2] + ' abre" data-p="' + base + '.open" value="' + attr(h.open || '') + '"' + (h.closed ? ' disabled' : '') + '>' +
          '<input class="in" type="time" aria-label="' + d[2] + ' cierra" data-p="' + base + '.close" value="' + attr(h.close || '') + '"' + (h.closed ? ' disabled' : '') + '></div>';
      }).join('');
      return tplBanner() + '<section class="card"><div class="card-h"><h2>Datos del local</h2><p>Lo que la app muestra en la portada, la ubicación y el contacto.</p></div>' + fields + '</section>' + appIconCard() +
        '<section class="card"><div class="card-h row"><div><h2>Horario</h2><p>Hora de Colombia. La app dice sola si está abierto, aunque el celular del turista tenga otra zona horaria.</p></div><button class="btn sm" data-a="hours-copy">Copiar lunes a todos</button></div>' +
        '<div class="hours-e"><div class="hr hh" aria-hidden="true"><span>Día</span><span>Abre</span><span>Desde</span><span>Hasta</span></div>' + rows + '</div></section>' +
        '<section class="card"><div class="card-h"><h2>Idioma y trato</h2></div>' +
        fieldHTML({ k: 'bilingual', t: 'bool', label: 'Carta en español e inglés (para turistas)' }, 'i18n') +
        fieldHTML({ k: 'usted', t: 'bool', label: 'Tratar al cliente de «usted»' }, 'i18n') +
        '<p class="help">Con inglés activo aparece un segundo campo para cada texto y la app abre en inglés si el celular está en inglés. Los pedidos siempre le llegan al local en español.</p></section>' +
        '<section class="card"><div class="card-h"><h2>Firma</h2></div>' + fieldHTML({ k: 'credit', t: 'bool', label: 'Mostrar «Hecho con Break» al final de la app', def: true }, 'meta') + '</section>';
    },
    publicar: function () {
      const cs = checks(S.cur), warns = cs.filter(function (c) { return c.s === 'warn'; }).length;
      const url = (S.cur.meta && S.cur.meta.url) || '';
      return tplBanner() +
        '<section class="card"><div class="card-h"><h2>Revisión</h2><p>' + (warns ? warns + (warns === 1 ? ' punto por revisar' : ' puntos por revisar') + ' antes de entregar la app.' : 'Todo listo para publicar.') + '</p></div><ul class="checks">' +
        cs.map(function (c) {
          return '<li class="ck ' + c.s + '"><span class="pill">' + (c.s === 'ok' ? 'Listo' : c.s === 'warn' ? 'Revisar' : 'Nota') + '</span><div><b>' + esc(c.t) + '</b>' + (c.d ? '<p>' + esc(c.d) + '</p>' : '') + '</div>' +
            (c.go ? '<button class="btn sm" data-a="tab" data-t="' + c.go + '">Ir</button>' : '<span></span>') + '</li>';
        }).join('') + '</ul></section>' +
        '<section class="card"><div class="card-h"><h2>Exportar</h2><p>Cada app es un solo archivo con el motor de Break y esta configuración adentro.</p></div><div class="exps">' +
        '<div class="exp"><div><h3>Paquete para Cloudflare Pages</h3><p>index.html, manifiesto, service worker e íconos. Se instala en el celular y abre sin señal.</p></div><button class="btn pri" data-a="exp-zip">Descargar .zip</button></div>' +
        '<div class="exp"><div><h3>Archivo único .html</h3><p>Para abrirlo directo o subirlo a cualquier hosting.</p></div><div class="btnrow"><button class="btn" data-a="exp-html">Descargar .html</button><button class="btn ghost" data-a="copy-html">Copiar código</button></div></div>' +
        '<div class="exp"><div><h3>Configuración .json</h3><p>Respaldo de esta app para guardarlo o importarlo después.</p></div><div class="btnrow"><button class="btn" data-a="exp-json">Descargar .json</button><label class="btn ghost filebtn">Importar .json<input type="file" accept=".json,application/json" data-a="imp-json" hidden></label></div></div>' +
        '</div><ol class="deploy"><li>Descarga el .zip.</li><li>En Cloudflare, abre Workers &amp; Pages, crea un proyecto de Pages con la opción de subir archivos y arrastra el .zip.</li><li>Copia la dirección que te da (termina en .pages.dev) y pégala abajo para generar el QR.</li></ol></section>' +
        '<section class="card"><div class="card-h"><h2>Al compartir y al abrir</h2><p>Así se ve el enlace en WhatsApp o Facebook. La imagen va en el .zip; pega abajo la dirección publicada y vuelve a descargarlo para que la usen.</p></div>' +
        '<div class="ogp"><img id="og-prev" alt="Imagen para compartir" width="600" height="315" hidden><p class="qr-empty" id="og-empty">Preparando la imagen…</p></div>' +
        fieldHTML({ k: 'splash', t: 'bool', label: 'Pantalla de carga con el logo al abrir la app', def: true }, 'brand') + '</section>' +
        '<section class="card"><div class="card-h"><h2>QR para las mesas</h2><p>Pega la dirección pública de la app; el QR queda listo para imprimir.</p></div><div class="qr">' +
        fieldHTML({ k: 'url', t: 'text', label: 'Dirección de la app publicada', ph: 'https://' + slug(S.cur.brand.name) + '.pages.dev' }, 'meta') +
        '<div class="qr-box"><canvas id="qr-cv" width="600" height="760" aria-label="Código QR de la app"' + (url ? '' : ' hidden') + '></canvas><p class="qr-empty"' + (url ? ' hidden' : '') + '>El QR aparece aquí cuando pegas la dirección.</p></div>' +
        '<button class="btn pri" data-a="exp-qr" id="qr-btn"' + (/^https?:\/\/\S+$/i.test(url) ? '' : ' disabled') + '>Descargar QR (.png)</button></div></section>';
    }
  };
  function summary(m) {
    const s = m.s || {}, c = S.cur;
    const tagName = function (t) { return (TAGS.filter(function (x) { return x[0] === t; })[0] || [0, t])[1]; };
    const dshort = function (days) { const v = (days || []).map(Number); return DAYS.filter(function (d) { return v.indexOf(d[0]) >= 0; }).map(function (d) { return d[1]; }).join(' ') || 'sin días'; };
    switch (m.type) {
      case 'hero': return ([s.cta1, s.cta2].filter(function (x) { return x && x !== 'none'; }).map(function (x) { return (CTA_OPTS.filter(function (o) { return o[0] === x; })[0] || [0, x])[1]; }).join(' · ') || 'Sin botones') + (s.img ? ' · con foto' : '');
      case 'carta': { const n = c.menu.categories.reduce(function (a, k) { return a + k.items.length; }, 0); return c.menu.categories.length + ' categorías · ' + n + ' platos · ' + ({ lista: 'lista', tarjetas: 'tarjetas', cuadricula: 'cuadrícula', fotos: 'fotos grandes', compacta: 'compacta' }[s.layout] || 'lista'); }
      case 'destacados': return 'Etiqueta «' + tagName(s.tag) + '» · hasta ' + (s.max || 4);
      case 'promos': return (s.items || []).length + ' promos por día';
      case 'menudia': return (s.price ? money(s.price) + ' · ' : '') + dshort(s.days);
      case 'pedido': return ['mesa', 'llevar', 'domicilio'].filter(function (k) { return !s.modes || s.modes[k] !== false; }).join(', ') + (String(c.brand.whatsapp || '').replace(/\D/g, '').length >= 11 ? '' : ' · falta WhatsApp');
      case 'reservas': { const n = String(s.slots || '').split(',').filter(function (x) { return x.trim(); }).length; return (n ? n + ' horarios' : 'Hora libre') + ' · hasta ' + (s.maxPeople || 10) + ' personas'; }
      case 'sellos': return (s.goal || 8) + ' sellos · ' + (s.pin ? 'código listo' : 'sin código');
      case 'ruleta': return s.mode === 'premios' ? (s.options || []).length + ' premios' : 'Platos de la carta';
      case 'trivia': return (s.questions || []).length + ' preguntas';
      case 'resenas': return c.brand.reviewUrl ? 'Enlace de Google listo' : 'Falta enlace de Google';
      case 'glosario': return (s.items || []).length + ' palabras';
      case 'historia': return s.year ? 'Desde ' + s.year : 'Sin año';
      case 'eventos': return (s.items || []).length + ' eventos';
      case 'wifi': return s.network || 'Sin red';
      case 'horario': return (c.brand.hours || []).filter(function (h) { return !h.closed; }).length + ' días abiertos';
      case 'ubicacion': return c.brand.address || 'Sin dirección';
      case 'contacto': return String(c.brand.whatsapp || '').replace(/\D/g, '').length >= 11 ? 'WhatsApp listo' : 'Falta WhatsApp';
      case 'libre': return s.style === 'destacado' ? 'Destacado' : 'Normal';
      case 'aviso': return !s.until ? 'Sin fecha de vencimiento' : (s.until < todayISO() ? 'Venció el ' : 'Hasta el ') + fmtDay(s.until);
      case 'galeria': return (s.items || []).length + ((s.items || []).length === 1 ? ' foto' : ' fotos') + ' · ' + (s.layout === 'mosaico' ? 'mosaico' : 'carrusel');
      case 'servicios': { const n = (s.list || []).length + String(s.extra || '').split(',').filter(function (x) { return x.trim(); }).length; return n + (n === 1 ? ' servicio' : ' servicios'); }
      case 'faq': return (s.items || []).length + ((s.items || []).length === 1 ? ' pregunta' : ' preguntas');
      default: return '';
    }
  }
  function modRow(m, i) {
    const def = MODULES[m.type] || { label: m.type, code: '··', fields: [] };
    const open = S.openMod === m.id, total = S.cur.modules.length;
    const title = (m.s && m.s.title) || def.label;
    return '<li class="mod' + (open ? ' open' : '') + (m.on === false ? ' off' : '') + '" data-mid="' + attr(m.id) + '"><div class="mod-r">' +
      '<span class="code" aria-hidden="true">' + def.code + '</span>' +
      '<button type="button" class="mod-n" data-a="mod-open" data-mid="' + attr(m.id) + '" aria-expanded="' + open + '"><b data-title-for="' + i + '">' + esc(title) + '</b><small>' + (title !== def.label ? esc(def.label) + ' · ' : '') + esc(summary(m)) + '</small></button>' +
      '<div class="ctl"><button type="button" class="ib" data-a="mod-mv" data-mid="' + attr(m.id) + '" data-d="-1" aria-label="Subir ' + attr(def.label) + '"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
      '<button type="button" class="ib" data-a="mod-mv" data-mid="' + attr(m.id) + '" data-d="1" aria-label="Bajar ' + attr(def.label) + '"' + (i === total - 1 ? ' disabled' : '') + '>↓</button>' +
      '<input type="checkbox" class="sw" data-p="modules.' + i + '.on" data-type="bool"' + (m.on !== false ? ' checked' : '') + ' aria-label="Mostrar ' + attr(def.label) + '"></div></div>' +
      (open ? '<div class="mod-b">' + (def.desc ? '<p class="help">' + esc(def.desc) + '</p>' : '') + def.fields.map(function (f) { return fieldHTML(f, 'modules.' + i + '.s'); }).join('') +
        '<div class="mod-f"><button type="button" class="btn sm" data-a="mod-focus" data-mid="' + attr(m.id) + '">Ver en la app</button>' +
        (def.single ? '' : '<button type="button" class="btn sm" data-a="mod-dup" data-mid="' + attr(m.id) + '">Duplicar</button>') +
        '<button type="button" class="btn sm danger" data-a="mod-del" data-mid="' + attr(m.id) + '">Quitar</button></div></div>' : '') + '</li>';
  }
  function catHTML(c, ci) {
    const open = S.openCat === c.id, last = S.cur.menu.categories.length - 1, bi = bilingual();
    return '<div class="cat-e' + (open ? ' open' : '') + '"><div class="cat-r"><button type="button" class="cat-n" data-a="cat-open" data-cid="' + attr(c.id) + '" aria-expanded="' + open + '">' +
      '<span class="ci" aria-hidden="true">' + (glyphHTML(c.icon, c.ico) || '·') + '</span><b data-cat-label="' + ci + '">' + esc(c.name || 'Sin nombre') + '</b><small>' + c.items.length + (c.items.length === 1 ? ' plato' : ' platos') + '</small></button>' +
      '<div class="ctl"><button type="button" class="ib" data-a="cat-mv" data-ci="' + ci + '" data-d="-1" aria-label="Subir categoría"' + (ci === 0 ? ' disabled' : '') + '>↑</button>' +
      '<button type="button" class="ib" data-a="cat-mv" data-ci="' + ci + '" data-d="1" aria-label="Bajar categoría"' + (ci === last ? ' disabled' : '') + '>↓</button></div></div>' +
      (open ? '<div class="cat-b"><div class="grid2">' + fieldHTML({ k: 'name', t: 'text', label: 'Nombre de la categoría', i18n: true }, 'menu.categories.' + ci) + fieldHTML({ k: 'icon', t: 'text', label: 'Emoji', ph: '🍲' }, 'menu.categories.' + ci) + '</div>' +
        fieldHTML({ k: 'ico', t: 'icon', label: 'Ícono', emoji: 'icon' }, 'menu.categories.' + ci) +
        fieldHTML({ k: 'img', t: 'img', label: 'Foto de la categoría (opcional)', max: 1100, help: 'Sale como franja arriba del título de la categoría.' }, 'menu.categories.' + ci) +
        fieldHTML({ k: 'note', t: 'text', label: 'Nota', i18n: true, ph: 'Hasta las 11:00 a. m.' }, 'menu.categories.' + ci) +
        '<ul class="items-e">' + c.items.map(function (it, ii) {
          return '<li class="ir' + (it.on === false ? ' off' : '') + '"><button type="button" class="ir-m" data-a="item-edit" data-ci="' + ci + '" data-ii="' + ii + '"><span class="ir-e" aria-hidden="true">' + (glyphHTML(it.emoji, it.ico) || '·') + '</span>' +
            '<span class="ir-n">' + esc(it.name || 'Sin nombre') + (bi && !String(it.name_en || '').trim() ? '<em class="miss">sin EN</em>' : '') + (it.on === false ? '<em class="miss">agotado</em>' : '') + '</span>' +
            '<span class="ir-p">' + (+it.price > 0 ? esc(money(it.price)) : '<em class="miss">sin precio</em>') + '</span></button>' +
            '<div class="ctl"><button type="button" class="ib" data-a="item-mv" data-ci="' + ci + '" data-ii="' + ii + '" data-d="-1" aria-label="Subir plato"' + (ii === 0 ? ' disabled' : '') + '>↑</button>' +
            '<button type="button" class="ib" data-a="item-mv" data-ci="' + ci + '" data-ii="' + ii + '" data-d="1" aria-label="Bajar plato"' + (ii === c.items.length - 1 ? ' disabled' : '') + '>↓</button></div></li>';
        }).join('') + '</ul><div class="cat-f"><button type="button" class="btn sm pri" data-a="item-add" data-ci="' + ci + '">+ Plato</button><button type="button" class="btn sm danger" data-a="cat-del" data-ci="' + ci + '">Eliminar categoría</button></div></div>' : '') + '</div>';
  }
  function checks(c) {
    const out = [];
    const mod = function (t) { return c.modules.filter(function (m) { return m && m.on !== false && m.type === t; })[0]; };
    const items = []; c.menu.categories.forEach(function (cat) { cat.items.forEach(function (it) { items.push(it); }); });
    const wa = String(c.brand.whatsapp || '').replace(/\D/g, '');
    const ev = mod('eventos');
    const usesWa = !!(mod('pedido') || mod('reservas') || (ev && (ev.s.items || []).some(function (e) { return e && e.rsvp; })));
    if (wa.length >= 11 && wa.length <= 13) out.push({ s: 'ok', t: 'WhatsApp listo', d: '+' + wa });
    else out.push({ s: usesWa ? 'warn' : 'info', t: wa ? 'Revisa el número de WhatsApp' : 'Falta el número de WhatsApp', d: usesWa ? 'Sin él, los pedidos y reservas no le llegan al local. Formato: 573001234567.' : 'Los botones de WhatsApp muestran el mensaje, pero no lo pueden enviar.', go: 'datos' });
    if (!mod('carta')) out.push({ s: 'warn', t: 'La app no muestra la carta', d: 'Activa el módulo Carta.', go: 'modulos' });
    const noPrice = items.filter(function (i) { return !(+i.price > 0); }).length;
    out.push(noPrice ? { s: 'warn', t: noPrice + (noPrice === 1 ? ' plato sin precio' : ' platos sin precio'), go: 'carta' } : { s: 'ok', t: items.length + ' platos con precio' });
    const rw = roleWarnings(c);
    if (rw.length) out.push({ s: 'warn', t: 'Poco contraste en los colores por elemento', d: rw.join(' · ') + '.', go: 'estilo' });
    const libN = hasLibPhotos(c);
    if (libN && LIB.ready && !LIB.cap) out.push({ s: 'warn', t: libN === 1 ? 'Una foto de la biblioteca no está disponible' : libN + ' fotos de la biblioteca no están disponibles', d: 'Para exportar la app con sus fotos, ábrela desde claude.ai con permiso para editar el estudio.' });
    if (c.i18n && c.i18n.bilingual) {
      const miss = items.filter(function (i) { return !String(i.name_en || '').trim(); }).length;
      out.push(miss ? { s: 'warn', t: miss + (miss === 1 ? ' plato sin nombre en inglés' : ' platos sin nombre en inglés'), go: 'carta' } : { s: 'ok', t: 'Carta traducida al inglés' });
    }
    const open = (c.brand.hours || []).filter(function (h) { return !h.closed && h.open && h.close; }).length;
    out.push(open ? { s: 'ok', t: 'Abre ' + open + (open === 1 ? ' día' : ' días') + ' a la semana' } : { s: 'warn', t: 'Sin horario', d: 'La app no puede decir si el local está abierto.', go: 'datos' });
    if (mod('ubicacion') && !c.brand.address && !c.brand.mapsQuery) out.push({ s: 'warn', t: 'Falta la dirección', go: 'datos' });
    if (mod('resenas')) out.push(/^https?:\/\//.test(c.brand.reviewUrl || '') ? { s: 'ok', t: 'Enlace de reseñas de Google listo' } : { s: 'warn', t: 'Falta el enlace de reseñas de Google', d: 'En el Perfil de Empresa de Google, usa la opción para pedir reseñas y copia el enlace.', go: 'datos' });
    const se = mod('sellos');
    if (se) { const pin = String(se.s.pin || ''); out.push(/^\d{4,6}$/.test(pin) && !/^(\d)\1+$/.test(pin) && ['1234', '12345', '123456'].indexOf(pin) < 0 ? { s: 'ok', t: 'Código de la tarjeta de sellos listo' } : { s: 'warn', t: 'Pon un código a la tarjeta de sellos', d: 'De 4 a 6 dígitos que no sean fáciles de adivinar.', go: 'modulos' }); }
    const wf = mod('wifi');
    if (wf && !wf.s.password) out.push({ s: 'warn', t: 'Falta la clave del Wi-Fi', go: 'modulos' });
    const ru = mod('ruleta');
    if (ru && ru.s.mode === 'premios' && (ru.s.options || []).filter(function (o) { return o && o.label; }).length < 2) out.push({ s: 'warn', t: 'La ruleta necesita al menos dos premios', go: 'modulos' });
    c.modules.forEach(function (m) {
      if (m && m.on !== false && m.type === 'aviso' && /^\d{4}-\d{2}-\d{2}$/.test(m.s.until || '') && m.s.until < todayISO()) out.push({ s: 'warn', t: 'El aviso «' + String(m.s.text || '').slice(0, 40) + '» ya venció', d: 'Cambia la fecha o apaga el módulo.', go: 'modulos' });
    });
    const kb = Math.round(JSON.stringify(c).length / 1024);
    if (kb > 200) out.push({ s: 'warn', t: 'La app pesa ' + kb + ' KB', d: 'Para guardarla en tu cuenta debe pesar menos de 234 KB. Usa enlaces https para las fotos o sube menos.', go: 'modulos' });
    return out;
  }

  /* ---------- Render ---------- */
  function saveInfo() {
    if (S.kind === 'tpl') { const dirty = S.tpl[S.cur.id] && S.tpl[S.cur.id].dirty; return dirty ? ['warn', 'Sin guardar'] : ['hide', 'Plantilla']; }
    if (Store.kind === 'down') return ['bad', 'Sin conexión'];
    if (S.save === 'saving') return ['busy', 'Guardando…'];
    if (S.save === 'error') return ['bad', 'No se guardó'];
    if (Store.kind === 'local') return ['ok', 'Guardado aquí'];
    if (Store.kind === 'memory') return ['warn', 'Sin guardado'];
    return ['ok', 'Guardado'];
  }
  function updateSaveChip() {
    const el = $('#save'); if (!el) return;
    const s = saveInfo();
    el.className = 'save ' + s[0]; el.lastChild.textContent = s[1]; el.title = s[1];
  }
  function renderHeader() {
    const c = S.cur, s = saveInfo();
    $('#sb').innerHTML = '<span class="wm">break<i>studio</i></span>' +
      '<button type="button" class="appsw" data-a="drawer" aria-haspopup="dialog" aria-label="Cambiar de app. Actual: ' + attr(c.brand.name || 'Sin nombre') + '"><span class="dot" style="background:' + attr(c.theme.colors.accent) + ';border-color:' + attr(c.theme.colors.bg) + '"></span><span class="nm">' + esc(c.brand.name || 'Sin nombre') + '</span><span class="knd">' + (S.kind === 'tpl' ? 'Plantilla' : 'Mi app') + '</span><span class="chev" aria-hidden="true"></span></button>' +
      '<span class="save ' + s[0] + '" id="save" title="' + attr(s[1]) + '" role="status"><i aria-hidden="true"></i>' + esc(s[1]) + '</span>';
  }
  const TABS = [['vista', 'Vista'], ['estilo', 'Estilo'], ['modulos', 'Módulos'], ['carta', 'Carta'], ['datos', 'Datos'], ['publicar', 'Publicar']];
  function renderTabs() {
    const warns = checks(S.cur).filter(function (c) { return c.s === 'warn'; }).length;
    $('#tabs').innerHTML = TABS.map(function (t) {
      return '<button type="button" class="tab" role="tab" data-a="tab" data-t="' + t[0] + '" aria-selected="' + (S.tab === t[0]) + '">' + t[1] + (t[0] === 'publicar' && warns ? '<span class="n">' + warns + '</span>' : '') + '</button>';
    }).join('');
  }
  function renderEditor() {
    const ed = $('#editor'), act = document.activeElement;
    const keep = act && act.id && ed.contains(act) ? act.id : null;
    ed.innerHTML = (PANELS[S.tab] || PANELS.estilo)();
    if (keep) { const el = document.getElementById(keep); if (el) { try { el.focus({ preventScroll: true }); } catch (e) { /* nada */ } } }
    if (S.tab === 'publicar') { drawQR(); ogPreview(); }
  }
  function renderStageTop() {
    const bi = bilingual();
    $('#stageTop').innerHTML = '<div class="st-row"><span class="st-k">Vista en vivo</span><div class="st-tools">' +
      (bi ? '<div class="seg sm" role="group" aria-label="Idioma de la vista previa"><button type="button" class="' + (S.pvLang === 'es' ? 'on' : '') + '" data-a="pv-lang" data-v="es">ES</button><button type="button" class="' + (S.pvLang === 'en' ? 'on' : '') + '" data-a="pv-lang" data-v="en">EN</button></div>' : '') +
      '<button type="button" class="ib" data-a="pv-reset" aria-label="Reiniciar la vista previa" title="Vaciar carrito y reiniciar juegos">↺</button>' +
      '<button type="button" class="ib" data-a="pv-full" aria-label="' + (S.full ? 'Salir de pantalla completa' : 'Ver en pantalla completa') + '" title="Mostrarle la app a un cliente">' + (S.full ? '×' : '⤢') + '</button></div></div>' +
      '<div class="tpls" role="group" aria-label="Apps de ejemplo">' +
      (S.kind === 'app' ? '<button type="button" class="tpl on" data-a="drawer"><span class="tpl-sw" style="background:' + attr(S.cur.theme.colors.bg) + ';box-shadow:inset 0 0 0 5px ' + attr(S.cur.theme.colors.accent) + '"></span><span><b>' + esc(S.cur.brand.name) + '</b><small>Mi app</small></span></button>' : '') +
      TEMPLATES.map(function (t) {
        const on = S.kind === 'tpl' && S.cur.id === t.id;
        return '<button type="button" class="tpl' + (on ? ' on' : '') + '" data-a="open-tpl" data-id="' + t.id + '" aria-pressed="' + on + '"><span class="tpl-sw" style="background:' + t.theme.colors.bg + ';box-shadow:inset 0 0 0 5px ' + t.theme.colors.accent + '"></span><span><b>' + esc(t.brand.name) + '</b><small>' + SKINS[t.theme.skin].label + '</small></span></button>';
      }).join('') + '</div>';
  }
  function renderChrome() {
    renderHeader(); renderStageTop();
    const b = document.querySelector('.banner [data-a="save-as"]');
    if (b) { b.disabled = !storeReady(); b.textContent = storeReady() ? 'Guardar como mi app' : 'Conectando…'; }
    if (S.sheetKind === 'drawer') openDrawer(true);
  }
  function renderAll() {
    if (DESKTOP.matches && S.tab === 'vista') S.tab = 'estilo';
    $('#studio').setAttribute('data-tab', S.tab);
    renderHeader(); renderTabs(); renderEditor(); renderStageTop();
  }
  function setTab(t) {
    if (!PANELS[t]) return;
    S.tab = t; closeSheet();
    $('#studio').setAttribute('data-tab', t);
    renderTabs(); renderEditor();
    try { window.scrollTo({ top: 0 }); } catch (e) { /* nada */ }
  }

  /* ---------- Hojas ---------- */
  function openSheet(html, kind, onClose) {
    if ($('#sheet').hidden) S.opener = document.activeElement;
    $('#sheetC').innerHTML = html;
    $('#sheet').hidden = false; $('#sheetBg').hidden = false;
    document.body.classList.add('noscroll');
    S.sheetKind = kind || ''; S.sheetOnClose = onClose || null;
    const first = $('#sheet').querySelector('[data-autofocus]') || $('#sheet').querySelector('.x');
    if (first) { try { first.focus({ preventScroll: true }); } catch (e) { /* nada */ } }
  }
  function closeSheet() {
    if ($('#sheet').hidden) return;
    $('#sheet').hidden = true; $('#sheetBg').hidden = true;
    if (!S.full) document.body.classList.remove('noscroll');
    const cb = S.sheetOnClose, hadEdit = !!S.edit;
    S.sheetOnClose = null; S.sheetKind = ''; S.confirmFn = null; S.edit = null;
    if (cb) cb(); else if (hadEdit) { renderEditor(); renderTabs(); }
    if (S.opener && document.body.contains(S.opener)) { try { S.opener.focus({ preventScroll: true }); } catch (e) { /* nada */ } }
    S.opener = null;
  }
  function sheetHead(title) { return '<div class="sh-h"><h3>' + esc(title) + '</h3><button type="button" class="x" data-a="sheet-close" aria-label="Cerrar">×</button></div>'; }
  function confirmBox(title, text, yes, fn) {
    S.confirmFn = fn;
    openSheet(sheetHead(title) + '<p class="cf-t">' + esc(text) + '</p><div class="sh-foot"><button type="button" class="btn" data-a="sheet-close">Cancelar</button><button type="button" class="btn danger-fill" data-a="confirm-yes">' + esc(yes) + '</button></div>', 'confirm');
  }
  function openDrawer(refresh) {
    if (refresh && S.sheetKind !== 'drawer') return;
    const mine = S.store === 'loading' ? '<p class="empty">Buscando tus apps guardadas…</p>' :
      (S.apps.length ? '<ul class="alist">' + S.apps.map(function (a) {
        const on = S.kind === 'app' && S.cur.id === a.id, sk = SKINS[a.theme.skin] || SKINS.elegante;
        return '<li class="arow' + (on ? ' on' : '') + '"><span class="asw" style="background:' + attr(a.theme.colors.bg) + ';--a:' + attr(a.theme.colors.accent) + '"></span><div class="ameta"><b>' + esc(a.brand.name || 'Sin nombre') + '</b><small>' + sk.label + ' · ' + esc(ago(a.updated)) + '</small></div>' +
          '<div class="aact">' + (on ? '<span class="pill-on">Abierta</span>' : '<button type="button" class="btn sm pri" data-a="open-app" data-id="' + attr(a.id) + '">Abrir</button>') +
          '<button type="button" class="ib" data-a="dup-app" data-id="' + attr(a.id) + '" aria-label="Duplicar ' + attr(a.brand.name) + '" title="Duplicar">⧉</button><button type="button" class="ib danger" data-a="del-app" data-id="' + attr(a.id) + '" aria-label="Eliminar ' + attr(a.brand.name) + '" title="Eliminar">×</button></div></li>';
      }).join('') + '</ul>' : '<p class="empty">Todavía no tienes apps guardadas. Crea una nueva o guarda una plantilla como tuya.</p>');
    const note = S.storeNote ? '<p class="warnline">' + esc(S.storeNote) + '</p>' :
      (Store.kind === 'db' ? '<p class="help">Tus apps se guardan en tu cuenta de Claude y solo tú las ves.</p>' : Store.kind === 'local' ? '<p class="help">Tus apps se guardan solo en este navegador. Exporta el .json de cada una como respaldo.</p>' : '');
    openSheet(sheetHead('Tus apps') +
      '<div class="dr-top"><button type="button" class="btn pri" data-a="new-app"' + (storeReady() ? '' : ' disabled') + '>Nueva app</button><label class="btn filebtn">Importar .json<input type="file" accept=".json,application/json" data-a="imp-json" hidden></label></div>' +
      '<h4 class="sep">Mis apps</h4>' + mine + note +
      '<h4 class="sep">Apps de ejemplo</h4><ul class="alist">' + TEMPLATES.map(function (t) {
        const on = S.kind === 'tpl' && S.cur.id === t.id;
        const mods = t.modules.map(function (m) { return MODULES[m.type] ? MODULES[m.type].label : m.type; });
        return '<li class="arow' + (on ? ' on' : '') + '"><span class="asw" style="background:' + t.theme.colors.bg + ';--a:' + t.theme.colors.accent + '"></span><div class="ameta"><b>' + esc(t.brand.name) + '</b><small>' + SKINS[t.theme.skin].label + ' · ' + mods.length + ' módulos</small></div>' +
          '<div class="aact">' + (on ? '<span class="pill-on">Abierta</span>' : '<button type="button" class="btn sm" data-a="open-tpl" data-id="' + t.id + '">Abrir</button>') + '</div></li>';
      }).join('') + '</ul>', 'drawer');
  }
  function openNewApp() {
    const starts = TEMPLATES.map(function (t) {
      const blurb = { 'tpl-araucaria': 'Elegante · reservas y menú degustación', 'tpl-antojo': 'Animada · pedidos, sellos y ruleta', 'tpl-zocalo': 'Cultural · bilingüe, glosario y trivia',
        'tpl-espiga': 'Natural · panadería con domicilios, encargos y sellos', 'tpl-neblina': 'Minimalista · café de especialidad con foto de portada y catas',
        'tpl-alisos': 'Natural · campestre bilingüe con reservas y servicios', 'tpl-esquina': 'Nocturna · comida rápida hasta tarde con ruleta de premios' }[t.id] || '';
      return '<button type="button" class="start" data-a="create-app" data-from="' + t.id + '"><span class="sws">' + swatches(t.theme.colors) + '</span><b>Como ' + esc(t.brand.name) + '</b><span>' + esc(blurb) + '</span></button>';
    }).join('') + '<button type="button" class="start" data-a="create-app" data-from="blank"><span class="sws">' + swatches(blankApp('').theme.colors) + '</span><b>Vacía</b><span>Portada, carta, horario, ubicación y contacto</span></button>';
    openSheet(sheetHead('Nueva app') + '<div class="fld"><label class="lab" for="na-name">Nombre del local</label><input class="in" id="na-name" type="text" placeholder="Panadería La Espiga" autocomplete="off" data-autofocus></div>' +
      '<div class="fld"><span class="lab">Empezar desde</span><div class="starts">' + starts + '</div><p class="help">Copia la carta y los módulos del ejemplo para que solo cambies lo necesario.</p></div>', 'new');
  }
  function openCatalog() {
    const has = function (t) { return S.cur.modules.some(function (m) { return m.type === t; }); };
    openSheet(sheetHead('Añadir módulo') + GROUPS.map(function (g) {
      const list = Object.keys(MODULES).filter(function (k) { return MODULES[k].group === g; });
      return '<div class="cat-g"><h4 class="sep">' + g + '</h4><div class="mcat">' + list.map(function (k) {
        const d = MODULES[k], dis = d.single && has(k);
        return '<button type="button" class="mc" data-a="mod-new" data-type="' + k + '"' + (dis ? ' disabled' : '') + '><span class="code">' + d.code + '</span><span><b>' + esc(d.label) + (d.seg ? '<span class="seg-b ' + d.seg.toLowerCase() + '">' + d.seg + '</span>' : '') + '</b><p>' + esc(dis ? 'Ya está en la app.' : d.desc) + '</p></span></button>';
      }).join('') + '</div></div>';
    }).join(''), 'catalog');
  }
  function openItemSheet(ci, ii) {
    const c = catOf(ci), it = c && c.items[ii]; if (!it) return;
    it.tags = Array.isArray(it.tags) ? it.tags : [];
    S.edit = { ci: ci, ii: ii };
    const base = 'menu.categories.' + ci + '.items.' + ii;
    openSheet(sheetHead('Editar plato · ' + (c.name || '')) +
      fieldHTML({ k: 'name', t: 'text', label: 'Nombre', i18n: true }, base) +
      fieldHTML({ k: 'desc', t: 'area', label: 'Descripción', i18n: true, rows: 2 }, base) +
      '<div class="grid2">' + fieldHTML({ k: 'price', t: 'num', label: 'Precio en pesos', min: 0, step: 100, money: true }, base) + fieldHTML({ k: 'emoji', t: 'text', label: 'Emoji', ph: '🍲' }, base) + '</div>' +
      fieldHTML({ k: 'ico', t: 'icon', label: 'Ícono', emoji: 'emoji' }, base) +
      fieldHTML({ k: 'img', t: 'img', label: 'Foto (opcional)', max: 900 }, base) +
      '<div class="fld"><span class="lab">Etiquetas</span><div class="tagpick">' + TAGS.map(function (t) {
        const on = it.tags.indexOf(t[0]) >= 0;
        return '<button type="button" class="tg' + (on ? ' on' : '') + '" data-a="item-tag" data-tag="' + t[0] + '" aria-pressed="' + on + '">' + t[1] + '</button>';
      }).join('') + '</div></div>' +
      fieldHTML({ k: 'on', t: 'bool', label: 'Disponible (apagado se muestra como agotado)', def: true }, base) +
      '<div class="sh-foot"><button type="button" class="btn danger" data-a="item-del">Eliminar</button><button type="button" class="btn" data-a="item-dup">Duplicar</button><button type="button" class="btn pri" data-a="sheet-close">Listo</button></div>',
      'item', function () { S.edit = null; renderEditor(); renderTabs(); });
  }

  /* ---------- Acciones ---------- */
  const ACTIONS = {
    tab: function (d) { setTab(d.t); },
    drawer: function () { openDrawer(); },
    'sheet-close': function () { closeSheet(); },
    'open-tpl': function (d) { closeSheet(); openTemplate(d.id); },
    'open-app': function (d) { openApp(d.id); },
    'new-app': function () { openNewApp(); },
    'create-app': function (d) {
      const nm = (($('#na-name') || {}).value || '').trim();
      const fallback = d.from === 'blank' ? 'Mi local' : ((TEMPLATES.filter(function (t) { return t.id === d.from; })[0] || {}).brand || {}).name;
      createApp(d.from, nm || fallback);
    },
    'save-as': function () { saveAsApp(); },
    'dup-app': function (d) { dupApp(d.id); },
    'del-app': function (d) {
      const a = S.apps.filter(function (x) { return x.id === d.id; })[0]; if (!a) return;
      confirmBox('¿Eliminar «' + (a.brand.name || 'esta app') + '»?', 'Se borra de tu cuenta. Los archivos que ya exportaste y las apps publicadas no cambian.', 'Eliminar', function () { delApp(d.id); });
    },
    skin: function (d) { applySkin(d.s); },
    pal: function (d) { applyPalette(+d.i); },
    tex: function (d) { S.cur.theme.texture = d.v; edited(); renderEditor(); refocus('tex', 'v', d.v); },
    /* Campo de opciones (tipo seg): guarda el valor en su ruta y devuelve el foco al botón elegido. */
    set: function (d) {
      setPath(S.cur, d.p, d.v); edited(); renderEditor();
      /* En una hoja (por ejemplo, el plato) el editor de atrás no la vuelve a pintar: se marca aquí. */
      const sg = document.querySelectorAll('[data-a="set"]');
      for (let i = 0; i < sg.length; i++) if (sg[i].getAttribute('data-p') === d.p) { const on = sg[i].getAttribute('data-v') === d.v; sg[i].classList.toggle('on', on); sg[i].setAttribute('aria-pressed', String(on)); }
      if (/Pos$/.test(d.p)) repaintImg(d.p.replace(/Pos$/, ''));
      const bs = document.querySelectorAll('[data-a="set"]');
      for (let i = 0; i < bs.length; i++) if (bs[i].getAttribute('data-p') === d.p && bs[i].getAttribute('data-v') === d.v) { try { bs[i].focus({ preventScroll: true }); } catch (e) { /* nada */ } break; }
    },
    adv: function () { S.adv = !S.adv; lsSet('break.studio.adv', S.adv); renderEditor(); refocus('adv'); },
    sub: function (d) { S.sub = d.g; renderEditor(); refocus('sub', 'g', d.g); },
    'style-reset': function (d) {
      const c = findCard(d.card); if (!c) return;
      resetKeys(cardKeys(c)); edited(); renderEditor(); renderHeader();
      toast('«' + c.title + '» volvió a lo que trae la estética.');
    },
    'style-reset-all': function () {
      const k = S.cur.theme.skin, sk = SKINS[k] || SKINS.elegante;
      confirmBox('¿Volver a la estética ' + sk.label.toLowerCase() + '?', 'Se quitan todos los ajustes de diseño propios: colores, tipografías, formas y fondo. El contenido de la app no cambia.', 'Restablecer', function () {
        S.cur.theme = Object.assign({ skin: k }, clone(sk.defaults));
        edited(); renderEditor(); renderHeader(); pvUpdate(true);
        toast('La app volvió a la estética ' + sk.label.toLowerCase() + '.');
      });
    },
    'mod-open': function (d) { S.openMod = S.openMod === d.mid ? null : d.mid; renderEditor(); if (S.openMod && DESKTOP.matches) pvFocus(d.mid); },
    'mod-mv': function (d) { const i = modIndex(d.mid); if (move(S.cur.modules, i, +d.d)) { edited(); renderEditor(); } },
    'mod-focus': function (d) { if (!DESKTOP.matches) setTab('vista'); setTimeout(function () { pvFocus(d.mid); }, 80); },
    'mod-dup': function (d) {
      const i = modIndex(d.mid); if (i < 0) return;
      const m = clone(S.cur.modules[i]); m.id = uid(m.type); S.cur.modules.splice(i + 1, 0, m); S.openMod = m.id; edited(); renderEditor();
    },
    'mod-del': function (d) {
      const i = modIndex(d.mid); if (i < 0) return;
      const label = (MODULES[S.cur.modules[i].type] || {}).label || 'módulo';
      confirmBox('¿Quitar «' + label + '»?', 'Se borra con su contenido. Si solo quieres ocultarlo, apaga su interruptor.', 'Quitar', function () {
        const j = modIndex(d.mid); if (j >= 0) S.cur.modules.splice(j, 1); S.openMod = null; edited(); renderEditor();
      });
    },
    'mod-add': function () { openCatalog(); },
    'mod-new': function (d) { addMod(d.type); },
    'li-add': function (d) {
      let arr = getPath(S.cur, d.p); if (!Array.isArray(arr)) { arr = []; setPath(S.cur, d.p, arr); }
      arr.push(JSON.parse(d.blank || '{}')); edited(); renderEditor();
    },
    'li-del': function (d) { const arr = getPath(S.cur, d.p); if (Array.isArray(arr)) { arr.splice(+d.i, 1); edited(); renderEditor(); } },
    'li-mv': function (d) { if (move(getPath(S.cur, d.p), +d.i, +d.d)) { edited(); renderEditor(); } },
    chk: function (d, el) {
      let arr = getPath(S.cur, d.p); if (!Array.isArray(arr)) { arr = []; setPath(S.cur, d.p, arr); }
      const i = arr.indexOf(d.v); if (i >= 0) arr.splice(i, 1); else arr.push(d.v);
      el.classList.toggle('on', i < 0); el.setAttribute('aria-pressed', String(i < 0)); edited();
    },
    day: function (d, el) {
      const arr = (getPath(S.cur, d.p) || []).map(Number), n = +d.d, i = arr.indexOf(n);
      if (i >= 0) arr.splice(i, 1); else arr.push(n);
      arr.sort(function (a, b) { return a - b; });
      setPath(S.cur, d.p, arr); edited();
      el.classList.toggle('on', i < 0); el.setAttribute('aria-pressed', String(i < 0));
    },
    'cat-open': function (d) { S.openCat = S.openCat === d.cid ? null : d.cid; renderEditor(); },
    'cat-add': function () { addCat(); },
    'cat-mv': function (d) { if (move(S.cur.menu.categories, +d.ci, +d.d)) { edited(); renderEditor(); } },
    'cat-del': function (d) {
      const c = catOf(+d.ci); if (!c) return;
      confirmBox('¿Eliminar «' + (c.name || 'la categoría') + '»?', 'También se borran sus ' + c.items.length + ' platos.', 'Eliminar', function () {
        const i = S.cur.menu.categories.indexOf(c); if (i >= 0) S.cur.menu.categories.splice(i, 1); S.openCat = null; edited(); renderEditor(); renderTabs();
      });
    },
    'item-add': function (d) { addItem(+d.ci); },
    'item-edit': function (d) { openItemSheet(+d.ci, +d.ii); },
    'item-mv': function (d) { const c = catOf(+d.ci); if (c && move(c.items, +d.ii, +d.d)) { edited(); renderEditor(); } },
    'item-tag': function (d, el) {
      if (!S.edit) return;
      const it = catOf(S.edit.ci).items[S.edit.ii], i = it.tags.indexOf(d.tag);
      if (i >= 0) it.tags.splice(i, 1); else it.tags.push(d.tag);
      el.classList.toggle('on', i < 0); el.setAttribute('aria-pressed', String(i < 0)); edited();
    },
    'item-dup': function () {
      if (!S.edit) return;
      const c = catOf(S.edit.ci), it = clone(c.items[S.edit.ii]); it.id = uid('it'); it.name = (it.name || '') + ' (copia)';
      c.items.splice(S.edit.ii + 1, 0, it); edited(); openItemSheet(S.edit.ci, S.edit.ii + 1); toast('Plato duplicado.');
    },
    'item-del': function () {
      if (!S.edit) return;
      const ed = S.edit, c = catOf(ed.ci), it = c.items[ed.ii];
      confirmBox('¿Eliminar «' + (it.name || 'este plato') + '»?', 'Si solo se acabó por hoy, mejor márcalo como no disponible.', 'Eliminar', function () {
        c.items.splice(ed.ii, 1); S.edit = null; edited(); renderEditor(); renderTabs();
      });
    },
    /* Selector de ícono: abre y cierra la cuadrícula en su sitio, sin volver a pintar el editor. */
    'ico-open': function (d, el) {
      const box = el.closest('.icof'); if (!box) return;
      const g = box.querySelector('.icog');
      if (g) { g.parentNode.removeChild(g); el.setAttribute('aria-expanded', 'false'); return; }
      el.insertAdjacentHTML('afterend', icoGridHTML(d.p));
      el.setAttribute('aria-expanded', 'true');
    },
    'ico-pick': function (d, el) {
      if (d.v && !META.icons[d.v]) return;
      if (d.v) setPath(S.cur, d.p, d.v); else delPath(S.cur, d.p);
      edited();
      if (el.closest('#sheet')) repaintIco(d.p); else renderEditor();
      refocus('ico-open', 'p', d.p);
    },
    'hours-copy': function () { copyMonday(); },
    'logo-clear': function () { S.cur.brand.logo = { type: 'mono', value: '' }; edited(); renderEditor(); },
    'img-clear': function (d) { if (d.ip) { setPath(S.cur, d.ip, ''); delPath(S.cur, d.ip + 'Pos'); photoChanged(d.ip); const inp = document.getElementById(fid(d.ip)); if (inp) { try { inp.focus({ preventScroll: true }); } catch (e) { /* nada */ } } } },
    'lib-pick': function (d) { if (d.ip) openLibrary(d.ip); },
    'lib-use': function (d) {
      if (!d.ip || !/^[\w-]{8,64}$/.test(d.id || '')) return;
      if (d.ip === 'brand.logo.value') S.cur.brand.logo = { type: 'img', value: 'asset:' + d.id };
      else setPath(S.cur, d.ip, 'asset:' + d.id);
      closeSheet(); photoChanged(d.ip); toast('Foto elegida.');
    },
    'lib-clean': function () {
      const ids = unusedAssets();
      if (!LIB.cap || !ids.length) { toast('No hay fotos sin usar.'); return; }
      confirmBox(ids.length === 1 ? '¿Borrar 1 foto sin usar?' : '¿Borrar ' + ids.length + ' fotos sin usar?', 'Ninguna de tus apps ni de las plantillas abiertas las usa. Se borran para siempre; las apps que ya exportaste no cambian.', 'Borrar', async function () {
        const gone = [];
        for (const id of ids) {
          try { await LIB.cap.delete(id); gone.push(id); } catch (e) { if (e && (e.code === 'rate_limited' || e.code === 'not_granted')) break; }
        }
        LIB.index = LIB.index.filter(function (f) { return gone.indexOf(f.id) < 0; });
        if (LIB.listed) LIB.listed = LIB.listed.filter(function (id) { return gone.indexOf(id) < 0; });
        libSave(); LIB.usage = null; renderEditor(); libRefresh();
        toast(gone.length === ids.length ? (gone.length === 1 ? 'Borré la foto sin usar.' : 'Borré ' + gone.length + ' fotos sin usar.') : 'Borré ' + gone.length + ' de ' + ids.length + ' fotos. Intenta de nuevo en un momento.');
      });
    },
    'lib-move': async function () {
      if (!LIB.cap) return;
      toast('Pasando las fotos a la biblioteca…');
      const n = await internalize(S.cur);
      if (n) { edited(); renderEditor(); renderHeader(); toast(n === 1 ? 'Pasé 1 foto a la biblioteca.' : 'Pasé ' + n + ' fotos a la biblioteca.'); }
    },
    'exp-html': function () { exportHTML(); },
    'exp-zip': function () { exportZip(); },
    'exp-json': function () { exportJSON(); },
    'copy-html': function () { copyHTML(); },
    'exp-qr': function () { exportQR(); },
    'pv-lang': function (d) { S.pvLang = d.v === 'en' ? 'en' : 'es'; if (PV.ready) PV.rt.setLang(S.pvLang); renderStageTop(); },
    'pv-reset': function () { if (PV.ready) { PV.rt.reset(clone(S.cur)); if (S.pvLang === 'en') PV.rt.setLang('en'); toast('Vista reiniciada.'); } },
    'pv-full': function () { toggleFull(); },
    'confirm-yes': function () { const f = S.confirmFn; S.confirmFn = null; S.sheetOnClose = null; closeSheet(); if (f) f(); }
  };
  /* Tras volver a pintar el editor, devuelve el foco al botón de la acción (y del valor, si se indica). */
  function refocus(act, key, val) {
    const bs = document.querySelectorAll('[data-a="' + act + '"]');
    for (let i = 0; i < bs.length; i++) if (!key || bs[i].getAttribute('data-' + key) === val) { try { bs[i].focus({ preventScroll: true }); } catch (e) { /* nada */ } return; }
  }
  function toggleFull() {
    S.full = !S.full;
    $('#stage').classList.toggle('full', S.full);
    document.body.classList.toggle('noscroll', S.full);
    renderStageTop();
  }

  /* ---------- Campos: entrada ---------- */
  let qrTimer = null;
  function onField(e) {
    const t = e.target, p = t && t.getAttribute && t.getAttribute('data-p');
    if (!p) return;
    const type = t.getAttribute('data-type');
    const discrete = type === 'bool' || type === 'boolinv' || t.tagName === 'SELECT' || t.type === 'time';
    if (discrete && e.type === 'input' && t.type !== 'time') return;
    if (!discrete && e.type === 'change' && type !== 'color') return;
    let v;
    if (type === 'bool') v = t.checked;
    else if (type === 'boolinv') v = !t.checked;
    else if (type === 'num') { v = t.value === '' ? 0 : Number(t.value); if (!isFinite(v)) return; }
    else if (type === 'color') {
      v = t.value.trim(); if (v.charAt(0) !== '#') v = '#' + v;
      if (!/^#[0-9a-f]{6}$/i.test(v)) return;
      v = v.toUpperCase();
      const pair = document.getElementById(t.getAttribute('data-pair'));
      if (pair && pair.value.toUpperCase() !== v) pair.value = pair.type === 'color' ? v.toLowerCase() : v;
    } else v = t.value;
    setPath(S.cur, p, v);
    edited();
    afterField(p, t, v);
  }
  function afterField(p, t, v) {
    if (p.indexOf('theme.') === 0) syncResets();
    repaintIco(p);
    if (t.type === 'range') {
      const outs = document.querySelectorAll('output[data-out]'), unit = t.getAttribute('data-unit');
      for (let i = 0; i < outs.length; i++) if (outs[i].getAttribute('data-out') === p) outs[i].textContent = v + (unit ? ' ' + unit : '');
      return;
    }
    if (p.indexOf('theme.roles.') === 0) {
      const bs = document.querySelectorAll('[data-a="set"]');
      for (let i = 0; i < bs.length; i++) if (bs[i].getAttribute('data-p') === p) { bs[i].classList.remove('on'); bs[i].setAttribute('aria-pressed', 'false'); }
      if (t.parentNode && t.parentNode.classList) t.parentNode.classList.add('on');
      const rc = $('#role-contrast'); if (rc) rc.innerHTML = roleContrastHTML();
      return;
    }
    if (p.indexOf('theme.colors.') === 0) {
      const k = p.slice(13), dots = document.querySelectorAll('[data-sw="' + k + '"]');
      for (let i = 0; i < dots.length; i++) dots[i].style.background = v;
      const rc = $('#role-contrast'); if (rc) rc.innerHTML = roleContrastHTML();
    }
    if (p.indexOf('theme.colors.') === 0) { const c = $('#contrast'); if (c) c.innerHTML = contrastHTML(); const tx = $('.texs'); if (tx) tx.setAttribute('style', texVars()); if (p === 'theme.colors.accent' || p === 'theme.colors.bg') renderHeader(); return; }
    if (p === 'brand.name') { renderHeader(); renderStageTop(); return; }
    if (p === 'i18n.bilingual') { if (!v && S.pvLang === 'en') { S.pvLang = 'es'; if (PV.ready) PV.rt.setLang('es'); } renderEditor(); renderStageTop(); renderTabs(); return; }
    if (t.getAttribute('data-rr') || /^brand\.hours\.\d+\.closed$/.test(p)) { renderEditor(); return; }
    let m = /^modules\.(\d+)\.on$/.exec(p);
    if (m) { const row = t.closest('.mod'); if (row) row.classList.toggle('off', !v); return; }
    m = /^modules\.(\d+)\.s\.title$/.exec(p);
    if (m) { const b = document.querySelector('[data-title-for="' + m[1] + '"]'); if (b) b.textContent = v || (MODULES[S.cur.modules[+m[1]].type] || {}).label || ''; return; }
    m = /^menu\.categories\.(\d+)\.name$/.exec(p);
    if (m) { const b = document.querySelector('[data-cat-label="' + m[1] + '"]'); if (b) b.textContent = v || 'Sin nombre'; return; }
    const mo = document.querySelector('[data-money="' + p.replace(/"/g, '') + '"]');
    if (mo) mo.textContent = money(v);
    if (p === 'meta.url') {
      const ok = /^https?:\/\/\S+$/i.test(v || '');
      const b = $('#qr-btn'); if (b) b.disabled = !ok;
      clearTimeout(qrTimer); qrTimer = setTimeout(drawQR, 250);
    }
  }
  function onFile(e) {
    const t = e.target;
    if (!t || t.type !== 'file' || !t.getAttribute('data-a')) return;
    const f = t.files && t.files[0], a = t.getAttribute('data-a');
    t.value = '';
    if (!f) return;
    if (a === 'imp-json') importJSON(f);
    if (a === 'logo-file') onLogoFile(f);
    if (a === 'img-file') onPhotoFile(f, t.getAttribute('data-ip'), +t.getAttribute('data-max') || 1100);
  }
  function readImage(file, done) {
    if (!/^image\//.test(file.type)) { toast('Elige una imagen (PNG, JPG o WebP).'); return; }
    const rd = new FileReader();
    rd.onload = function () {
      const im = new Image();
      im.onload = function () { done(im); };
      im.onerror = function () { toast('No se pudo leer esa imagen.'); };
      im.src = rd.result;
    };
    rd.readAsDataURL(file);
  }
  function onLogoFile(file) {
    readImage(file, async function (im) {
      if (LIB.cap) {
        toast('Subiendo el logo…');
        const e = await encodePhoto(im, 512, true), id = await libUpload(e.blob, e.w, e.h);
        if (!id) return;
        S.cur.brand.logo = { type: 'img', value: 'asset:' + id };
        edited(); renderEditor(); renderHeader(); toast('Logo guardado en la biblioteca.');
        return;
      }
      const N = 256, cv = document.createElement('canvas'); cv.width = cv.height = N;
      const x = cv.getContext('2d'), r = Math.max(N / im.width, N / im.height), w = im.width * r, h = im.height * r;
      x.drawImage(im, (N - w) / 2, (N - h) / 2, w, h);
      let url = cv.toDataURL('image/webp', 0.86);
      if (!/^data:image\/webp/.test(url)) url = cv.toDataURL('image/png');
      if (url.length > 160000) url = cv.toDataURL('image/jpeg', 0.82);
      S.cur.brand.logo = { type: 'img', value: url };
      edited(); renderEditor(); renderHeader(); toast('Logo cargado.');
    });
  }
  /* Fotos: con la biblioteca se guardan aparte y con buena calidad. Sin ella se reducen y comprimen hasta
     unos 100 KB para que la app se pueda guardar. */
  function onPhotoFile(file, path, max) {
    if (!path) return;
    readImage(file, async function (im) {
      if (LIB.cap) {
        toast('Subiendo la foto…');
        const e = await encodePhoto(im, Math.min(2000, Math.round(max * 1.6))), id = await libUpload(e.blob, e.w, e.h);
        if (!id) return;
        setPath(S.cur, path, 'asset:' + id);
        if (S.sheetKind === 'lib') closeSheet();
        photoChanged(path); toast('Foto guardada en la biblioteca · ' + fmtBytes(e.blob.size) + '.');
        return;
      }
      const enc = function (side, q) {
        const r = Math.min(1, side / Math.max(im.width, im.height)), w = Math.max(1, Math.round(im.width * r)), h = Math.max(1, Math.round(im.height * r));
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(im, 0, 0, w, h);
        const url = cv.toDataURL('image/webp', q);
        return /^data:image\/webp/.test(url) ? url : cv.toDataURL('image/jpeg', q);
      };
      const lim = max >= 1000 ? 140000 : 90000;
      let url = enc(max, 0.72);
      if (url.length > lim) url = enc(Math.round(max * 0.8), 0.6);
      if (url.length > lim) url = enc(Math.round(max * 0.6), 0.55);
      setPath(S.cur, path, url);
      if (S.sheetKind === 'lib') closeSheet();
      photoChanged(path); toast('Foto cargada · ' + Math.round(url.length * 0.75 / 1024) + ' KB.');
    });
  }
  function importJSON(file) {
    const rd = new FileReader();
    rd.onload = async function () {
      let data = null;
      try { data = JSON.parse(rd.result); } catch (e) { data = null; }
      const app = data && data.app ? data.app : data;
      if (!validApp(app)) { toast('Ese archivo no es una configuración de Break.'); return; }
      if (!storeReady()) { toast('Espera a que conecte el guardado e intenta de nuevo.'); return; }
      const tmpId = 'import-' + Date.now();
      if (LIB.cap && embeddedPhotos(app).length) { toast('Pasando las fotos a la biblioteca…'); await internalize(app); }
      S.tpl[tmpId] = { cfg: clone(app), dirty: false };
      createApp(tmpId, (app.brand.name || 'App') + ' (importada)');
      delete S.tpl[tmpId];
    };
    rd.onerror = function () { toast('No se pudo leer el archivo.'); };
    rd.readAsText(file);
  }

  /* ---------- Exportar ---------- */
  function exportCfg(c) { const x = clone(c); delete x.template; delete x.from; x.exported = new Date().toISOString(); return x; }
  function initials(name) { return String(name || 'B').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0); }).join('').toUpperCase() || 'B'; }
  function logoText(c) { const l = c.brand.logo || {}; if ((l.type === 'emoji' || l.type === 'mono') && l.value) return String(l.value).slice(0, 3); return initials(c.brand.name); }
  function svgIcon(c) {
    const sp = appIconSpec(c);
    let inner;
    if (sp.kind === 'icon') inner = '<g transform="translate(14 14) scale(1.5)" fill="none" stroke="' + sp.fg + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + META.icons[sp.value] + '</g>';
    else {
      const t = esc(sp.kind === 'img' ? initials(c.brand.name) : sp.value), fs = sp.kind === 'emoji' ? 36 : (t.length > 2 ? 24 : 30);
      inner = '<text x="32" y="' + (sp.kind === 'emoji' ? 45 : 42) + '" font-size="' + fs + '" text-anchor="middle" fill="' + sp.fg + '" font-family="Georgia,serif">' + t + '</text>';
    }
    return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="' + sp.bg + '"/>' + inner + '</svg>');
  }
  function buildAppHTML(c, o) {
    o = o || {};
    const x = exportCfg(c), bg = x.theme.colors.bg || '#ffffff', name = x.brand.name || 'Carta';
    const desc = [x.brand.tagline, x.brand.kind, x.brand.city].filter(Boolean).join(' · ');
    const json = JSON.stringify(x).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    /* Con la dirección publicada, el enlace se comparte con la imagen og.png del paquete. */
    const pub = String((x.meta && x.meta.url) || '').trim().replace(/\/+$/, '');
    const og = o.pwa && o.og && /^https:\/\/[^\s"'<>]+$/i.test(pub) ? ['<meta property="og:type" content="website">', '<meta property="og:url" content="' + attr(pub + '/') + '">', '<meta property="og:image" content="' + attr(pub + '/og.png') + '">',
      '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">', '<meta name="twitter:card" content="summary_large_image">'].join('\n') : '';
    /* Pantalla de carga: el logo sobre el color de fondo mientras cargan las tipografías (el motor la quita). */
    const lg = x.brand.logo || {}, lgv = String(lg.value || ''), lgImg = lg.type === 'img' && (/^data:image\/(png|jpe?g|webp|gif);base64,/.test(lgv) || /^img\/[\w-]{1,64}\.(webp|jpe?g|png|gif)$/.test(lgv));
    const splash = x.brand.splash === false ? '' : '<div id="bk-splash" aria-hidden="true" style="position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:' + attr(bg) + ';transition:opacity .4s ease">' +
      (lgImg ? '<img src="' + attr(lgv) + '" alt="" style="' + (lg.shape === 'horizontal' ? 'height:64px;width:auto;max-width:72vw' : 'width:96px;height:96px;border-radius:50%;object-fit:cover') + '">'
        : '<img src="' + attr(svgIcon(x)) + '" alt="" width="96" height="96" style="border-radius:24px">') + '</div>\n';
    const head = [
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
      '<title>' + esc(name + (x.brand.tagline ? ' · ' + x.brand.tagline : '')) + '</title>',
      '<meta name="description" content="' + attr(desc || 'Carta digital') + '">',
      '<meta name="theme-color" content="' + attr(bg) + '">',
      '<meta property="og:title" content="' + attr(name) + '">',
      '<meta property="og:description" content="' + attr(desc || 'Carta digital') + '">',
      o.pwa ? '<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" href="icon-192.png">\n<link rel="apple-touch-icon" href="icon-192.png">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">' : '<link rel="icon" href="' + attr(svgIcon(x)) + '">',
      og,
      '<link rel="preconnect" href="https://fonts.googleapis.com">',
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
      '<style>html,body{margin:0;background:' + bg + '}</style>'
    ].join('\n');
    return '<!doctype html>\n<html lang="es">\n<head>\n' + head.replace(/\n\n/g, '\n') + '\n</head>\n<body>\n' + splash + '<noscript><p style="font:16px/1.5 system-ui;padding:24px">Esta carta necesita JavaScript activado.</p></noscript>\n<script>\n' +
      'window.__BREAK__=' + json + ';\n(' + breakApp.toString() + ')(window,document,window.__BREAK__,{mode:"app"});\n' +
      (o.pwa ? 'if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){});});}\n' : '') +
      '<\/script>\n</body>\n</html>\n';
  }
  function swSource(c, extra) {
    const cache = 'break-' + slug(c.brand.name) + '-' + Date.now().toString(36);
    return '/* Service worker de Break: la carta abre sin señal y se actualiza cuando hay internet. */\n' +
      'const CACHE = ' + JSON.stringify(cache) + ';\n' +
      'const CORE = ' + JSON.stringify(['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'].concat(extra || [])) + ';\n' +
      'self.addEventListener("install", function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); })); });\n' +
      'self.addEventListener("activate", function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf("break-") === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });\n' +
      'self.addEventListener("fetch", function (e) {\n' +
      '  const r = e.request; if (r.method !== "GET") return;\n' +
      '  const u = new URL(r.url);\n' +
      '  if (r.mode === "navigate") { e.respondWith(fetch(r).then(function (res) { const cp = res.clone(); caches.open(CACHE).then(function (c) { c.put("./index.html", cp); }); return res; }).catch(function () { return caches.match("./index.html"); })); return; }\n' +
      '  if (u.origin === self.location.origin || /fonts\\.(googleapis|gstatic)\\.com$/.test(u.hostname)) {\n' +
      '    e.respondWith(caches.match(r).then(function (hit) { return hit || fetch(r).then(function (res) { if (res.ok || res.type === "opaque") { const cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, cp); }); } return res; }); }));\n' +
      '  }\n});\n';
  }
  function iconBlob(c, size) {
    return new Promise(function (resolve) {
      const d = (PV.frame && PV.frame.contentDocument && PV.cfgId === c.id) ? PV.frame.contentDocument : document;
      const cv = d.createElement('canvas'); cv.width = cv.height = size;
      const x = cv.getContext && cv.getContext('2d'), sp = appIconSpec(c);
      if (!x) { resolve(null); return; }
      x.fillStyle = sp.bg; x.fillRect(0, 0, size, size);
      const Img = (d.defaultView && d.defaultView.Image) || Image;
      const done = function () {
        try {
          if (cv.toBlob) cv.toBlob(function (b) { resolve(b || dataToBlob(cv.toDataURL('image/png'))); }, 'image/png');
          else resolve(dataToBlob(cv.toDataURL('image/png')));
        } catch (e) { resolve(null); }
      };
      const text = function () {
        const t = sp.kind === 'img' || sp.kind === 'icon' ? initials(c.brand.name) : sp.value;
        x.fillStyle = sp.fg; x.textAlign = 'center'; x.textBaseline = 'middle';
        const fs = Math.round(size * (sp.kind === 'emoji' ? 0.46 : t.length > 2 ? 0.28 : 0.38));
        x.font = fs + 'px "' + String(c.theme.fonts.display || 'Georgia').replace(/"/g, '') + '", Georgia, serif';
        x.fillText(t, size / 2, size / 2 + size * 0.03);
      };
      if (sp.kind === 'icon') {
        const ic = new Img();
        ic.onload = function () { const s = size * 0.58, o = (size - s) / 2; x.drawImage(ic, o, o, s, s); done(); };
        ic.onerror = function () { text(); done(); };
        ic.src = 'data:image/svg+xml,' + encodeURIComponent(iconSVGMarkup(sp.value, sp.fg, size)); return;
      }
      if (sp.kind === 'img' && /^data:image\//.test(sp.value || '')) {
        const im = new Img();
        im.onload = function () {
          if (sp.wide) { const w = size * 0.8, h = Math.min(size * 0.8, w * im.height / Math.max(1, im.width)); x.drawImage(im, (size - w) / 2, (size - h) / 2, w, h); done(); return; }
          const s = size * 0.72, o = (size - s) / 2; x.save(); x.beginPath(); x.arc(size / 2, size / 2, s / 2, 0, Math.PI * 2); x.clip(); x.drawImage(im, o, o, s, s); x.restore(); done();
        };
        im.onerror = function () { text(); done(); };
        im.src = sp.value; return;
      }
      text(); done();
    });
  }
  /* Imagen para compartir el enlace (1200 × 630): ícono, nombre, eslogan, ciudad y, si hay, la foto de portada.
     Se dibuja en el documento de la vista previa para usar las tipografías de la app. */
  function ogBlob(c, photo) {
    return new Promise(function (resolve) {
      const d = (PV.frame && PV.frame.contentDocument && PV.cfgId === c.id) ? PV.frame.contentDocument : document;
      const W = 1200, H = 630, cv = d.createElement('canvas'); cv.width = W; cv.height = H;
      const x = cv.getContext && cv.getContext('2d');
      if (!x) { resolve(null); return; }
      const col = c.theme.colors || {}, hx = function (v, f) { return /^#[0-9a-f]{6}$/i.test(String(v || '')) ? v : f; };
      const bg = hx(col.bg, '#ffffff'), ink = hx(col.ink, '#111111'), muted = hx(col.muted, '#666666'), acc = hx(col.accent, '#333333');
      const font = function (n) { return '"' + String(n || 'Georgia').replace(/"/g, '') + '", Georgia, serif'; };
      const Img = (d.defaultView && d.defaultView.Image) || Image;
      let hasPhoto = false;
      x.fillStyle = bg; x.fillRect(0, 0, W, H);
      const wrap = function (text, maxW, lines) {
        const words = String(text || '').split(/\s+/).filter(Boolean), out = []; let line = '';
        words.forEach(function (w) { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; });
        if (line) out.push(line);
        if (out.length > lines) { out.length = lines; out[lines - 1] = out[lines - 1].replace(/\s*\S*$/, '') + '…'; }
        return out;
      };
      const finish = function () {
        const left = 80, maxW = hasPhoto ? 540 : 1040, name = String(c.brand.name || 'Carta');
        let fs = 108;
        x.font = '400 ' + fs + 'px ' + font(c.theme.fonts.display);
        while (fs > 54 && x.measureText(name).width > maxW) { fs -= 4; x.font = '400 ' + fs + 'px ' + font(c.theme.fonts.display); }
        x.fillStyle = ink; x.textBaseline = 'alphabetic'; x.fillText(name, left, 318);
        x.font = '400 34px ' + font(c.theme.fonts.body); x.fillStyle = muted;
        wrap(c.brand.tagline || c.brand.kind || '', maxW, 2).forEach(function (l, i) { x.fillText(l, left, 392 + i * 46); });
        x.font = '700 22px ' + font(c.theme.fonts.body); x.fillStyle = acc;
        try { x.letterSpacing = '4px'; } catch (e) { /* navegador sin espaciado */ }
        x.fillText(String(c.brand.city || '').toUpperCase().slice(0, 48), left, 556);
        try { x.letterSpacing = '0px'; } catch (e) { /* nada */ }
        x.fillStyle = acc; x.fillRect(0, H - 14, W, 14);
        const ic = new Img();
        ic.onload = function () { x.save(); x.beginPath(); if (x.roundRect) x.roundRect(left, 80, 104, 104, 26); else x.rect(left, 80, 104, 104); x.clip(); x.drawImage(ic, left, 80, 104, 104); x.restore(); out(); };
        ic.onerror = out;
        ic.src = svgIcon(c);
      };
      const out = function () { try { cv.toBlob(function (b) { resolve(b || null); }, 'image/png'); } catch (e) { resolve(null); } };
      if (photo && /^data:image\/|^https?:/.test(photo)) {
        const im = new Img();
        im.onload = function () {
          const X = 600, w = W - X, r = Math.max(w / im.width, H / im.height), dw = im.width * r, dh = im.height * r;
          x.save(); x.beginPath(); x.rect(X, 0, w, H); x.clip(); x.drawImage(im, X + (w - dw) / 2, (H - dh) / 2, dw, dh); x.restore();
          const g = x.createLinearGradient(X, 0, X + 220, 0); g.addColorStop(0, bg); g.addColorStop(1, 'rgba(0,0,0,0)');
          x.fillStyle = g; x.fillRect(X, 0, 222, H);
          hasPhoto = true; finish();
        };
        im.onerror = finish;
        im.src = photo; return;
      }
      finish();
    });
  }
  /* Foto de portada que puede ir en la imagen para compartir (incrustada o de la biblioteca). */
  function heroPhoto(c) {
    const h = (c.modules || []).filter(function (m) { return m && m.type === 'hero' && m.on !== false; })[0];
    const v = h && h.s && h.s.variant !== 'texto' ? String(h.s.img || '') : '';
    return /^data:image\/(png|jpe?g|webp|gif)/.test(v) ? v : isAssetRef(v) ? assetURL(v.slice(6)) : '';
  }
  let ogTimer = null;
  function ogPreview() {
    clearTimeout(ogTimer);
    ogTimer = setTimeout(function () {
      const img = $('#og-prev'); if (!img) return;
      ogBlob(S.cur, heroPhoto(S.cur)).then(function (b) { return b ? blobToDataURL(b) : ''; }).then(function (u) {
        const el = $('#og-prev'); if (!el) return;
        if (u) { el.src = u; el.hidden = false; const e = $('#og-empty'); if (e) e.hidden = true; }
      }, function () { /* sin vista previa */ });
    }, 200);
  }
  function dataToBlob(url) {
    const parts = String(url).split(','), bin = atob(parts[1] || ''), arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: 'image/png' });
  }
  async function saveFile(filename, data) {
    const dl = await useCap('downloads');
    if (!dl) { toast('Las descargas no están disponibles en esta vista. Abre el estudio en claude.ai.'); return false; }
    try { await dl.save({ filename: filename, data: data }); toast('Listo: ' + filename); return true; } catch (e) {
      const code = e && e.code;
      if (code === 'declined') toast('Descarga cancelada.');
      else if (code === 'rate_limited') toast('Ya hay una descarga esperando tu confirmación.');
      else toast('No se pudo descargar el archivo.');
      return false;
    }
  }
  function hasLibPhotos(c) { let n = 0; walkStrings(clone(c), function (v) { if (isAssetRef(v)) n++; }); return n; }
  async function exportHTML() {
    if (hasLibPhotos(S.cur)) toast('Preparando las fotos…');
    const m = await materialize(S.cur, false);
    if (await saveFile(slug(S.cur.brand.name) + '.html', buildAppHTML(m.cfg, { pwa: false }))) missingNote(m.missing);
  }
  async function exportJSON() {
    if (hasLibPhotos(S.cur)) toast('Preparando las fotos…');
    const m = await materialize(S.cur, false);
    if (await saveFile(slug(S.cur.brand.name) + '-break.json', JSON.stringify({ format: 'break-app', version: 1, app: exportCfg(m.cfg) }, null, 2))) missingNote(m.missing);
  }
  async function exportZip() {
    const c = clone(S.cur);
    let Z;
    try { Z = await loadScript(JSZIP_SRC, 'JSZip'); } catch (e) { toast('No se pudo cargar el compresor. Revisa la conexión.'); return; }
    toast('Armando el paquete…');
    const m = await materialize(c, true);
    /* El ícono de la app usa el logo: si está en la biblioteca, se pasa como imagen incrustada. */
    const ic = clone(m.cfg), lf = m.files.filter(function (f) { return ic.brand.logo && f.path === ic.brand.logo.value; })[0];
    if (lf) { try { ic.brand.logo.value = await blobToDataURL(lf.blob); } catch (e) { /* ícono con iniciales */ } }
    const icons = await Promise.all([iconBlob(ic, 192), iconBlob(ic, 512)]);
    /* Imagen para compartir el enlace, con la foto de portada si la hay. */
    const hp = (m.cfg.modules || []).filter(function (x) { return x && x.type === 'hero'; })[0], hpath = hp && hp.s ? String(hp.s.img || '') : '';
    const hf = m.files.filter(function (f) { return f.path === hpath; })[0];
    let ogPhoto = /^data:image\//.test(hpath) ? hpath : '';
    if (hf) { try { ogPhoto = await blobToDataURL(hf.blob); } catch (e) { ogPhoto = ''; } }
    if (hp && hp.s && hp.s.variant === 'texto') ogPhoto = '';
    const ogb = await ogBlob(ic, ogPhoto);
    const zip = new Z(), name = c.brand.name || 'Carta', bg = c.theme.colors.bg || '#ffffff';
    zip.file('index.html', buildAppHTML(m.cfg, { pwa: true, og: !!ogb }));
    for (const f of m.files) zip.file(f.path, String(await blobToDataURL(f.blob)).split(',')[1] || '', { base64: true });
    zip.file('manifest.webmanifest', JSON.stringify({
      name: name + (c.brand.tagline ? ' · ' + c.brand.tagline : ''), short_name: name.slice(0, 12), description: [c.brand.tagline, c.brand.city].filter(Boolean).join(' · '),
      start_url: './', scope: './', display: 'standalone', background_color: bg, theme_color: bg, lang: 'es-CO',
      icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }]
    }, null, 2));
    zip.file('sw.js', swSource(c, m.files.map(function (f) { return './' + f.path; })));
    zip.file('_headers', '/sw.js\n  Cache-Control: no-cache\n/index.html\n  Cache-Control: no-cache\n');
    zip.file('LEEME.txt', name + ' · app de carta hecha con Break\n\n' +
      'Qué hay en esta carpeta\n  index.html            La app completa (motor + configuración).\n  manifest.webmanifest  Permite instalarla en el celular.\n  sw.js                 Guarda la app para que abra sin señal.\n  icon-192.png, icon-512.png\n' +
      (m.files.length ? '  img/                  Las fotos de la carta.\n' : '') + '  og.png                Imagen que se ve al compartir el enlace (WhatsApp, Facebook…).\n' +
      '  _headers              Reglas de caché para Cloudflare Pages.\n\n' +
      'Publicar en Cloudflare Pages\n  1. En el panel de Cloudflare abre Workers & Pages y crea un proyecto de Pages con la opción de subir archivos.\n  2. Ponle nombre y arrastra este .zip (o la carpeta descomprimida).\n  3. Cloudflare te da una dirección que termina en .pages.dev. Pégala en Break Studio › Publicar para generar el QR de las mesas.\n\n' +
      'Para cambiar precios o platos: edita la app en Break Studio, descarga el .zip otra vez y súbelo como nueva versión del mismo proyecto.\n');
    if (icons[0]) zip.file('icon-192.png', icons[0]);
    if (icons[1]) zip.file('icon-512.png', icons[1]);
    if (ogb) zip.file('og.png', String(await blobToDataURL(ogb)).split(',')[1] || '', { base64: true });
    let blob;
    try { blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }); } catch (e) { toast('No se pudo armar el paquete.'); return; }
    if (await saveFile(slug(name) + '-cloudflare.zip', blob)) missingNote(m.missing);
  }
  async function copyHTML() {
    const m = await materialize(S.cur, false), html = buildAppHTML(m.cfg, { pwa: false });
    missingNote(m.missing);
    const fallback = function () {
      openSheet(sheetHead('Código de la app') + '<p class="help">Selecciona todo el texto y cópialo. Pégalo en un archivo llamado index.html.</p><textarea class="in code" id="code-out" rows="10" readonly>' + esc(html) + '</textarea>', 'code');
      const ta = $('#code-out'); if (ta) { ta.focus(); ta.select(); }
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(html).then(function () { toast('Código copiado (' + Math.round(html.length / 1024) + ' KB).'); }, fallback); return; }
    } catch (e) { /* plan B */ }
    fallback();
  }
  async function drawQR() {
    const cv = $('#qr-cv'), empty = document.querySelector('.qr-empty');
    if (!cv) return;
    const url = String((S.cur.meta && S.cur.meta.url) || '').trim();
    if (!/^https?:\/\/\S+$/i.test(url)) { cv.hidden = true; if (empty) empty.hidden = false; return; }
    let Q;
    try { Q = await loadScript(QR_SRC, 'qrcode'); } catch (e) { toast('No se pudo cargar el generador de QR.'); return; }
    let qr;
    try { qr = Q(0, 'M'); qr.addData(url); qr.make(); } catch (e) { toast('Esa dirección es demasiado larga para un QR.'); return; }
    const n = qr.getModuleCount(), quiet = 4, W = 600, cell = Math.floor((W - 60) / (n + quiet * 2)), side = cell * (n + quiet * 2);
    const ox = Math.round((W - side) / 2), oy = 30, H = oy + side + 150;
    cv.width = W; cv.height = H;
    const x = cv.getContext && cv.getContext('2d');
    if (!x) return;
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#111111';
    for (let r = 0; r < n; r++) for (let col = 0; col < n; col++) if (qr.isDark(r, col)) x.fillRect(ox + (col + quiet) * cell, oy + (r + quiet) * cell, cell, cell);
    x.textAlign = 'center'; x.fillStyle = '#111111';
    x.font = '700 40px Figtree, system-ui, sans-serif';
    x.fillText(String(S.cur.brand.name || '').slice(0, 26), W / 2, oy + side + 52);
    x.font = '500 24px Figtree, system-ui, sans-serif'; x.fillStyle = '#444444';
    const usted = S.cur.i18n && S.cur.i18n.usted;
    x.fillText((usted ? 'Escanee' : 'Escanea') + ' para ver la carta' + (bilingual() ? ' · Scan for the menu' : ''), W / 2, oy + side + 96);
    cv.hidden = false; if (empty) empty.hidden = true;
  }
  function exportQR() {
    const cv = $('#qr-cv'); if (!cv || cv.hidden) { toast('Primero pega la dirección de la app.'); return; }
    const name = 'qr-' + slug(S.cur.brand.name) + '.png';
    try { cv.toBlob(function (b) { saveFile(name, b || dataToBlob(cv.toDataURL('image/png'))); }, 'image/png'); } catch (e) { toast('No se pudo crear la imagen del QR.'); }
  }

  /* ---------- Aviso ---------- */
  let toastT = null;
  function toast(t) {
    const el = $('#toast'); if (!el) return;
    el.textContent = t; el.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('show'); }, 2800);
  }

  /* ---------- Arranque ---------- */
  function boot(hot) {
    hot = hot || {};
    const last = lsGet('break.studio.last', null);
    let start = (last && last.kind === 'tpl' && TEMPLATES.some(function (t) { return t.id === last.id; })) ? last.id : TEMPLATES[0].id;
    if (hot.tpl && typeof hot.tpl === 'object') Object.keys(hot.tpl).forEach(function (k) { if (validApp(hot.tpl[k])) S.tpl[k] = { cfg: hot.tpl[k], dirty: true }; });
    if (hot.kind === 'tpl' && hot.id && TEMPLATES.some(function (t) { return t.id === hot.id; })) start = hot.id;
    if (hot.tab && PANELS[hot.tab]) S.tab = hot.tab;
    if (!S.tpl[start]) S.tpl[start] = { cfg: clone(TEMPLATES.filter(function (t) { return t.id === start; })[0]), dirty: false };
    S.cur = S.tpl[start].cfg; S.kind = 'tpl';
    document.addEventListener('click', function (e) {
      const el = e.target.closest ? e.target.closest('[data-a]') : null;
      if (!el || el.tagName === 'INPUT') return;
      if (el.id === 'sheetBg') { closeSheet(); return; }
      const fn = ACTIONS[el.getAttribute('data-a')];
      if (fn) { e.preventDefault(); fn(el.dataset, el, e); }
    });
    document.addEventListener('input', onField);
    document.addEventListener('change', onField);
    document.addEventListener('change', onFile);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!$('#sheet').hidden) closeSheet(); else if (S.full) toggleFull();
    });
    window.addEventListener('pagehide', flushSave);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flushSave(); });
    if (DESKTOP.addEventListener) DESKTOP.addEventListener('change', function () { renderAll(); });
    pvBoot();
    renderAll();
    decoStyles();
    storeInit();
    libInit();
    const H = window.claude && window.claude.hot;
    if (H && typeof H.snapshot === 'function') {
      try {
        H.snapshot(function () {
          const tpl = {};
          Object.keys(S.tpl).forEach(function (k) { if (S.tpl[k] && S.tpl[k].dirty) tpl[k] = S.tpl[k].cfg; });
          return { tab: S.tab, kind: S.kind, id: S.cur && S.cur.id, tpl: tpl };
        });
      } catch (e) { /* sin recarga en caliente */ }
    }
  }
  let booted = false;
  const startOnce = function (d) { if (booted) return; booted = true; boot(d); };
  const HOT = window.claude && window.claude.hot;
  if (HOT && typeof HOT.ready === 'function') {
    try { HOT.ready(startOnce); } catch (e) { /* sin recarga en caliente */ }
    setTimeout(function () { startOnce((HOT && HOT.data) || {}); }, 400);
  } else startOnce((HOT && HOT.data) || {});

  window.__breakStudio = { S: S, buildAppHTML: buildAppHTML, checks: checks, Store: Store, ACTIONS: ACTIONS, pv: PV, meta: META, lib: LIB, materialize: materialize };
})();
