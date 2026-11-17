/* Break · servidor del panel del local (Cloudflare Worker).

   Un solo servidor atiende a todos los locales. Guarda en KV (DATA):
     local:<slug>      nombre, PIN cifrado y versión de sesión de cada local
     app:<slug>        la app completa que publicó el estudio (diseño + carta de respaldo), para la vista previa del panel
     contenido:<slug>  { v, at, contenido }: lo que el dueño puede cambiar (carta, promos, avisos, horario…)
     hist:<slug>       las 10 versiones anteriores, para «Deshacer»
     tries:<slug>:<ip> intentos fallidos de PIN (se borran solos a los 15 minutos)
   y las fotos en R2 (FOTOS), en <slug>/<nombre>.<ext>.

   Seguridad:
   - El contenido pasa siempre por sanitizeContenido(), el mismo saneador de la app (src/runtime.js).
   - El PIN se guarda como HMAC con SESSION_SECRET, que no vive en KV: quien lea KV no puede probar PINes sin el
     secreto. El límite de 5 intentos cada 15 minutos protege la entrada (un PBKDF2 fuerte no cabe en los 10 ms
     de CPU del plan gratis).
   - Las sesiones son tokens firmados (no cookies), así que CORS abierto no expone nada: sin token no se escribe.
   - La administración (/admin) usa ADMIN_TOKEN: crear locales, cambiar el PIN, subir la app y sus fotos y
     descargar respaldos. La clave se escribe en esa página; nunca pasa por el estudio. */
import { RT } from './runtime-meta.js';
import { PANEL_HTML, ADMIN_HTML } from './panel-html.js';

const SLUG = '([a-z0-9-]{2,40})';
const MAX_CONT = 300 * 1024, MAX_APP = 2 * 1024 * 1024, MAX_FOTO = 2 * 1024 * 1024;
const HIST = 10, TRIES = 5, TRIES_TTL = 900, SES_HORAS = 12;
const FOTOS = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' };
const CORS = {
  'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Max-Age': '86400'
};

class HttpError extends Error { constructor(status, msg, extra) { super(msg); this.status = status; this.extra = extra; } }
const enc = new TextEncoder();

function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status: status || 200, headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, CORS, headers || {}) });
}
function b64u(bytes) { let s = ''; new Uint8Array(bytes).forEach(b => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function unb64u(s) { return atob(String(s).replace(/-/g, '+').replace(/_/g, '/')); }
function rand(n) { const a = new Uint8Array(n); crypto.getRandomValues(a); return [...a].map(b => b.toString(16).padStart(2, '0')).join(''); }
async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}
/* Comparación en tiempo constante: no deja adivinar un token letra por letra midiendo cuánto tarda. */
function same(a, b) {
  a = String(a || ''); b = String(b || '');
  let d = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return d === 0;
}
const pinHash = (env, salt, pin) => hmac(env.SESSION_SECRET, 'pin:' + salt + ':' + pin);

/* Sesión: { s: slug, v: versión de sesión del local, e: vence } firmado. Cambiar el PIN sube la versión y cierra
   todas las sesiones abiertas de ese local. */
export async function firmarSesion(env, slug, sv, exp) {
  const p = b64u(enc.encode(JSON.stringify({ s: slug, v: sv, e: exp })));
  return p + '.' + await hmac(env.SESSION_SECRET, 'ses:' + p);
}
async function sesion(request, env, slug) {
  const m = /^Bearer\s+([\w-]+)\.([\w-]+)$/.exec(request.headers.get('Authorization') || '');
  if (!m || !same(m[2], await hmac(env.SESSION_SECRET, 'ses:' + m[1]))) throw new HttpError(401, 'Vuelva a entrar con el PIN.');
  let d; try { d = JSON.parse(unb64u(m[1])); } catch (e) { throw new HttpError(401, 'Vuelva a entrar con el PIN.'); }
  const local = await env.DATA.get('local:' + slug, 'json');
  if (!local || d.s !== slug || d.v !== local.sv || !(d.e > Date.now())) throw new HttpError(401, 'La sesión terminó. Vuelva a entrar con el PIN.');
  return local;
}
function admin(request, env) {
  const m = /^Bearer\s+(.+)$/.exec(request.headers.get('Authorization') || '');
  if (!m || !same(m[1], env.ADMIN_TOKEN)) throw new HttpError(401, 'Clave de administración incorrecta.');
}
async function readBody(request, max, tooBig) {
  if (+(request.headers.get('Content-Length') || 0) > max) throw new HttpError(413, tooBig);
  const buf = await request.arrayBuffer();
  if (buf.byteLength > max) throw new HttpError(413, tooBig);
  return buf;
}
async function readJSON(request, max) {
  const buf = await readBody(request, max, 'El contenido es demasiado grande.');
  try { return JSON.parse(new TextDecoder().decode(buf)); } catch (e) { throw new HttpError(400, 'El contenido no se pudo leer.'); }
}
function contenidoURL(request, slug) { return new URL('/api/' + slug + '/contenido', request.url).toString(); }
async function purgar(request, slug) {
  if (typeof caches === 'undefined') return;
  try { await caches.default.delete(contenidoURL(request, slug)); } catch (e) { /* la copia del borde vence sola en 30 s */ }
}
/* Guarda una versión nueva y deja la anterior en el historial. */
async function guardar(env, slug, contenido, cur) {
  const clean = RT.sanitizeContenido(contenido);
  if (JSON.stringify(clean).length > MAX_CONT) throw new HttpError(413, 'La carta es demasiado grande.');
  const next = { v: (cur ? cur.v : 0) + 1, at: new Date().toISOString(), contenido: clean };
  if (cur) {
    const hist = (await env.DATA.get('hist:' + slug, 'json')) || [];
    hist.unshift(cur);
    await env.DATA.put('hist:' + slug, JSON.stringify(hist.slice(0, HIST)));
  }
  await env.DATA.put('contenido:' + slug, JSON.stringify(next));
  return next;
}

/* ---------- Rutas públicas ---------- */
async function leerContenido(request, env, ctx, slug) {
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  if (cache) { const hit = await cache.match(contenidoURL(request, slug)); if (hit) return hit; }
  const doc = await env.DATA.get('contenido:' + slug, 'json');
  if (!doc) throw new HttpError(404, 'Este local no tiene contenido publicado.');
  const etag = '"' + doc.v + '"';
  if (request.headers.get('If-None-Match') === etag) return new Response(null, { status: 304, headers: Object.assign({ ETag: etag }, CORS) });
  const res = json(doc, 200, { 'Cache-Control': 'public, max-age=30', ETag: etag });
  if (cache && ctx && ctx.waitUntil) ctx.waitUntil(cache.put(contenidoURL(request, slug), res.clone()));
  return res;
}
async function verFoto(env, key) {
  const obj = await env.FOTOS.get(key);
  if (!obj) throw new HttpError(404, 'No existe esa foto.');
  const h = new Headers(CORS);
  if (obj.writeHttpMetadata) obj.writeHttpMetadata(h);
  h.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(obj.body, { headers: h });
}

/* ---------- Entrada con PIN ---------- */
async function entrar(request, env, slug) {
  const local = await env.DATA.get('local:' + slug, 'json');
  if (!local || !local.pin) throw new HttpError(404, 'No existe ese local.');
  const ip = request.headers.get('CF-Connecting-IP') || 'x', tk = 'tries:' + slug + ':' + ip;
  const n = +(await env.DATA.get(tk)) || 0;
  if (n >= TRIES) throw new HttpError(429, 'Demasiados intentos. Espere 15 minutos y vuelva a probar.');
  const body = await readJSON(request, 1024), pin = String(body && body.pin || '');
  if (!/^\d{6}$/.test(pin) || !same(await pinHash(env, local.salt, pin), local.pin)) {
    await env.DATA.put(tk, String(n + 1), { expirationTtl: TRIES_TTL });
    throw new HttpError(401, n + 1 >= TRIES ? 'PIN incorrecto. Espere 15 minutos y vuelva a probar.' : 'PIN incorrecto.');
  }
  if (n) await env.DATA.delete(tk);
  const exp = Date.now() + SES_HORAS * 3600000;
  return json({ token: await firmarSesion(env, slug, local.sv, exp), exp: exp, name: local.name || slug });
}

/* ---------- Rutas del panel (con sesión) ---------- */
async function datosPanel(env, slug, local) {
  return json({ name: local.name || slug, app: await env.DATA.get('app:' + slug, 'json'), doc: await env.DATA.get('contenido:' + slug, 'json') });
}
async function cambiarContenido(request, env, slug) {
  const body = await readJSON(request, MAX_CONT * 2);
  const cur = await env.DATA.get('contenido:' + slug, 'json');
  if (cur && body.base !== cur.v) throw new HttpError(409, 'Alguien guardó cambios antes que usted. Se cargó la versión más reciente.', { doc: cur });
  const next = await guardar(env, slug, body.contenido, cur);
  await purgar(request, slug);
  return json(next);
}
async function deshacer(request, env, slug) {
  const hist = (await env.DATA.get('hist:' + slug, 'json')) || [];
  const cur = await env.DATA.get('contenido:' + slug, 'json');
  if (!hist.length || !cur) throw new HttpError(409, 'No hay cambios para deshacer.');
  const prev = hist.shift();
  const next = { v: cur.v + 1, at: new Date().toISOString(), contenido: prev.contenido };
  await env.DATA.put('contenido:' + slug, JSON.stringify(next));
  await env.DATA.put('hist:' + slug, JSON.stringify(hist));
  await purgar(request, slug);
  return json(next);
}
async function historial(env, slug) {
  const hist = (await env.DATA.get('hist:' + slug, 'json')) || [];
  return json({ versiones: hist.map(h => ({ v: h.v, at: h.at })) });
}
/* Las fotos se revisan por su tipo y por sus primeros bytes, no solo por lo que dice el navegador. */
function esImagen(ext, b) {
  if (ext === 'jpg') return b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF;
  if (ext === 'png') return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47;
  return String.fromCharCode(b[0], b[1], b[2], b[3]) === 'RIFF' && String.fromCharCode(b[8], b[9], b[10], b[11]) === 'WEBP';
}
/* Nombre de una foto: los primeros 24 caracteres de su huella SHA-256. La misma foto queda siempre en la misma
   dirección, así que volver a subirla (al actualizar un local) no la duplica. */
async function huella(buf) { const h = new Uint8Array(await crypto.subtle.digest('SHA-256', buf)); return [...h].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 24); }
async function subirFoto(request, env, slug) {
  const ct = String(request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase(), ext = FOTOS[ct];
  if (!ext) throw new HttpError(415, 'Solo se pueden subir fotos JPG, PNG o WebP.');
  const buf = await readBody(request, MAX_FOTO, 'La foto pesa más de 2 MB.');
  if (!esImagen(ext, new Uint8Array(buf))) throw new HttpError(415, 'El archivo no es una foto válida.');
  const key = slug + '/' + await huella(buf) + '.' + ext;
  await env.FOTOS.put(key, buf, { httpMetadata: { contentType: ct } });
  return json({ url: new URL('/fotos/' + key, request.url).toString() });
}

/* ---------- Administración (estudio) ---------- */
async function adminLocal(request, env, slug) {
  const body = await readJSON(request, MAX_APP + MAX_CONT);
  const local = (await env.DATA.get('local:' + slug, 'json')) || { slug: slug, creado: new Date().toISOString(), sv: 0 };
  if (body.name != null) local.name = String(body.name).slice(0, 80);
  if (body.pin != null) {
    if (!/^\d{6}$/.test(String(body.pin))) throw new HttpError(400, 'El PIN debe tener 6 números.');
    local.salt = rand(16); local.pin = await pinHash(env, local.salt, String(body.pin)); local.sv = (local.sv || 0) + 1;
  }
  if (!local.pin) throw new HttpError(400, 'Falta el PIN de 6 números para este local.');
  if (body.app != null) {
    if (typeof body.app !== 'object' || JSON.stringify(body.app).length > MAX_APP) throw new HttpError(413, 'La app es demasiado grande.');
    await env.DATA.put('app:' + slug, JSON.stringify(body.app));
  }
  const cur = await env.DATA.get('contenido:' + slug, 'json');
  /* Sin contenido todavía, el de la app es el inicial. Con «reemplazar», el de la app pisa los cambios del dueño. */
  const src = body.contenido || ((!cur || body.reemplazar === true) && body.app ? RT.contenidoOf(body.app) : null);
  const doc = src ? await guardar(env, slug, src, cur) : cur;
  if (src) await purgar(request, slug);
  await env.DATA.put('local:' + slug, JSON.stringify(local));
  return json({ slug: slug, name: local.name || slug, v: doc ? doc.v : 0 });
}
async function adminLista(env) {
  const r = await env.DATA.list({ prefix: 'local:' }), locales = [];
  for (const k of r.keys) { const l = await env.DATA.get(k.name, 'json'), slug = k.name.slice(6); locales.push({ slug: slug, name: (l && l.name) || slug }); }
  locales.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  return json({ locales: locales });
}
/* Respaldo de un local: la app con el contenido actual del dueño, en el formato que importa el estudio. Sin el PIN. */
async function adminRespaldo(env, slug) {
  const local = await env.DATA.get('local:' + slug, 'json');
  if (!local) throw new HttpError(404, 'No existe ese local.');
  const app = await env.DATA.get('app:' + slug, 'json'), doc = await env.DATA.get('contenido:' + slug, 'json');
  return json({
    format: 'break-app', version: 1, app: app && doc ? RT.mergeContenido(app, doc.contenido) : app,
    local: { slug: slug, name: local.name || slug, creado: local.creado || '' }, contenido: doc
  });
}

function pagina(html, falta) {
  if (!html) throw new HttpError(404, falta);
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex' } });
}
function panelPage() { return pagina(PANEL_HTML, 'El panel todavía no está instalado en este servidor.'); }

export async function handle(request, env, ctx) {
  try {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (!env.SESSION_SECRET || !env.ADMIN_TOKEN || !env.DATA) throw new HttpError(500, 'Falta configurar el servidor (KV y secretos).');
    const url = new URL(request.url), p = url.pathname.replace(/\/+$/, '') || '/', m = request.method;
    let r;
    if ((r = new RegExp('^/api/' + SLUG + '/contenido$').exec(p))) {
      if (m === 'GET') return await leerContenido(request, env, ctx, r[1]);
      if (m === 'PUT') { await sesion(request, env, r[1]); return await cambiarContenido(request, env, r[1]); }
    }
    if ((r = new RegExp('^/api/' + SLUG + '/entrar$').exec(p)) && m === 'POST') return await entrar(request, env, r[1]);
    if ((r = new RegExp('^/api/' + SLUG + '/panel$').exec(p)) && m === 'GET') return await datosPanel(env, r[1], await sesion(request, env, r[1]));
    if ((r = new RegExp('^/api/' + SLUG + '/deshacer$').exec(p)) && m === 'POST') { await sesion(request, env, r[1]); return await deshacer(request, env, r[1]); }
    if ((r = new RegExp('^/api/' + SLUG + '/historial$').exec(p)) && m === 'GET') { await sesion(request, env, r[1]); return await historial(env, r[1]); }
    if ((r = new RegExp('^/api/' + SLUG + '/fotos$').exec(p)) && m === 'POST') {
      if (!env.FOTOS) throw new HttpError(500, 'Falta configurar el almacenamiento de fotos (R2).');
      await sesion(request, env, r[1]); return await subirFoto(request, env, r[1]);
    }
    if ((r = new RegExp('^/fotos/(' + SLUG.slice(1, -1) + '/[0-9a-f]{24}\\.(webp|jpg|png))$').exec(p)) && m === 'GET') {
      if (!env.FOTOS) throw new HttpError(404, 'No existe esa foto.');
      return await verFoto(env, r[1]);
    }
    if (p === '/api/admin/locales' && m === 'GET') { admin(request, env); return await adminLista(env); }
    if ((r = new RegExp('^/api/admin/locales/' + SLUG + '/fotos$').exec(p)) && m === 'POST') {
      admin(request, env);
      if (!env.FOTOS) throw new HttpError(500, 'Falta configurar el almacenamiento de fotos (R2).');
      return await subirFoto(request, env, r[1]);
    }
    if ((r = new RegExp('^/api/admin/locales/' + SLUG + '$').exec(p)) && m === 'GET') { admin(request, env); return await adminRespaldo(env, r[1]); }
    if ((r = new RegExp('^/api/admin/locales/' + SLUG + '$').exec(p)) && m === 'PUT') { admin(request, env); return await adminLocal(request, env, r[1]); }
    if (new RegExp('^/panel/' + SLUG + '$').test(p) && m === 'GET') return panelPage();
    if (p === '/admin' && m === 'GET') return pagina(ADMIN_HTML, 'La administración todavía no está instalada en este servidor.');
    if (p === '/') return new Response('Break · servidor del panel del local', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    throw new HttpError(404, 'No existe esa dirección.');
  } catch (e) {
    if (e instanceof HttpError) return json(Object.assign({ error: e.message }, e.extra || {}), e.status);
    return json({ error: 'Error del servidor. Intente de nuevo.' }, 500);
  }
}

export default { fetch: handle };
