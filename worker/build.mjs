/* Break · prepara el servidor del panel: copia el motor (src/runtime.js) en src/runtime-meta.js para que el
   servidor valide el contenido con el mismo saneador que la app y el panel. Lo corre wrangler antes de publicar
   (ver wrangler.toml) y npm test antes de las pruebas. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '..', 'src', 'runtime.js'), 'utf8');
const out = '/* Generado por worker/build.mjs desde src/runtime.js: no editar. */\n' +
  'const breakApp = (function () {\n' + src + '\nreturn breakApp;\n})();\n' +
  'export const RT = breakApp(null, null, null, { meta: true });\n';
writeFileSync(join(here, 'src', 'runtime-meta.js'), out);

/* El panel del local y la administración (dist/break-panel.html y dist/break-admin.html), si ya están
   compilados, van dentro del servidor como texto. */
const page = f => { const p = join(here, '..', 'dist', f); return existsSync(p) ? readFileSync(p, 'utf8') : ''; };
const html = page('break-panel.html'), admin = page('break-admin.html');
writeFileSync(join(here, 'src', 'panel-html.js'), '/* Generado por worker/build.mjs: no editar. */\nexport const PANEL_HTML = ' + JSON.stringify(html) + ';\n' +
  'export const ADMIN_HTML = ' + JSON.stringify(admin) + ';\n');
console.log('worker/src/runtime-meta.js y panel-html.js listos' + (html && admin ? '' : ' (falta compilar el panel o la administración: npm run build)'));
