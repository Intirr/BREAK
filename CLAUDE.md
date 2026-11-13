# Break Studio

Estudio para diseñar apps de menú (cartas digitales) para cafeterías y restaurantes de Santa Rosa de Cabal, Risaralda. Un solo motor renderiza cualquier app a partir de una configuración JSON; el estudio edita esa configuración con vista previa en vivo y exporta la app final.

Todo el texto de interfaz está en español de Colombia. Escribe el código nuevo, los comentarios y los textos para el usuario en español.

## Comandos

- `npm install` — instala jsdom, jszip y qrcode-generator (solo para pruebas).
- `npm run build` — une `src/` en `dist/break-studio.html` y revisa la sintaxis. Falla si el JS contiene `</script` o `<!--`.
- `npm test` — compila y corre `test/run.js` (587 pruebas en jsdom: motor, estudio y app exportada). Debe terminar en `0 fallaron`.
- `npm run demos` — genera `dist/demo-*.html`, las siete apps de ejemplo exportadas.

Revisión visual con `test/visual.js`. Necesita Playwright con Chromium, que no está en `package.json`, y acceso a Google Fonts:

- `npm run shots` — capturas del estudio y de las apps de ejemplo en `dist/shots/`.
- `npm run visual:base` — guarda la línea base de píxeles de las apps de ejemplo. Córrelo antes de refactorizar CSS que no debe cambiar el aspecto.
- `npm run visual:compare` — compara contra la línea base y falla si cambia algún píxel.
- `npm run overflow` — busca desbordes horizontales a 390 px: en el estudio (cada pestaña, cada módulo abierto y los selectores de íconos) y en las siete apps de ejemplo. En las apps no basta el ancho del documento, porque `.app` recorta lo que se sale: revisa cada bloque.

## Arquitectura

Sin frameworks ni bundler: JavaScript vanilla, un solo HTML de salida.

- `src/runtime.js` — `breakApp(win, doc, cfg, opts)`. El motor completo de la app del cliente: CSS base + CSS por estética (elegante, animado, cultural, natural, nocturna, minimalista), 23 módulos en `RENDER`, carrito y mensajes de WhatsApp, reservas, sellos con PIN, ruleta, trivia, i18n ES/EN y trato de usted (`ES_USTED`). **Debe ser autocontenido**: el estudio lo incrusta en cada app exportada con `breakApp.toString()`, así que no puede usar nada fuera de la función. `opts.mode` es `'preview'` (muestra avisos de ayuda) o `'app'`; `opts.now` fija la hora en pruebas; `opts.assetURL(id)` (solo lo pasa el estudio) da la dirección de una foto de la biblioteca; `opts.meta` no arranca nada y devuelve las constantes del motor (tipografías, estéticas, etiquetas, íconos y la función `glyph`) para que el estudio no las repita.
  Íconos de línea: `ICONS` (dibujos de 24 × 24 con trazos que toman el color del texto), `ICON_SETS` (los que ofrece el estudio, por grupos) y `EMO_ICON` (emoji → ícono). `ico(clave)` dibuja uno; `glyph(emoji, ico, respaldo)` decide qué ve el cliente según `theme.icons`.
  Portada: `RENDER.hero` arma la portada por piezas (`variant`, `height`, `logo`, `deco`); en «auto» usa `HERO_AUTO` de cada estética. Las decoraciones (`DECO_CSS`: fachada, zócalo, lomas, neón, stickers y las ilustraciones de `ART`) están en la base para que cualquier estética las use; sus colores salen de la paleta, y `artVars()` elige el acento más verde, más azul y más rojo (`--leaf`, `--water`, `--earth`).
- `src/templates.js` — `TEMPLATES` (Araucaria, Antojo, Casa Zócalo, La Espiga, Neblina, Los Alisos, La Esquina) y `blankApp()`. Solo datos; la portada de Neblina es una ilustración SVG en base64 (`NEBLINA_IMG`), no una foto.
- `src/catalog.js` — `SKINS` (paletas, valores y muestra `art` de la tarjeta en Estilo por estética), `STYLE` (grupos, tarjetas y campos de la pestaña Estilo), `MODULES` (etiqueta, grupo, valores por defecto y campos del editor de cada módulo), `BRAND_FIELDS`, fuentes, texturas (`TEXTURES`), etiquetas y los nombres de los íconos en el selector (`ICON_NAMES`). Las texturas que necesitan el color de la paleta dentro de un SVG (hojas, ondas) se arman en `texCSS()` del motor.
- `src/studio.js` — el estudio: estado `S`, editor por pestañas (Estilo, Módulos, Carta, Datos, Publicar), vista previa en un iframe escrito con `document.write`, guardado, exportación (.html, .zip para Cloudflare Pages con manifiesto, service worker e íconos, .json, QR).
- `src/studio.css`, `src/page.html` — estilos y esqueleto del estudio. `build.js` reemplaza `/*__CSS__*/` y `/*__JS__*/`.

### Configuración de una app

`{ v, id, brand{name, tagline, logo{type,value,shape,imgPos,ico}, appIcon{content,icon,bg}, splash, legal, city, address, whatsapp, hours[{d,open,close,closed}], tz, …}, i18n{bilingual, usted}, theme{skin, colors{bg,surface,ink,muted,accent,accent2,accent3}, fonts{display,body}, radius, motion, texture, buttons, textSize, icons, roles{btn,title,kicker,price,sel,tag,top,foot}, bg{type,tint,img,imgPos,veil}, type{titleWeight,titleCase,titleSpacing,titleScale,textScale,lineHeight,priceFont}, shape{btn,btnFill,photo,chip,card,border}, nav, top{align,bg,logo,name,status}, foot{style,align,tagline,hours,social}, space{density,sep}, heads{align,orn,kicker}, carta{shape,size,pos,desc,cols,lead,price,tags,cat,catPhoto,catIcon,tabs}}, menu{categories[{id,name,icon,ico,img,imgPos,note,items[{id,name,desc,price,emoji,ico,img,imgPos,tags[],on}]}]}, modules[{id,type,on,s{…, layout, kicker, _bg, _align, _pad}}], meta{credit,url} }`

El logo (`brand.logo.type`) puede ser `mono` (iniciales), `emoji`, `icon` (un ícono de `ICONS`) o `img`; `shape` es `circulo`, `cuadrado` u `horizontal` (solo imágenes: se muestra completo y reemplaza el nombre en el encabezado). El ícono de la app (`brand.appIcon`) lleva el logo, las iniciales o un ícono sobre un color de la paleta; lo dibujan `svgIcon()` e `iconBlob()` en `studio.js`.

`theme.icons` es `emoji`, `linea` o `ninguno`; sin valor se ven emojis, como en las apps guardadas antes de los íconos. `ico` (en platos, categorías, aviso, sellos, fotos de galería y logo) es un ícono de `ICONS` elegido a mano; vacío, en modo línea se usa el que corresponde al emoji.

Una foto (`img` de platos, categorías, portada y galería; `brand.logo.value` si el logo es imagen) puede ser un enlace https, una imagen incrustada (`data:image/…`), una foto de la biblioteca (`asset:<id>`) o, solo en la app exportada en .zip, un archivo `img/<id>.webp`. Su encuadre va en la clave hermana `imgPos` (`top`, `center` o `bottom`).

Cualquier texto admite una variante `campo_en` cuando `i18n.bilingual` está activo. Los días van con 0 = domingo. La hora siempre se calcula en `brand.tz` (America/Bogota).

### Añadir un módulo

1. Función en `RENDER` dentro de `runtime.js` (devuelve HTML; usa `esc()`/`attr()` en todo texto del usuario; en modo preview devuelve `emptyNote()` si falta contenido).
2. Entrada en `MODULES` de `catalog.js` con `label`, `code` (2 letras), `group`, `defaults` y `fields`. Tipos de campo: `text`, `area`, `num`, `sel` (con `def` opcional), `bool`, `days`, `time`, `date`, `tag`, `cat`, `img` (enlace https, foto subida o de la biblioteca, con encuadre), `icon` (selector de ícono de línea; `emoji` es la clave del emoji del mismo elemento y `fb` el ícono de respaldo), `seg` (botones de opción), `thumbs` (opciones con miniatura dibujada por el motor, como la decoración de la portada), `checks` (varias opciones), `list`, `hint` y `sep`.
3. Resumen en `summary()` de `studio.js` y, si aplica, una revisión en `checks()`.
4. Pruebas en `test/run.js`.

El estudio agrega solo, al final de cada módulo menos portada y aviso, «Diseño de esta sección» (`SECTION_FIELDS` de `catalog.js`, con `modFields()` en `studio.js`) y un antetítulo si el módulo no lo trae. Por eso el título del módulo debe salir de `sh(m)`, que ya lee `s.kicker`.

### Añadir un ícono

1. Dibujo en `ICONS` de `runtime.js`: trazos en una cuadrícula de 24 × 24, sin relleno ni colores propios.
2. Si se ofrece para platos o avisos, su clave en `ICON_SETS`, su nombre en `ICON_NAMES` de `catalog.js` y, si hay emojis equivalentes, en el mapa de `EMO_ICON`.
3. Revísalo en grande y a 22 px en Chromium antes de usarlo; las pruebas verifican que cada ícono ofrecido exista y tenga nombre.

### Añadir una decoración de portada

1. Función que devuelve el SVG en `runtime.js` (junto a `araucariasSVG()`), con clases `art art-band` (franja de abajo) o `art art-scene` (escena arriba del título, se oculta con foto) y colores solo por variables en `ART_CSS`.
2. Su clave en `ART`, `HERO_DECOS` y `decoPreview()`; su nombre en `HERO_DECO_OPTS` de `catalog.js`.
3. Revísala con la paleta de las seis estéticas antes de usarla, y pruebas en `test/run.js`.

### Añadir una estética

1. Bloque en `CSS_SKIN` dentro de `runtime.js`, con selectores `[data-skin="clave"]` y colores solo por variables (`var(--accent)`, `color-mix(…)`). La decoración de portada, si la tiene, va en `RENDER.hero`.
2. Entrada en `SKINS` de `catalog.js` con `label`, `art` (texto de la muestra), `desc`, `layout`, `defaults` y `palettes`. Revisa el contraste: texto sobre fondo y sobre tarjetas de 4,5:1 o más.
3. Muestra `.sk-clave` en `studio.css` y su tipografía en el enlace de Google Fonts de `page.html`.
4. Pruebas en `test/run.js`.

### Color por elemento

Las reglas que pintan botones, títulos, antetítulos, precios, selección, etiquetas, encabezado y pie leen una variable de rol con el color de la estética como respaldo: `var(--c-btn, var(--accent))` y su texto `var(--c-btn-on, var(--on-accent))`. Solo los roles elegidos en `theme.roles` definen la variable (`roleVars()` en `tokensCSS()`), así que sin roles nada cambia. Si una regla nueva de estética pinta una de esas piezas, envuelve su color de la misma forma. `theme.bg` (liso, degradado o foto con velo) lo escribe `bgCSS()` sobre `html`.

### Encabezado, navegación y pie

`theme.nav` es `menu` (el de siempre), `barra` (barra inferior con Inicio, Carta, dos atajos y «Más»; reemplaza el botón flotante del pedido) o `pestanas` (pestañas fijas bajo el encabezado, que se llenan en `fillTabs()` con las secciones visibles). `setupNavSpy()` marca la sección que se está viendo. El encabezado transparente pone `data-scrolled` en `#bk` al bajar; las reglas que dependen de ese atributo van en `R2` dentro de `optCSS()`. El pie completo (`renderFoot()`) es el de serie; `foot.style: 'simple'` deja el de antes.

### Espaciado y diseño por sección

`theme.space` (densidad y separador entre secciones) y `theme.heads` (alineación, adorno bajo el título y ocultar antetítulos) van por la capa de opciones. Cada sección puede llevar `s._bg` (`superficie`, `tinte`, `acento` o `invertido`), `s._align` y `s._pad`; `sectionHTML()` las vuelve clases (`sb-*`, `sa-*`, `sp-*`) y, con acento o invertido, `secVars()` cambia la paleta solo dentro de la sección: los acentos se acercan al color de texto hasta leerse a 4,5:1 (`legible()`) y los colores por elemento vuelven a los de la estética. Lo elegido en una sección le gana a lo general, y junto a una sección con fondo propio no se dibuja separador.

Variantes (`s.layout`): Destacados `cuadricula` o `lista`, Promos `carrusel`, Reseñas `destacada`, Horario `compacto` (`hoursCompact()` junta los días seguidos con el mismo horario), Contacto `botones` y Agenda `linea`. Sin valor, cada módulo se ve como siempre.

### Carta

`theme.carta` ajusta la carta sin tocar sus diseños (`s.layout` del módulo: lista, tarjetas, cuadrícula, fotos grandes o compacta, que en Estilo › Carta se eligen con miniaturas de `cartaThumb()`). Sus reglas van en la última función de `OPTION_RULES` y llevan `.carta-body` delante para ganarle a las formas generales. La cuadrícula trae la descripción en la página, oculta salvo que se pida (`desc`); el ícono de la categoría siempre está y la estética decide si se ve (en lista y en las pestañas de Elegante, no). Los precios «en color» o «contorno» y las etiquetas de texto usan `legible()` contra el fondo y las tarjetas. La foto de la categoría puede ir detrás del título (`catPhoto: 'fondo'`).

### Tipografía

`theme.type` va por la capa de opciones. La escala de títulos multiplica los tamaños de `.hero-t` y `.sh-t` por `--ts`; mayúsculas y espaciado ajustan el tope que evita partir palabras (`--gwk`, `--gwl` en `.hero-box`). Los deslizadores en su valor de partida no escriben nada. La escala del texto multiplica todos los `font-size` en px con un porcentaje entero (115 % es «Letra grande»). Una tipografía que no está en `FONTS` (escrita a mano en el estudio) carga en su propio enlace, `#bk-fonts2`, para que un nombre mal escrito no rompa las demás.

### Añadir una opción de diseño

Toda opción de `theme` vale «auto» (lo que trae la estética) hasta que el usuario la cambia, así las apps guardadas no cambian solas.

1. En `runtime.js`, una función en `OPTION_RULES` que lee la opción con `opt('ruta', valorPorDefecto)` y escribe sus reglas con `rule(selectores, css)`. `optCSS()` les pone el prefijo `#bk` (el id del contenedor de la app) para que le ganen a cualquier estética sin tocar `CSS_SKIN`.
2. En `catalog.js`, un campo en una tarjeta de `STYLE` con su ruta dentro de `theme`. Tipos propios de Estilo: `seg` (botones de opción) y `range` (deslizador). `adv: true` lo deja solo para «Opciones avanzadas».
3. «Restablecer» sale solo: cada tarjeta compara sus rutas con los valores de la estética (`isDefaultAt()` en `studio.js`).
4. Pruebas en `test/run.js` y `npm run visual:compare` para confirmar que sin tocar la opción nada cambia.

## Plataforma actual

El estudio se publica como Artifact de claude.ai y usa sus capacidades `db`, `user`, `downloads` y `assets` (`window.claude.use(...)`). Sin ellas cae a `localStorage`, las descargas se desactivan y las fotos se incrustan en la app (unos 100 KB cada una).

Biblioteca de fotos (`assets`, solo para quien puede editar el Artifact): cada foto se sube aparte y la app guarda `asset:<id>`; el índice es el documento `biblioteca-fotos` de la colección de la cuenta (no es una app: `validApp()` lo ignora). `assets.list()` solo se usa para el medidor y para «Borrar fotos sin usar», que mira todas las apps y plantillas abiertas antes de borrar. Al exportar, `materialize()` trae cada foto de `/_blob/<id>`: en el .zip van como `img/…` y entran al service worker; en el .html y el .json van incrustadas. El .zip también lleva `og.png` (imagen para compartir, `ogBlob()`), que se anuncia con metaetiquetas cuando hay dirección publicada. Toda app exportada abre con una pantalla de carga (`#bk-splash`, se quita con `brand.splash: false`) que el motor retira cuando cargan las tipografías. Al importar un .json, las fotos incrustadas pasan a la biblioteca. Si se va a servir fuera de claude.ai (por ejemplo en Cloudflare Pages), hay que reemplazar `storeInit()`/`saveFile()` en `studio.js` por un backend propio (p. ej. Cloudflare D1 o KV) y descargas con `<a download>`.

## Reglas

- Escapar todo contenido del local: las pruebas de seguridad en `test/run.js` lo verifican.
- Los mensajes de WhatsApp al local siempre van en español, aunque el cliente use la app en inglés.
- Precios en pesos colombianos, formato `$15.900` (`money()`).
- Corre `npm test` antes de dar un cambio por terminado.
- Antes de mover CSS que no debe cambiar el aspecto, `npm run visual:compare` debe dar las siete apps idénticas.
