/* Break · administración del servidor del panel (/admin). Crea y actualiza locales con la app que descarga el estudio
   (.json), sube sus fotos a este servidor, cambia el PIN del dueño y descarga respaldos. La clave de administración
   (ADMIN_TOKEN) se escribe aquí y queda solo en esta pestaña (sessionStorage): nunca pasa por el estudio.
   No lleva el motor: solo habla con el servidor que la sirve. */
(function () {
  'use strict';
  const $ = function (s, el) { return (el || document).querySelector(s); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  const attr = esc;
  const qs = new URLSearchParams(location.search);
  const K = 'break.admin', SLUG_RE = /^[a-z0-9-]{2,40}$/;
  /* Fotos que se suben al servidor; las ilustraciones SVG (diseño) se quedan en la app tal como vienen. */
  const PHOTO_RE = /^data:image\/(png|jpe?g|webp);base64,[a-z0-9+/=]+$/i;
  const A = { token: '', locales: [], file: null, fileErr: '', busy: false, result: null, pinFor: '' };

  function stGet() { try { return sessionStorage.getItem(K) || ''; } catch (e) { return ''; } }
  function stSet(v) { try { if (v) sessionStorage.setItem(K, v); else sessionStorage.removeItem(K); } catch (e) { /* sin almacenamiento */ } }
  let toastT = null;
  function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('show'); }, 3200); }
  function walk(o, fn) {
    Object.keys(o).forEach(function (k) {
      const v = o[k];
      if (typeof v === 'string') { const r = fn(v); if (r !== undefined) o[k] = r; } else if (v && typeof v === 'object') walk(v, fn);
    });
  }
  function slugOf(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40); }
  function panelLink(slug) { return location.origin + '/panel/' + slug; }
  function hoyISO() { try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  /* PIN de 6 números al azar, sin los fáciles de adivinar (repetidos o seguidos). */
  function genPin() {
    const a = new Uint32Array(1); let p = '';
    do {
      if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a); else a[0] = Math.floor(Math.random() * 4294967296);
      p = String(a[0] % 1000000).padStart(6, '0');
    } while (/^(\d)\1{5}$/.test(p) || '0123456789'.indexOf(p) >= 0 || '9876543210'.indexOf(p) >= 0);
    return p;
  }
  function dataBlob(u) {
    const m = /^data:(image\/[\w.+-]+);base64,(.*)$/i.exec(u), bin = atob(m[2]), a = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
    return new Blob([a], { type: m[1].toLowerCase().replace('image/jpg', 'image/jpeg') });
  }

  async function api(method, path, body, raw) {
    const h = { Authorization: 'Bearer ' + A.token };
    let payload;
    if (raw) { payload = raw; h['Content-Type'] = raw.type || 'application/octet-stream'; } else if (body !== undefined) { payload = JSON.stringify(body); h['Content-Type'] = 'application/json'; }
    let res;
    try { res = await fetch(location.origin + path, { method: method, headers: h, body: payload, cache: 'no-store' }); } catch (e) { const err = new Error('No hay conexión con el servidor.'); err.status = 0; throw err; }
    let data = null; try { data = await res.json(); } catch (e) { data = null; }
    if (!res.ok) { const err = new Error((data && data.error) || 'No se pudo completar. Intente de nuevo.'); err.status = res.status; throw err; }
    return data;
  }

  /* ---------- Entrada ---------- */
  function topBar(inside) {
    return '<div class="top-in"><div class="top-n"><b>Administración</b><small>Servidor del panel · Break</small></div>' +
      (inside ? '<button type="button" class="btn sm" data-a="logout">Salir</button>' : '') + '</div>';
  }
  function showLogin(msg) {
    A.token = ''; stSet('');
    $('#top').innerHTML = topBar(false);
    $('#ed').innerHTML = '<form class="login card" data-form="login" novalidate><h1>Administración</h1>' +
      '<p>Escriba la clave de administración de este servidor (ADMIN_TOKEN). Queda guardada solo mientras esta pestaña esté abierta.</p>' +
      '<label class="lab" for="tok">Clave de administración</label><input class="in" id="tok" name="tok" type="password" autocomplete="current-password">' +
      (msg ? '<p class="err" role="alert" style="margin-top:12px">' + esc(msg) + '</p>' : '') +
      '<button class="btn pri wide" type="submit" style="margin-top:16px">Entrar</button></form>';
    const t = $('#tok'); if (t) t.focus();
  }
  async function login(tok) {
    if (!tok) { showLogin('Escriba la clave.'); return; }
    A.token = tok;
    try { await loadList(); stSet(tok); render(); } catch (e) { showLogin(e.status === 401 ? 'Clave de administración incorrecta.' : e.message); }
  }
  async function loadList() { const r = await api('GET', '/api/admin/locales'); A.locales = (r && r.locales) || []; }
  function gone(e) { if (e.status === 401) { showLogin('La clave de administración ya no sirve. Escríbala de nuevo.'); return true; } return false; }

  /* ---------- Pantalla ---------- */
  function render() {
    $('#top').innerHTML = topBar(true);
    $('#ed').innerHTML = '<div id="res"></div><div id="up"></div><div id="list"></div>';
    renderResult(); renderForm(); renderList();
  }
  function exists(slug) { return A.locales.some(function (l) { return l.slug === slug; }); }
  function renderResult() {
    const r = A.result, box = $('#res'); if (!box) return;
    if (!r) { box.innerHTML = ''; return; }
    const link = panelLink(r.slug);
    box.innerHTML = '<section class="card ad-c ad-ok" role="status"><h2>' + (r.nuevo ? 'Local creado' : 'Local actualizado') + '</h2>' +
      '<p class="help">' + esc(r.name) + ' · versión ' + esc(r.v) + (r.fotos ? ' · ' + r.fotos + (r.fotos === 1 ? ' foto subida' : ' fotos subidas') : '') + (r.rep ? ' · contenido reemplazado' : '') + '</p>' +
      '<p class="lab" style="margin-top:12px">Enlace del panel para el dueño</p><p class="ad-link"><a href="' + attr(link) + '" target="_blank" rel="noopener">' + esc(link) + '</a></p>' +
      (r.pin ? '<p class="lab">PIN</p><p class="ad-pinv">' + esc(r.pin) + '</p><p class="help">Anótelo: no se vuelve a mostrar.</p>' : '') +
      '<div class="ad-b"><button type="button" class="btn pri sm" data-a="copy">Copiar enlace' + (r.pin ? ' y PIN' : '') + '</button><button type="button" class="btn sm" data-a="res-x">Listo</button></div>' +
      '<p class="help" style="margin-top:12px">Publique la app (.zip) que descargó del estudio con esta conexión: es la que lee este contenido.</p></section>';
  }
  function renderForm() {
    const box = $('#up'), f = A.file; if (!box) return;
    let h = '<section class="card ad-c" id="nuevo"><h2>Crear o actualizar un local</h2>' +
      '<p class="help">Suba la configuración .json que descarga el estudio en Publicar (o un respaldo de esta página). Sus fotos se suben a este servidor.</p>' +
      '<div class="fld"><button type="button" class="btn" data-a="pick">' + (f ? 'Elegir otro archivo' : 'Elegir el archivo .json') + '</button><input type="file" id="file" accept=".json,application/json" hidden></div>' +
      (A.fileErr ? '<p class="err" role="alert">' + esc(A.fileErr) + '</p>' : '');
    if (f) {
      const ex = exists(f.slug);
      h += '<div class="ad-sum"><b>' + esc(f.fname) + '</b><span>' + esc(f.title || 'App sin nombre') + ' · ' + f.items + (f.items === 1 ? ' plato' : ' platos') + ' · ' + f.photos.length + (f.photos.length === 1 ? ' foto por subir' : ' fotos por subir') + '</span></div>' +
        f.warn.map(function (w) { return '<p class="note">' + esc(w) + '</p>'; }).join('') +
        '<form data-form="up" novalidate>' +
        '<div class="fld"><label class="lab" for="slug">Nombre corto del local</label><input class="in" id="slug" name="slug" value="' + attr(f.slug) + '" maxlength="40" autocomplete="off" autocapitalize="none" spellcheck="false">' +
        '<p class="help">Minúsculas, números y guiones. Va en el enlace: ' + esc(location.origin) + '/panel/…</p><p class="note" id="slug-w" hidden></p></div>' +
        '<div class="fld"><label class="lab" for="name">Nombre del local</label><input class="in" id="name" name="name" value="' + attr(f.title) + '" maxlength="80"></div>' +
        '<div class="fld"><label class="lab" for="pin">PIN del dueño</label><div class="ad-pr"><input class="in" id="pin" name="pin" inputmode="numeric" maxlength="6" autocomplete="off"><button type="button" class="btn sm" data-a="gen" data-t="pin">Generar uno</button></div>' +
        '<p class="help" id="pin-h">' + (ex ? 'Este local ya existe: déjelo vacío para no cambiar el PIN.' : '6 números. El dueño lo usa para entrar a su panel.') + '</p></div>' +
        '<div class="fld" id="rep-box"' + (ex ? '' : ' hidden') + '><label class="sw"><input type="checkbox" name="rep">Reemplazar también el contenido (carta, promos, avisos…)</label>' +
        '<p class="help">Se pierden los cambios que hizo el dueño. Sin marcar, solo se actualiza el diseño y la carta del dueño queda igual.</p></div>' +
        '<p class="ad-st" id="prog" role="status" hidden></p><p class="err" id="ferr" role="alert" hidden></p>' +
        '<button type="submit" class="btn pri wide" id="go">' + (ex ? 'Actualizar el local' : 'Crear el local') + '</button></form>';
    }
    box.innerHTML = h + '</section>';
    slugState();
  }
  function renderList() {
    const box = $('#list'); if (!box) return;
    const L = A.locales;
    box.innerHTML = '<section class="card ad-c"><h2>Locales</h2><p class="help">' + (L.length ? L.length + (L.length === 1 ? ' local en este servidor.' : ' locales en este servidor.') : 'Todavía no hay locales en este servidor.') + '</p>' +
      (L.length ? '<ul class="ad-list">' + L.map(function (l) {
        return '<li class="ad-row"><div class="ad-n"><b>' + esc(l.name) + '</b><small>' + esc(l.slug) + '</small></div><div class="ad-b">' +
          '<a class="btn sm" href="' + attr(panelLink(l.slug)) + '" target="_blank" rel="noopener">Abrir panel</a>' +
          '<button type="button" class="btn sm" data-a="backup" data-s="' + attr(l.slug) + '">Descargar respaldo</button>' +
          '<button type="button" class="btn sm" data-a="pin" data-s="' + attr(l.slug) + '">Cambiar PIN</button></div>' +
          (A.pinFor === l.slug ? '<form class="ad-pin" data-form="pin" data-s="' + attr(l.slug) + '" novalidate><label class="lab" for="np">PIN nuevo</label>' +
            '<div class="ad-pr"><input class="in" id="np" name="np" inputmode="numeric" maxlength="6" autocomplete="off"><button type="button" class="btn sm" data-a="gen" data-t="np">Generar</button></div>' +
            '<p class="help">Al cambiarlo se cierran las sesiones abiertas del panel de este local.</p>' +
            '<div class="ad-b"><button type="submit" class="btn pri sm">Guardar PIN</button><button type="button" class="btn sm" data-a="pin-x">Cancelar</button></div></form>' : '') + '</li>';
      }).join('') + '</ul>' : '') + '</section>';
  }
  /* Al cambiar el nombre corto: ¿ya existe? ¿coincide con el de la app? */
  function slugState() {
    const f = A.file, el = $('#slug'); if (!f || !el) return;
    const s = el.value.trim(), ex = exists(s), w = $('#slug-w');
    $('#rep-box').hidden = !ex;
    $('#pin-h').textContent = ex ? 'Este local ya existe: déjelo vacío para no cambiar el PIN.' : '6 números. El dueño lo usa para entrar a su panel.';
    $('#go').textContent = ex ? 'Actualizar el local' : 'Crear el local';
    const off = f.appSlug && s !== f.appSlug;
    w.hidden = !off;
    w.textContent = off ? 'La app publicada pide el contenido de «' + f.appSlug + '»: con otro nombre corto no lo va a leer.' : '';
  }

  /* ---------- Archivo de la app ---------- */
  function validApp(a) { return !!(a && typeof a === 'object' && a.brand && typeof a.brand === 'object' && a.menu && Array.isArray(a.menu.categories) && Array.isArray(a.modules)); }
  function describe(app, fname) {
    const p = (app.meta && app.meta.panel) || {}, want = String(qs.get('local') || '').trim();
    const appSlug = SLUG_RE.test(String(p.slug || '')) ? p.slug : '';
    const photos = {}; let gifs = 0;
    walk(app, function (v) { if (PHOTO_RE.test(v)) photos[v] = true; else if (/^data:image\/gif/i.test(v)) gifs++; });
    const items = app.menu.categories.reduce(function (n, c) { return n + ((c && Array.isArray(c.items)) ? c.items.length : 0); }, 0);
    const api = String(p.api || '').trim().replace(/\/+$/, ''), warn = [];
    if (!appSlug || !api) warn.push('Esta app todavía no está conectada al panel, así que la app publicada no leerá este contenido. En el estudio, en Publicar › Panel del local, escriba ' + location.origin + ' y un nombre corto, y vuelva a descargar el .zip y el .json.');
    else if (api !== location.origin) warn.push('La app pide su contenido a ' + api + ', no a esta dirección (' + location.origin + '). Si es otra dirección de este mismo servidor, como un dominio propio, está bien.');
    if (gifs) warn.push(gifs === 1 ? 'Una imagen GIF no se puede subir: queda en la app solo si es parte del diseño.' : gifs + ' imágenes GIF no se pueden subir: quedan en la app solo si son parte del diseño.');
    return { app: app, fname: fname, appSlug: appSlug, slug: appSlug || (SLUG_RE.test(want) ? want : slugOf(app.brand.name)), title: String(app.brand.name || '').slice(0, 80), items: items, photos: Object.keys(photos), warn: warn };
  }
  function readFile(file) {
    const rd = new FileReader();
    rd.onload = function () {
      let data = null; try { data = JSON.parse(rd.result); } catch (e) { data = null; }
      const app = data && data.app && typeof data.app === 'object' ? data.app : data;
      A.result = null;
      if (!validApp(app)) { A.file = null; A.fileErr = 'Ese archivo no es una app de Break. Descárguela en el estudio, en Publicar › Configuración .json.'; }
      else { A.fileErr = ''; A.file = describe(app, file.name || 'app.json'); }
      renderResult(); renderForm();
    };
    rd.onerror = function () { A.fileErr = 'No se pudo leer el archivo.'; renderForm(); };
    rd.readAsText(file);
  }
  function prog(t) { const el = $('#prog'); if (el) { el.textContent = t || ''; el.hidden = !t; } }
  function ferr(t) { const el = $('#ferr'); if (el) { el.textContent = t || ''; el.hidden = !t; } }

  /* Sube las fotos (cada una una sola vez), las cambia por su dirección en este servidor y guarda el local. */
  async function upload(form) {
    const f = A.file; if (!f || A.busy) return;
    const slug = form.querySelector('[name="slug"]').value.trim(), name = form.querySelector('[name="name"]').value.trim();
    const pin = form.querySelector('[name="pin"]').value.trim(), ex = exists(slug), rep = !!(form.querySelector('[name="rep"]') || {}).checked;
    ferr('');
    if (!SLUG_RE.test(slug)) { ferr('El nombre corto lleva de 2 a 40 letras minúsculas, números o guiones.'); return; }
    if (pin && !/^\d{6}$/.test(pin)) { ferr('El PIN tiene 6 números.'); return; }
    if (!ex && !pin) { ferr('Escriba el PIN del dueño o toque «Generar uno».'); return; }
    A.busy = true; $('#go').disabled = true;
    const app = JSON.parse(JSON.stringify(f.app)), map = {};
    let done = 0;
    try {
      for (const u of f.photos) {
        prog('Subiendo fotos: ' + (done + 1) + ' de ' + f.photos.length + '…');
        const r = await api('POST', '/api/admin/locales/' + slug + '/fotos', undefined, dataBlob(u));
        if (!r || !/^https?:\/\/\S+$/.test(r.url || '')) throw new Error('El servidor no devolvió la dirección de la foto.');
        map[u] = r.url; done++;
      }
      walk(app, function (v) { return map[v]; });
      prog('Guardando el local…');
      const body = { name: name || slug, app: app };
      if (pin) body.pin = pin;
      if (ex && rep) body.reemplazar = true;
      const r = await api('PUT', '/api/admin/locales/' + slug, body);
      A.result = { slug: slug, name: r.name || name || slug, v: r.v, pin: pin, nuevo: !ex, fotos: f.photos.length, rep: ex && rep };
      A.file = null; A.busy = false;
      try { await loadList(); } catch (e) { /* la lista se actualiza al volver a entrar */ }
      render();
      try { window.scrollTo(0, 0); } catch (e) { /* sin desplazamiento */ }
    } catch (e) {
      A.busy = false; prog('');
      if (gone(e)) return;
      $('#go').disabled = false;
      ferr((done < f.photos.length ? 'No se pudo subir la foto ' + (done + 1) + ' de ' + f.photos.length + ': ' : 'No se pudo guardar el local: ') + e.message + ' No se guardó nada del local.');
    }
  }
  async function backup(slug) {
    try {
      const data = await api('GET', '/api/admin/locales/' + slug);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      a.download = slug + '-respaldo-' + hoyISO() + '.json';
      document.body.appendChild(a); a.click();
      setTimeout(function () { try { URL.revokeObjectURL(a.href); } catch (e) { /* nada */ } a.remove(); }, 1500);
      toast('Respaldo descargado. Se puede importar en el estudio.');
    } catch (e) { if (!gone(e)) toast(e.message); }
  }
  async function savePin(form) {
    const slug = form.getAttribute('data-s'), pin = form.querySelector('[name="np"]').value.trim();
    if (!/^\d{6}$/.test(pin)) { toast('El PIN tiene 6 números.'); return; }
    try {
      await api('PUT', '/api/admin/locales/' + slug, { pin: pin });
      A.pinFor = ''; renderList();
      toast('PIN cambiado. Las sesiones abiertas de ese panel se cerraron.');
    } catch (e) { if (!gone(e)) toast(e.message); }
  }
  async function copy() {
    const r = A.result; if (!r) return;
    const text = 'Panel de ' + r.name + ': ' + panelLink(r.slug) + (r.pin ? '\nPIN: ' + r.pin : '');
    try { await navigator.clipboard.writeText(text); toast('Copiado.'); } catch (e) { toast('No se pudo copiar: cópielo a mano.'); }
  }

  /* ---------- Eventos ---------- */
  document.addEventListener('click', function (e) {
    const b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
    switch (b.getAttribute('data-a')) {
      case 'logout': A.file = null; A.result = null; showLogin(); break;
      case 'pick': { const i = $('#file'); if (i) i.click(); break; }
      case 'gen': { const i = document.getElementById(b.getAttribute('data-t')); if (i) i.value = genPin(); break; }
      case 'backup': backup(b.getAttribute('data-s')); break;
      case 'pin': A.pinFor = b.getAttribute('data-s'); renderList(); { const i = $('#np'); if (i) i.focus(); } break;
      case 'pin-x': A.pinFor = ''; renderList(); break;
      case 'copy': copy(); break;
      case 'res-x': A.result = null; renderResult(); break;
    }
  });
  document.addEventListener('change', function (e) {
    const t = e.target;
    if (t.id === 'file') { const f = t.files && t.files[0]; try { t.value = ''; } catch (err) { /* sin limpiar */ } if (f) readFile(f); }
  });
  document.addEventListener('input', function (e) { if (e.target.id === 'slug') slugState(); });
  document.addEventListener('submit', function (e) {
    const f = e.target, kind = f.getAttribute('data-form'); if (!kind) return;
    e.preventDefault();
    if (kind === 'login') { const t = f.querySelector('[name="tok"]'); login(String((t && t.value) || '').trim()); }
    if (kind === 'up') upload(f);
    if (kind === 'pin') savePin(f);
  });

  /* ---------- Arranque ---------- */
  const saved = stGet();
  if (saved) login(saved); else showLogin();
  window.__breakAdmin = { A: A, genPin: genPin };
})();
