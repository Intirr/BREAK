/* Break · servidor del panel en tu computador, sin Cloudflare: el mismo Worker sobre Node, con KV y fotos en memoria
   (se pierden al cerrarlo). Sirve para probar el panel antes de publicarlo.
     node worker/local.mjs                 → http://localhost:8787/panel/antojo  (PIN 123456)
     node worker/local.mjs --puerto 9000 --app dist/mi-app.html --local antojo --plantilla tpl-antojo
   Con --app, sirve también esa app exportada en /app (para ver los cambios en la app real). */
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url)), root = join(here, '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = +arg('puerto', 8787), SLUG = arg('local', 'antojo'), TPL = arg('plantilla', 'tpl-antojo'), APP = arg('app', '');
const PIN = arg('pin', '123456');

execFileSync(process.execPath, [join(root, 'build.js')], { stdio: 'ignore' });
execFileSync(process.execPath, [join(here, 'build.mjs')], { stdio: 'ignore' });
const { handle } = await import('./src/index.js');

class KV {
  constructor() { this.m = new Map(); }
  async get(k, t) { const v = this.m.get(k); if (v == null) return null; return (t === 'json' || (t && t.type === 'json')) ? JSON.parse(v) : v; }
  async put(k, v) { this.m.set(k, String(v)); }
  async delete(k) { this.m.delete(k); }
  async list(o) { return { keys: [...this.m.keys()].filter(k => k.startsWith((o && o.prefix) || '')).map(name => ({ name })) }; }
}
class R2 {
  constructor() { this.m = new Map(); }
  async put(k, b, o) { this.m.set(k, { b: new Uint8Array(b), o }); }
  async get(k) { const x = this.m.get(k); return x ? { body: x.b, writeHttpMetadata: h => h.set('Content-Type', x.o.httpMetadata.contentType) } : null; }
}
const env = { DATA: new KV(), FOTOS: new R2(), SESSION_SECRET: 'solo-para-pruebas-locales', ADMIN_TOKEN: 'local' };

/* Local de ejemplo, con una de las apps de ejemplo del estudio. */
const ctx = {}; vm.createContext(ctx);
vm.runInContext(readFileSync(join(root, 'src', 'templates.js'), 'utf8') + ';this.T=TEMPLATES;', ctx);
const app = JSON.parse(JSON.stringify(ctx.T.find(t => t.id === TPL) || ctx.T[0]));
app.meta = Object.assign({}, app.meta, { panel: { api: 'http://localhost:' + PORT, slug: SLUG } });
await handle(new Request('http://localhost/api/admin/locales/' + SLUG, { method: 'PUT', headers: { Authorization: 'Bearer local', 'Content-Type': 'application/json' }, body: JSON.stringify({ name: app.brand.name, pin: PIN, app }) }), env, {});

http.createServer(async (req, res) => {
  try {
    if (APP && (req.url === '/app' || req.url === '/app/')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(readFileSync(resolve(APP))); return;
    }
    const chunks = []; for await (const c of req) chunks.push(c);
    const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const r = await handle(new Request('http://localhost:' + PORT + req.url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body }), env, { waitUntil() {} });
    const h = {}; r.headers.forEach((v, k) => { h[k] = v; });
    res.writeHead(r.status, h);
    res.end(Buffer.from(await r.arrayBuffer()));
  } catch (e) { res.writeHead(500); res.end(String(e && e.message)); }
}).listen(PORT, () => {
  console.log('Panel de prueba: http://localhost:' + PORT + '/panel/' + SLUG + '  (PIN ' + PIN + ')');
  if (APP && existsSync(resolve(APP))) console.log('App: http://localhost:' + PORT + '/app');
});
