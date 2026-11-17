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

/* El panel del local (dist/break-panel.html), si ya está compilado, va dentro del servidor como texto. */
const panel = join(here, '..', 'dist', 'break-panel.html');
const html = existsSync(panel) ? readFileSync(panel, 'utf8') : '';
writeFileSync(join(here, 'src', 'panel-html.js'), '/* Generado por worker/build.mjs: no editar. */\nexport const PANEL_HTML = ' + JSON.stringify(html) + ';\n');
console.log('worker/src/runtime-meta.js y panel-html.js listos' + (html ? '' : ' (sin panel compilado todavía)'));
