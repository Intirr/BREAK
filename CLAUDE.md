# Break Studio

Estudio para diseñar apps de menú (cartas digitales) para cafeterías y restaurantes de Santa Rosa de Cabal, Risaralda. Un solo motor renderiza cualquier app a partir de una configuración JSON; el estudio edita esa configuración con vista previa en vivo y exporta la app final.

Todo el texto de interfaz está en español de Colombia. Escribe el código nuevo, los comentarios y los textos para el usuario en español.

## Comandos

- `npm install` — instala jsdom, jszip y qrcode-generator (solo para pruebas). Las fuentes `@fontsource/*` son opcionales: sirven para capturas locales sin acceso a Google Fonts.
- `npm run build` — une `src/` en `dist/break-studio.html` y revisa la sintaxis. Falla si el JS contiene `</script` o `<!--`.
- `npm test` — compila y corre `test/run.js` (138 pruebas en jsdom: motor, estudio y app exportada). Debe terminar en `0 fallaron`.
- `npm run demos` — genera `dist/demo-*.html`, las tres apps de ejemplo exportadas.
- `python3 test/shots.py` — capturas en Chrome con Playwright (requiere Chrome y las fuentes opcionales).
- `python3 test/overflow.py` — busca desbordes horizontales del estudio a 390 px.

## Arquitectura

Sin frameworks ni bundler: JavaScript vanilla, un solo HTML de salida.

- `src/runtime.js` — `breakApp(win, doc, cfg, opts)`. El motor completo de la app del cliente: CSS base + CSS por estética (elegante, animado, cultural), 19 módulos en `RENDER`, carrito y mensajes de WhatsApp, reservas, sellos con PIN, ruleta, trivia, i18n ES/EN y trato de usted (`ES_USTED`). **Debe ser autocontenido**: el estudio lo incrusta en cada app exportada con `breakApp.toString()`, así que no puede usar nada fuera de la función. `opts.mode` es `'preview'` (muestra avisos de ayuda) o `'app'`; `opts.now` fija la hora en pruebas.
- `src/templates.js` — `TEMPLATES` (Araucaria, Antojo, Casa Zócalo) y `blankApp()`. Solo datos.
- `src/catalog.js` — `SKINS` (paletas y valores por estética), `MODULES` (etiqueta, grupo, valores por defecto y campos del editor de cada módulo), `BRAND_FIELDS`, fuentes y etiquetas.
- `src/studio.js` — el estudio: estado `S`, editor por pestañas (Estilo, Módulos, Carta, Datos, Publicar), vista previa en un iframe escrito con `document.write`, guardado, exportación (.html, .zip para Cloudflare Pages con manifiesto, service worker e íconos, .json, QR).
- `src/studio.css`, `src/page.html` — estilos y esqueleto del estudio. `build.js` reemplaza `/*__CSS__*/` y `/*__JS__*/`.

### Configuración de una app

`{ v, id, brand{name, tagline, logo, city, address, whatsapp, hours[{d,open,close,closed}], tz, …}, i18n{bilingual, usted}, theme{skin, colors{bg,surface,ink,muted,accent,accent2,accent3}, fonts{display,body}, radius, motion, texture}, menu{categories[{id,name,icon,note,items[{id,name,desc,price,emoji,img,tags[],on}]}]}, modules[{id,type,on,s{…}}], meta{credit,url} }`

Cualquier texto admite una variante `campo_en` cuando `i18n.bilingual` está activo. Los días van con 0 = domingo. La hora siempre se calcula en `brand.tz` (America/Bogota).

### Añadir un módulo

1. Función en `RENDER` dentro de `runtime.js` (devuelve HTML; usa `esc()`/`attr()` en todo texto del usuario; en modo preview devuelve `emptyNote()` si falta contenido).
2. Entrada en `MODULES` de `catalog.js` con `label`, `code` (2 letras), `group`, `defaults` y `fields`.
3. Resumen en `summary()` de `studio.js` y, si aplica, una revisión en `checks()`.
4. Pruebas en `test/run.js`.

## Plataforma actual

El estudio se publica como Artifact de claude.ai y usa sus capacidades `db`, `user` y `downloads` (`window.claude.use(...)`). Sin ellas cae a `localStorage` y las descargas se desactivan. Si se va a servir fuera de claude.ai (por ejemplo en Cloudflare Pages), hay que reemplazar `storeInit()`/`saveFile()` en `studio.js` por un backend propio (p. ej. Cloudflare D1 o KV) y descargas con `<a download>`.

## Reglas

- Escapar todo contenido del local: las pruebas de seguridad en `test/run.js` lo verifican.
- Los mensajes de WhatsApp al local siempre van en español, aunque el cliente use la app en inglés.
- Precios en pesos colombianos, formato `$15.900` (`money()`).
- Corre `npm test` antes de dar un cambio por terminado.
