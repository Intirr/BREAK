/* Break · catálogo del estudio: estéticas, módulos y campos de edición. */
const SKINS = {
  elegante: {
    label: 'Elegante', art: 'Cena', desc: 'Serif de alto contraste, filetes finos y mucho aire. Para cocina de autor y cenas.', layout: 'lista',
    defaults: { colors: { bg: '#111412', surface: '#191D1A', ink: '#EDE7DA', muted: '#A3A89D', accent: '#C8A46A', accent2: '#7FA088', accent3: '#8E6F4E' }, fonts: { display: 'Bodoni Moda', body: 'Jost' }, radius: 2, motion: 'suave', texture: 'grano', icons: 'linea' },
    palettes: [
      { name: 'Noche de pino', colors: { bg: '#111412', surface: '#191D1A', ink: '#EDE7DA', muted: '#A3A89D', accent: '#C8A46A', accent2: '#7FA088', accent3: '#8E6F4E' } },
      { name: 'Vino', colors: { bg: '#1A0F12', surface: '#26161B', ink: '#F1E6E2', muted: '#B39A9F', accent: '#D9A56B', accent2: '#C26B7C', accent3: '#6E3B47' } },
      { name: 'Lino', colors: { bg: '#F3F2EE', surface: '#FFFFFF', ink: '#1E1B18', muted: '#6F6A62', accent: '#7A5A2E', accent2: '#4F6B5A', accent3: '#A88B5E' } },
      { name: 'Cacao', colors: { bg: '#17110D', surface: '#211913', ink: '#F1E7DA', muted: '#B6A592', accent: '#D4A26A', accent2: '#9DB08A', accent3: '#A4674A' } },
      { name: 'Bruma', colors: { bg: '#ECEFEE', surface: '#FFFFFF', ink: '#1A2224', muted: '#56636A', accent: '#2F5D62', accent2: '#8A6B3F', accent3: '#7C8E93' } }
    ]
  },
  animado: {
    label: 'Animado', art: '¡Antojo!', desc: 'Colores vivos, bordes gruesos y movimiento. Para cafés, brunch y comida rápida.', layout: 'cuadricula',
    defaults: { colors: { bg: '#FFE36E', surface: '#FFFDF6', ink: '#1D1A1B', muted: '#5E5646', accent: '#FF5A36', accent2: '#2EBFA5', accent3: '#FF9BC8' }, fonts: { display: 'Lilita One', body: 'Nunito' }, radius: 18, motion: 'vivo', texture: 'puntos', icons: 'emoji' },
    palettes: [
      { name: 'Mango', colors: { bg: '#FFE36E', surface: '#FFFDF6', ink: '#1D1A1B', muted: '#5E5646', accent: '#FF5A36', accent2: '#2EBFA5', accent3: '#FF9BC8' } },
      { name: 'Hierbabuena', colors: { bg: '#B9F0DB', surface: '#FFFFFF', ink: '#13201B', muted: '#3E5A50', accent: '#FF6B4A', accent2: '#6D6BFF', accent3: '#FFD23F' } },
      { name: 'Mora', colors: { bg: '#E7D8FF', surface: '#FFFFFF', ink: '#1B1530', muted: '#5A4E78', accent: '#FF4F8B', accent2: '#21BF9C', accent3: '#FFC93C' } },
      { name: 'Sandía', colors: { bg: '#FFD3D0', surface: '#FFF9F8', ink: '#241417', muted: '#634348', accent: '#13915F', accent2: '#E8344A', accent3: '#FFD23F' } },
      { name: 'Cielo', colors: { bg: '#BFE3FF', surface: '#FFFFFF', ink: '#10213A', muted: '#3D5170', accent: '#FF7A1A', accent2: '#6E5BFF', accent3: '#FFD23F' } }
    ]
  },
  cultural: {
    label: 'Cultural', art: 'Fonda', desc: 'Fachada de bahareque, zócalos pintados y letrero de fonda. Para cocina típica y turismo.', layout: 'tarjetas',
    defaults: { colors: { bg: '#F9F8F4', surface: '#FFFFFF', ink: '#2B2320', muted: '#6E625B', accent: '#C2362A', accent2: '#2E6B4F', accent3: '#2B5C9E' }, fonts: { display: 'Alfa Slab One', body: 'Alegreya Sans' }, radius: 6, motion: 'suave', texture: 'none', icons: 'linea' },
    palettes: [
      { name: 'Zócalo', colors: { bg: '#F9F8F4', surface: '#FFFFFF', ink: '#2B2320', muted: '#6E625B', accent: '#C2362A', accent2: '#2E6B4F', accent3: '#2B5C9E' } },
      { name: 'Cafetal', colors: { bg: '#F3F6F0', surface: '#FFFFFF', ink: '#1F2A22', muted: '#5C6B60', accent: '#B5462E', accent2: '#2F5E3A', accent3: '#C98A1B' } },
      { name: 'Fonda de noche', colors: { bg: '#2A1E17', surface: '#382920', ink: '#F6EEDF', muted: '#C9B8A3', accent: '#E8573B', accent2: '#3F8F6B', accent3: '#F1B635' } },
      { name: 'Balcón azul', colors: { bg: '#F3F6FA', surface: '#FFFFFF', ink: '#1E2633', muted: '#5D6878', accent: '#1F57A5', accent2: '#C2362A', accent3: '#E3A92B' } },
      { name: 'Guadua', colors: { bg: '#F5F0E1', surface: '#FFFDF7', ink: '#2A2519', muted: '#6B6350', accent: '#66751A', accent2: '#8E4B2A', accent3: '#C7952B' } }
    ]
  },
  natural: {
    label: 'Natural', art: 'Cosecha', desc: 'Papel kraft, hojas de café y lomas sembradas; esquinas suaves y una serif cálida. Para cafés, panaderías y restaurantes campestres.', layout: 'tarjetas',
    defaults: { colors: { bg: '#E3D3B4', surface: '#F8F1E4', ink: '#2A2117', muted: '#62513C', accent: '#4E6130', accent2: '#963322', accent3: '#C98B2B' }, fonts: { display: 'Young Serif', body: 'Karla' }, radius: 16, motion: 'suave', texture: 'papel', icons: 'linea' },
    palettes: [
      { name: 'Kraft', colors: { bg: '#E3D3B4', surface: '#F8F1E4', ink: '#2A2117', muted: '#62513C', accent: '#4E6130', accent2: '#963322', accent3: '#C98B2B' } },
      { name: 'Huerta', colors: { bg: '#E6EBDD', surface: '#FAFBF5', ink: '#1D2618', muted: '#56624C', accent: '#9E3426', accent2: '#3F6A35', accent3: '#D6A23A' } },
      { name: 'Tostión', colors: { bg: '#2A1F18', surface: '#372920', ink: '#F2E6D6', muted: '#C3AE95', accent: '#D9A35F', accent2: '#9DBB7A', accent3: '#D0644A' } },
      { name: 'Salvia', colors: { bg: '#DFE5DA', surface: '#F6F8F3', ink: '#1F2620', muted: '#505C50', accent: '#4E6E4D', accent2: '#9A4E2A', accent3: '#C9A04A' } },
      { name: 'Arcilla', colors: { bg: '#EAD9CC', surface: '#FAF3EC', ink: '#2B1D16', muted: '#654D41', accent: '#9C4627', accent2: '#4F6B3A', accent3: '#D9A441' } }
    ]
  },
  nocturna: {
    label: 'Nocturna', art: 'Neón', desc: 'Fondo de noche, letrero de neón que dice si está abierto y brillos de color. Para bares, gastrobares y comida rápida hasta tarde.', layout: 'tarjetas',
    defaults: { colors: { bg: '#0E0B16', surface: '#181427', ink: '#F4F1FF', muted: '#A9A3C4', accent: '#FF4F9A', accent2: '#2EE6C8', accent3: '#FFC247' }, fonts: { display: 'Tilt Neon', body: 'Barlow' }, radius: 12, motion: 'vivo', texture: 'none', icons: 'emoji' },
    palettes: [
      { name: 'Neón', colors: { bg: '#0E0B16', surface: '#181427', ink: '#F4F1FF', muted: '#A9A3C4', accent: '#FF4F9A', accent2: '#2EE6C8', accent3: '#FFC247' } },
      { name: 'Ámbar', colors: { bg: '#120E0A', surface: '#1F1912', ink: '#FFF4E2', muted: '#C4AE8F', accent: '#FFB238', accent2: '#FF6A3D', accent3: '#7EE0D2' } },
      { name: 'Eléctrica', colors: { bg: '#060A18', surface: '#101833', ink: '#EEF3FF', muted: '#9CA8CC', accent: '#4D8DFF', accent2: '#B6FF3B', accent3: '#FF5EDB' } },
      { name: 'Jungla', colors: { bg: '#07130E', surface: '#0F2018', ink: '#ECFFF4', muted: '#9CC2AE', accent: '#3DFF8B', accent2: '#FFE53D', accent3: '#FF5E8A' } },
      { name: 'Rubí', colors: { bg: '#13070B', surface: '#211017', ink: '#FFEFF2', muted: '#C9A3AC', accent: '#FF2E55', accent2: '#FFC93D', accent3: '#9B6BFF' } }
    ]
  },
  minimalista: {
    label: 'Minimalista', art: 'Menú', desc: 'Líneas finas, letra grotesca grande y un solo color de acento. Para cafés de especialidad y cocinas modernas.', layout: 'lista',
    defaults: { colors: { bg: '#FAFAF8', surface: '#F0F0EC', ink: '#141413', muted: '#66655E', accent: '#2445D6', accent2: '#141413', accent3: '#C9C8C0' }, fonts: { display: 'Schibsted Grotesk', body: 'Instrument Sans' }, radius: 2, motion: 'suave', texture: 'none', icons: 'linea' },
    palettes: [
      { name: 'Blanco', colors: { bg: '#FAFAF8', surface: '#F0F0EC', ink: '#141413', muted: '#66655E', accent: '#2445D6', accent2: '#141413', accent3: '#C9C8C0' } },
      { name: 'Hueso', colors: { bg: '#F2EEE6', surface: '#FFFFFF', ink: '#1A1917', muted: '#6A665D', accent: '#B23A1E', accent2: '#1A1917', accent3: '#CFC8BA' } },
      { name: 'Carbón', colors: { bg: '#121212', surface: '#1C1C1B', ink: '#F1F0EC', muted: '#A3A29B', accent: '#E8C547', accent2: '#F1F0EC', accent3: '#3A3A38' } },
      { name: 'Menta', colors: { bg: '#F3F8F6', surface: '#E6F0EC', ink: '#0F1A16', muted: '#52625B', accent: '#00785E', accent2: '#0F1A16', accent3: '#BFD3CB' } },
      { name: 'Acero', colors: { bg: '#E9ECEF', surface: '#DEE2E6', ink: '#14181C', muted: '#545B62', accent: '#C2410C', accent2: '#14181C', accent3: '#B9C0C7' } }
    ]
  }
};

const DISPLAY_FONTS = ['Bodoni Moda', 'Cormorant Garamond', 'Playfair Display', 'DM Serif Display', 'Fraunces', 'Young Serif', 'Yeseva One', 'Abril Fatface', 'Lilita One', 'Fredoka', 'Baloo 2', 'Pacifico', 'Caveat', 'Tilt Neon', 'Bricolage Grotesque', 'Schibsted Grotesk', 'Archivo Black', 'Oswald', 'Alfa Slab One'];
const BODY_FONTS = ['Jost', 'Nunito', 'Alegreya Sans', 'DM Sans', 'Work Sans', 'Karla', 'Libre Franklin', 'Figtree', 'Barlow', 'Instrument Sans', 'Rubik', 'Outfit', 'Lora', 'Source Serif 4'];
/* Detalle de fondo de la app: [clave, nombre en el estudio]. */
const TEXTURES = [['none', 'Ninguno'], ['grano', 'Grano'], ['papel', 'Papel'], ['puntos', 'Puntos'], ['rayas', 'Rayas'], ['cuadros', 'Mantel'], ['hojas', 'Hojas'], ['ondas', 'Ondas'], ['zocalo', 'Zócalo']];
const COLOR_KEYS = [['bg', 'Fondo'], ['surface', 'Tarjetas'], ['ink', 'Texto'], ['muted', 'Texto suave'], ['accent', 'Acento'], ['accent2', 'Acento 2'], ['accent3', 'Acento 3']];
const TAGS = [['chef', 'Recomendado'], ['popular', 'Favorito'], ['nuevo', 'Nuevo'], ['temporada', 'De temporada'], ['local', 'De la región'], ['compartir', 'Para compartir'], ['ninos', 'Para niños'], ['vegano', 'Vegano'], ['vegetariano', 'Vegetariano'], ['singluten', 'Sin gluten'], ['sinlactosa', 'Sin lactosa'], ['picante', 'Picante']];
const CTA_OPTS = [['carta', 'Ver la carta'], ['reservas', 'Reservar mesa'], ['pedido', 'Hacer un pedido'], ['sellos', 'Tarjeta de sellos'], ['ubicacion', 'Cómo llegar'], ['eventos', 'Ver la agenda'], ['whatsapp', 'Escribir por WhatsApp'], ['none', 'Ninguno']];
/* Pestaña Estilo: grupos → tarjetas → campos, con rutas dentro de theme.
   - `card` nombra un dibujo propio del estudio (estéticas, colores, tipografías, texturas); las demás tarjetas se pintan campo por campo.
   - `keys` son las rutas que la tarjeta controla, para «Restablecer»; si falta, se usan las de sus campos.
   - `adv: true` en una tarjeta o en un campo lo deja solo para «Opciones avanzadas».
   Una opción sin valor, o con «auto», deja lo que trae la estética. */
const STYLE = [
  { id: 'estetica', label: 'Estética', cards: [
    { id: 'skin', card: 'skins', title: 'Estética', desc: 'Cambia el estilo de toda la app sin tocar el contenido. Al cambiar se aplican sus colores, tipografías y diseño de carta.', keys: [] }
  ] },
  { id: 'color', label: 'Color', cards: [
    { id: 'colores', card: 'colors', title: 'Colores', keys: ['colors'] },
    { id: 'oscuro', card: 'dark', title: 'Modo oscuro', desc: 'Si el celular del cliente está en modo oscuro, la app puede cambiar sola a una paleta de noche.', keys: ['dark'] },
    { id: 'fondoapp', card: 'bgapp', title: 'Fondo de la app', desc: 'Liso, en degradado hacia un acento o con una foto detrás y un velo del color de fondo para que todo se lea.', keys: ['bg'] },
    { id: 'roles', card: 'roles', adv: true, title: 'Color por elemento', desc: 'Cambia el color de cada pieza sin tocar la paleta. «Auto» deja el de la estética.', keys: ['roles'] }
  ] },
  { id: 'letra', label: 'Letra', cards: [
    { id: 'tipografia', card: 'fonts', title: 'Tipografía', desc: 'Todas son de Google Fonts y cargan solas en la app.', keys: ['fonts', 'textSize'], fields: [
      { k: 'textSize', t: 'seg', label: 'Tamaño del texto', def: 'normal', opts: [['normal', 'Normal'], ['grande', 'Grande']], help: '«Grande» sube un 15 % el texto de la carta, los botones y los formularios. Se lee mejor sin gafas.' }
    ] },
    { id: 'titulos', adv: true, card: 'titleWeight', title: 'Títulos', desc: 'La portada, los títulos de sección y las categorías de la carta.', keys: ['type.titleWeight', 'type.titleCase', 'type.titleSpacing', 'type.titleScale'], fields: [
      { k: 'type.titleCase', t: 'seg', label: 'Letras', def: 'auto', opts: [['auto', 'Según la estética'], ['normal', 'Como se escriben'], ['mayus', 'MAYÚSCULAS'], ['versal', 'Versalitas']] },
      { k: 'type.titleSpacing', t: 'range', label: 'Espacio entre letras', min: -5, max: 20, step: 1, div: 100, unit: 'em', def: 0 },
      { k: 'type.titleScale', t: 'range', label: 'Tamaño', min: 80, max: 130, step: 5, unit: '%', def: 100 }
    ] },
    { id: 'texto', adv: true, title: 'Texto', desc: 'Las descripciones, los botones, los formularios y los precios.', fields: [
      { k: 'type.textScale', t: 'range', label: 'Tamaño exacto del texto', min: 85, max: 130, step: 5, unit: '%', def: 100, help: 'Sin moverlo, el texto sigue «Tamaño del texto» de la tarjeta Tipografía.' },
      { k: 'type.lineHeight', t: 'range', label: 'Interlineado', min: 130, max: 190, step: 5, div: 100, def: 155 },
      { k: 'type.priceFont', t: 'seg', label: 'Letra de los precios', def: 'auto', opts: [['auto', 'Según la estética'], ['texto', 'La del texto'], ['titulos', 'La de los títulos'], ['mono', 'Monoespaciada']] }
    ] }
  ] },
  { id: 'formas', label: 'Formas', cards: [
    { id: 'forma', title: 'Esquinas y botones', fields: [
      { k: 'radius', t: 'range', label: 'Esquinas', min: 0, max: 28, unit: 'px' },
      { k: 'buttons', t: 'seg', label: 'Botones', def: 'auto', opts: [['auto', 'Según la estética'], ['redondo', 'Redondos'], ['cuadrado', 'Cuadrados'], ['contorno', 'De contorno']] }
    ] },
    { id: 'piezas', adv: true, title: 'Botones, fotos y chips', desc: 'Manda sobre «Botones» de la tarjeta de arriba cuando eliges algo distinto de «Según la estética».', fields: [
      { k: 'shape.btn', t: 'seg', label: 'Esquinas de los botones', def: 'auto', opts: [['auto', 'Según la estética'], ['pildora', 'Píldora'], ['redondeado', 'Redondeadas'], ['recto', 'Rectas']] },
      { k: 'shape.btnFill', t: 'seg', label: 'Relleno de los botones', def: 'auto', opts: [['auto', 'Según la estética'], ['solido', 'Sólido'], ['contorno', 'Contorno'], ['suave', 'Suave']] },
      { k: 'shape.photo', t: 'seg', label: 'Esquinas de las fotos', def: 'auto', opts: [['auto', 'Como las esquinas'], ['0', 'Rectas'], ['8', 'Suaves'], ['18', 'Redondeadas'], ['28', 'Muy redondas']] },
      { k: 'shape.chip', t: 'seg', label: 'Filtros y opciones', def: 'auto', opts: [['auto', 'Según la estética'], ['pildora', 'Píldora'], ['redondeado', 'Redondeados'], ['recto', 'Rectos']] }
    ] },
    { id: 'tarjetas', adv: true, title: 'Tarjetas', desc: 'Platos, promociones, preguntas, contacto y las demás cajas de la app.', fields: [
      { k: 'shape.card', t: 'seg', label: 'Estilo', def: 'auto', opts: [['auto', 'Según la estética'], ['plana', 'Plana'], ['borde', 'Con borde'], ['suave', 'Sombra suave'], ['dura', 'Sombra dura'], ['brillo', 'Brillo']] },
      { k: 'shape.border', t: 'range', label: 'Grosor del borde', min: 1, max: 4, step: .5, unit: 'px', def: 1.5, help: 'Para los estilos con borde y sombra dura.' }
    ] }
  ] },
  { id: 'carta', label: 'Carta', cards: [
    { id: 'cartadis', title: 'Diseño de la carta', card: 'cartaLayout', desc: 'Cómo se ven los platos. También se cambia en Módulos › Carta.' },
    { id: 'platos', title: 'Platos', fields: [
      { k: 'carta.shape', t: 'seg', label: 'Forma de las fotos', def: 'auto', opts: [['auto', 'Según las esquinas'], ['circulo', 'Círculo'], ['arco', 'Arco'], ['hoja', 'Hoja']], help: 'En tarjetas, cuadrícula y fotos grandes.' },
      { k: 'carta.desc', t: 'seg', label: 'Descripción', def: 'auto', opts: [['auto', 'Según el diseño'], ['completa', 'Completa'], ['2', 'Dos líneas'], ['1', 'Una línea'], ['ocultar', 'Sin descripción']], help: 'Al tocar el plato siempre se ve completa.' },
      { k: 'carta.size', adv: true, t: 'seg', label: 'Tamaño de las fotos', def: 'auto', opts: [['s', 'Pequeñas'], ['auto', 'Normales'], ['l', 'Grandes']] },
      { k: 'carta.pos', adv: true, t: 'seg', label: 'Foto en las tarjetas', def: 'auto', opts: [['auto', 'A la izquierda'], ['der', 'A la derecha']] },
      { k: 'carta.cols', adv: true, t: 'seg', label: 'Columnas', def: 'auto', opts: [['auto', 'Según el diseño'], ['1', 'Una'], ['2', 'Dos'], ['3', 'Tres']], help: 'En la cuadrícula (hasta tres) y en fotos grandes (hasta dos).' },
      { k: 'carta.lead', adv: true, t: 'seg', label: 'Guía entre el plato y el precio', def: 'auto', opts: [['auto', 'Puntos'], ['linea', 'Línea'], ['ninguno', 'Sin guía']] }
    ] },
    { id: 'precios', adv: true, title: 'Precios y etiquetas', fields: [
      { k: 'carta.price', t: 'seg', label: 'Precio', def: 'auto', opts: [['auto', 'Según la estética'], ['texto', 'Texto'], ['color', 'En color'], ['pildora', 'Píldora'], ['contorno', 'Contorno']], help: 'En la carta y en los destacados. El color se ajusta solo para que se lea.' },
      { k: 'carta.tags', t: 'seg', label: 'Etiquetas', def: 'auto', opts: [['auto', 'Según la estética'], ['relleno', 'Rellenas'], ['contorno', 'Contorno'], ['texto', 'Solo texto'], ['punto', 'Con punto']] }
    ] },
    { id: 'categorias', title: 'Categorías', fields: [
      { k: 'carta.cat', t: 'seg', label: 'Títulos de categoría', def: 'auto', opts: [['auto', 'Según la estética'], ['linea', 'Con línea'], ['centrado', 'Centrados'], ['mayus', 'Mayúsculas pequeñas'], ['banda', 'Sobre una franja']] },
      { k: 'carta.catPhoto', adv: true, t: 'seg', label: 'Foto de la categoría', def: 'auto', opts: [['auto', 'Franja arriba del título'], ['fondo', 'Detrás del título'], ['ocultar', 'Sin foto']], help: 'La foto de cada categoría se elige en la pestaña Carta.' },
      { k: 'carta.catIcon', adv: true, t: 'seg', label: 'Ícono de la categoría', def: 'auto', opts: [['auto', 'Según el diseño'], ['mostrar', 'Siempre'], ['ocultar', 'Nunca']] },
      { k: 'carta.tabs', adv: true, t: 'seg', label: 'Pestañas de categorías', def: 'auto', opts: [['auto', 'Botones'], ['subrayado', 'Subrayadas'], ['ocultar', 'Ocultar']] }
    ] }
  ] },
  { id: 'estructura', label: 'Estructura', cards: [
    { id: 'navegacion', title: 'Navegación', fields: [
      { k: 'nav', t: 'seg', label: 'Cómo se recorre la app', def: 'menu', opts: [['menu', 'Menú en el encabezado'], ['barra', 'Barra abajo con íconos'], ['pestanas', 'Pestañas arriba']],
        help: 'La barra de abajo trae Inicio, Carta, hasta dos atajos del local (pedido, reservas, sellos…) y «Más». Con ella, el pedido va en la barra en lugar del botón flotante.' }
    ] },
    { id: 'encabezado', adv: true, title: 'Encabezado', fields: [
      { k: 'top.align', t: 'seg', label: 'Nombre', def: 'auto', opts: [['auto', 'A la izquierda'], ['centro', 'Centrado']] },
      { k: 'top.bg', t: 'seg', label: 'Fondo', def: 'auto', opts: [['auto', 'Según la estética'], ['solido', 'Sólido'], ['transparente', 'Transparente sobre la portada']], help: 'Transparente: deja ver la foto de la portada y se vuelve sólido al bajar.' },
      { k: 'top.logo', t: 'bool', label: 'Mostrar el logo', def: true },
      { k: 'top.name', t: 'bool', label: 'Mostrar el nombre', def: true },
      { k: 'top.status', t: 'bool', label: 'Mostrar si está abierto', def: true }
    ] },
    { id: 'secciones', adv: true, title: 'Secciones', desc: 'El espacio y lo que separa una sección de la siguiente.', fields: [
      { k: 'space.density', t: 'seg', label: 'Espacio entre secciones', def: 'auto', opts: [['compacta', 'Poco'], ['auto', 'Normal'], ['amplia', 'Mucho']] },
      { k: 'space.sep', t: 'seg', label: 'Separador', def: 'auto', opts: [['auto', 'Según la estética'], ['ninguno', 'Ninguno'], ['linea', 'Línea'], ['ornamento', 'Ornamento'], ['onda', 'Onda'], ['zocalo', 'Zócalo']] }
    ] },
    { id: 'titulosec', adv: true, title: 'Títulos de sección', fields: [
      { k: 'heads.align', t: 'seg', label: 'Alineación', def: 'auto', opts: [['auto', 'Según la estética'], ['izq', 'A la izquierda'], ['centro', 'Centrados']] },
      { k: 'heads.orn', t: 'seg', label: 'Adorno debajo', def: 'auto', opts: [['auto', 'Según la estética'], ['ninguno', 'Ninguno'], ['linea', 'Línea'], ['rombo', 'Rombo'], ['onda', 'Onda'], ['zigzag', 'Zigzag']] },
      { k: 'heads.kicker', t: 'seg', label: 'Antetítulos', def: 'auto', opts: [['auto', 'Mostrar'], ['ocultar', 'Ocultar']] }
    ] },
    { id: 'pie', title: 'Pie de página', fields: [
      { k: 'foot.style', t: 'seg', label: 'Contenido', def: 'completo', opts: [['completo', 'Completo'], ['simple', 'Sencillo']], help: 'Completo: eslogan, horario de hoy, dirección, redes con íconos y texto legal (se escribe en Datos).' },
      { k: 'foot.align', adv: true, t: 'seg', label: 'Alineación', def: 'auto', opts: [['auto', 'Según la estética'], ['centro', 'Centrado'], ['izq', 'A la izquierda']] },
      { k: 'foot.tagline', adv: true, t: 'bool', label: 'Eslogan', def: true },
      { k: 'foot.hours', adv: true, t: 'bool', label: 'Horario de hoy', def: true },
      { k: 'foot.social', adv: true, t: 'bool', label: 'Redes con íconos', def: true }
    ] }
  ] },
  { id: 'imagenes', label: 'Imágenes', cards: [
    { id: 'iconos', card: 'icons', title: 'Íconos', desc: 'Lo que se ve en los platos, categorías, avisos y sellos que no tienen foto.', fields: [
      { k: 'icons', t: 'seg', label: 'Dibujos', def: 'emoji', opts: [['emoji', 'Emojis'], ['linea', 'Íconos de línea'], ['ninguno', 'Sin íconos']], help: 'Los íconos de línea toman los colores de la app. El de cada plato o categoría se cambia al editarlo en Carta.' }
    ] },
    { id: 'fondo', card: 'textures', title: 'Detalle de fondo', keys: ['texture'] },
    { id: 'fotos', card: 'photos', title: 'Biblioteca de fotos', desc: 'Las fotos que subes para la portada, los platos, las categorías, la galería y el logo. Se guardan aparte, así la app no pesa.', keys: [] }
  ] },
  { id: 'movimiento', label: 'Movimiento', cards: [
    { id: 'mov', title: 'Movimiento', after: 'fxReplay', fields: [
      { k: 'motion', t: 'seg', label: 'Animaciones', opts: [['off', 'Quieto'], ['suave', 'Suave'], ['vivo', 'Vivo']], help: '«Vivo» agrega rebotes, stickers flotantes y confeti al completar sellos o acertar en la trivia. Si el celular pide reducir el movimiento, la app no se anima.' },
      { k: 'fx.reveal', t: 'seg', label: 'Al bajar por la app', def: 'auto', opts: [['auto', 'Todo a la vista'], ['subir', 'Suben'], ['aparecer', 'Aparecen'], ['zoom', 'Crecen'], ['lado', 'Entran de lado']], help: 'Las secciones y los platos aparecen a medida que se baja.' }
    ] },
    { id: 'efectos', adv: true, title: 'Efectos', fields: [
      { k: 'fx.entry', t: 'seg', label: 'Entrada al abrir', def: 'auto', opts: [['auto', 'Según el movimiento'], ['subir', 'Sube'], ['aparecer', 'Aparece'], ['zoom', 'Crece'], ['lado', 'Entra de lado'], ['ninguna', 'Ninguna']] },
      { k: 'fx.tap', t: 'seg', label: 'Al tocar botones y platos', def: 'auto', opts: [['auto', 'Según la estética'], ['hundir', 'Se hunden'], ['rebote', 'Rebotan'], ['brillo', 'Brillan'], ['ninguno', 'Nada']] },
      { k: 'fx.speed', t: 'seg', label: 'Velocidad', def: 'auto', opts: [['lenta', 'Lenta'], ['auto', 'Normal'], ['rapida', 'Rápida']], help: 'De la entrada, la aparición al bajar y el efecto al tocar.' }
    ] },
    { id: 'animados', adv: true, title: 'Detalles animados', fields: [
      { k: 'fx.marquee', t: 'seg', label: 'Cinta de palabras de la portada', def: 'auto', opts: [['auto', 'Según la estética'], ['quieta', 'Quieta'], ['lenta', 'Lenta'], ['normal', 'Normal'], ['rapida', 'Rápida']] },
      { k: 'fx.deco', t: 'seg', label: 'Stickers y letrero de neón', def: 'auto', opts: [['auto', 'Según el movimiento'], ['animadas', 'Se mueven'], ['quietas', 'Quietos']] },
      { k: 'fx.confetti', t: 'seg', label: 'Confeti al ganar', def: 'auto', opts: [['auto', 'Con movimiento vivo'], ['siempre', 'Siempre'], ['nunca', 'Nunca']], help: 'Al completar la tarjeta de sellos o acertar en la trivia.' }
    ] }
  ] }
];
const GROUPS = ['Esenciales', 'Ventas', 'Fidelización y juegos', 'Turismo y contenido'];
/* Diseños de la carta con miniatura en Estilo › Carta (el mismo valor que el campo del módulo). */
const CARTA_LAYOUTS = [['lista', 'Lista'], ['tarjetas', 'Tarjetas'], ['cuadricula', 'Cuadrícula'], ['fotos', 'Fotos grandes'], ['compacta', 'Compacta']];
const SECTION_FIELDS = [
  { t: 'sep', label: 'Diseño de esta sección' },
  { k: '_bg', t: 'sel', label: 'Fondo', def: 'auto', opts: [['auto', 'El de la app'], ['superficie', 'Color de las tarjetas'], ['tinte', 'Tinte del acento'], ['acento', 'Color de acento'], ['invertido', 'Invertido (claro sobre oscuro)']] },
  { k: '_align', t: 'seg', label: 'Título', def: 'auto', opts: [['auto', 'Según la estética'], ['izq', 'A la izquierda'], ['centro', 'Centrado']] },
  { k: '_pad', t: 'seg', label: 'Espacio arriba', def: 'auto', opts: [['compacto', 'Poco'], ['auto', 'Normal'], ['amplio', 'Mucho']] }
];
/* Color por elemento: roles (theme.roles) y los colores de la paleta que se ofrecen para cada uno. */
const ROLES = [['btn', 'Botones'], ['title', 'Títulos'], ['kicker', 'Antetítulos'], ['price', 'Precios'], ['sel', 'Selección'], ['tag', 'Etiquetas'], ['top', 'Encabezado'], ['foot', 'Pie de página']];
const ROLE_SWATCHES = [['accent', 'Acento'], ['accent2', 'Acento 2'], ['accent3', 'Acento 3'], ['ink', 'Texto'], ['muted', 'Texto suave'], ['surface', 'Tarjetas'], ['bg', 'Fondo']];
/* Portada: diseños y decoraciones (los dibujos están en el motor). */
const HERO_VARIANT_OPTS = [['auto', 'Según la foto'], ['texto', 'Solo texto'], ['foto', 'Foto de fondo con velo'], ['arriba', 'Foto arriba y texto abajo'], ['tarjeta', 'Tarjeta sobre la foto']];
const HERO_DECO_OPTS = [['auto', 'Según la estética'], ['ninguna', 'Ninguna'], ['araucarias', 'Araucarias'], ['cafetal', 'Cafetal'], ['guadua', 'Guadual'], ['termales', 'Termales'],
  ['willys', 'Jeep Willys'], ['fachada', 'Fachada y zócalo'], ['lomas', 'Lomas sembradas'], ['stickers', 'Stickers'], ['neon', 'Letrero de neón']];
/* Nombres de los íconos de línea en el selector del estudio. Los dibujos y sus grupos están en el motor (opts.meta). */
const ICON_NAMES = {
  cubiertos: 'Cubiertos', pan: 'Pan', baguette: 'Baguette', croissant: 'Croissant', rosca: 'Rosca o dona', bunuelo: 'Buñuelo', arepa: 'Arepa', empanada: 'Empanada',
  waffle: 'Waffle', sandwich: 'Sándwich', hamburguesa: 'Hamburguesa', perro: 'Perro caliente', pizza: 'Pizza', papas: 'Papas fritas', pollo: 'Pollo', carne: 'Carne',
  chorizo: 'Chorizo', pescado: 'Pescado o trucha', sopa: 'Sopa', olla: 'Olla o sancocho', huevo: 'Huevo', queso: 'Queso', maiz: 'Maíz', hongo: 'Hongo', hoja: 'Ensalada o verdura',
  aji: 'Ají', fruta: 'Fruta', trigo: 'Trigo', torta: 'Torta', postre: 'Postre', helado: 'Helado', galleta: 'Galleta', chocolate: 'Chocolate', miel: 'Miel o mermelada',
  cafe: 'Café o bebida caliente', grano: 'Grano de café', te: 'Té o aromática', vaso: 'Jugo o gaseosa', botella: 'Botella', cerveza: 'Cerveza', vino: 'Vino', coctel: 'Cóctel', frio: 'Frío',
  estrella: 'Estrella', corazon: 'Corazón', fuego: 'Fuego o asado', sol: 'Sol o desayuno', regalo: 'Regalo', trofeo: 'Trofeo', megafono: 'Anuncio', calendario: 'Calendario',
  reloj: 'Reloj', mapa: 'Ubicación', casa: 'Casa', arbol: 'Árbol', camara: 'Cámara', grupo: 'Grupo', chef: 'Chef', info: 'Información', domicilios: 'Domicilio', musica: 'Música',
  wifi: 'Wi-Fi', mascotas: 'Mascotas', infantil: 'Niños', terraza: 'Terraza', parqueadero: 'Parqueadero'
};
/* Servicios del local: [clave, nombre en el estudio]. Los textos de la app (es/en) y los íconos están en el motor. */
const SERVICES = [['parqueadero', 'Parqueadero'], ['mascotas', 'Se admiten mascotas'], ['terraza', 'Terraza o zona al aire libre'], ['infantil', 'Zona infantil'], ['wifi', 'Wi-Fi gratis'], ['tarjeta', 'Pago con tarjeta'], ['transferencia', 'Nequi y Daviplata'], ['accesible', 'Acceso para silla de ruedas'], ['domicilios', 'Domicilios'], ['musica', 'Música en vivo'], ['enchufes', 'Enchufes para trabajar'], ['ingles', 'Atención en inglés']];

const F = {
  title: function (ph) { return { k: 'title', t: 'text', label: 'Título', i18n: true, ph: ph || '' }; },
  text: function (k, label, ph) { return { k: k, t: 'text', label: label, i18n: true, ph: ph || '' }; },
  area: function (k, label, ph, rows) { return { k: k, t: 'area', label: label, i18n: true, ph: ph || '', rows: rows || 3 }; }
};

const MODULES = {
  hero: {
    label: 'Portada', code: 'PO', group: 'Esenciales', single: true, desc: 'Nombre, frase, foto, estado abierto o cerrado y los botones principales.',
    defaults: { kicker: '', title: '', subtitle: '', cta1: 'carta', cta2: 'none', showStatus: true, ribbon: '', variant: 'auto', img: '', veil: '60', height: 'auto', align: 'auto', size: 'm', logo: 'auto', deco: 'auto' },
    fields: [
      F.text('kicker', 'Antetítulo', 'Santa Rosa de Cabal · desde 2019'),
      F.text('title', 'Título', 'Vacío = nombre del local'),
      F.area('subtitle', 'Frase', 'Vacío = eslogan del local', 2),
      { k: 'cta1', t: 'sel', label: 'Botón principal', opts: CTA_OPTS },
      { k: 'cta2', t: 'sel', label: 'Botón secundario', opts: CTA_OPTS },
      { k: 'showStatus', t: 'bool', label: 'Mostrar si está abierto ahora', def: true },
      F.text('ribbon', 'Cinta de palabras', 'Separadas por comas'),
      { t: 'hint', text: 'En las estéticas animada y nocturna la cinta se mueve como marquesina.' },
      { t: 'sep', label: 'Foto y diseño' },
      { k: 'variant', t: 'sel', label: 'Diseño de la portada', def: 'auto', opts: HERO_VARIANT_OPTS },
      { k: 'img', t: 'img', label: 'Foto de portada (opcional)', max: 1100, help: 'Mejor horizontal. En la vista previa de claude.ai solo se ven las fotos subidas; los enlaces https se ven en la app publicada.' },
      { k: 'veil', t: 'sel', label: 'Velo sobre la foto', def: '60', opts: [['40', 'Suave'], ['60', 'Medio'], ['80', 'Fuerte']], help: 'Solo en el diseño de foto de fondo.' },
      { k: 'height', t: 'seg', label: 'Alto', def: 'auto', opts: [['baja', 'Baja'], ['auto', 'Normal'], ['alta', 'Alta']] },
      { k: 'align', t: 'sel', label: 'Alineación del texto', def: 'auto', opts: [['auto', 'La de la estética'], ['izq', 'A la izquierda'], ['centro', 'Centrada']] },
      { k: 'size', t: 'sel', label: 'Tamaño del título', def: 'm', opts: [['s', 'Pequeño'], ['m', 'Normal'], ['l', 'Grande']] },
      { k: 'logo', t: 'seg', label: 'Logo en la portada', def: 'auto', opts: [['auto', 'Según la estética'], ['si', 'Mostrar'], ['no', 'Ocultar']] },
      { k: 'deco', t: 'thumbs', label: 'Decoración', def: 'auto', art: 'heroDeco', opts: HERO_DECO_OPTS,
        help: 'Las ilustraciones toman los colores de la paleta. Las de arriba del título (termales, Willys, fachada) se ocultan cuando hay foto.' }
    ]
  },
  carta: {
    label: 'Carta', code: 'CA', group: 'Esenciales', single: true, desc: 'El menú completo con categorías, filtros por etiqueta y buscador.',
    defaults: { title: '', intro: '', layout: 'lista', priceStyle: 'full', showFilters: true, showSearch: false, footnote: '' },
    fields: [
      F.title('La carta'), F.area('intro', 'Introducción', '', 2),
      { k: 'layout', t: 'sel', label: 'Diseño de la carta', opts: [['lista', 'Lista con puntos guía'], ['tarjetas', 'Tarjetas con foto o emoji'], ['cuadricula', 'Cuadrícula de dos columnas'], ['fotos', 'Fotos grandes'], ['compacta', 'Compacta: nombre y precio']] },
      { t: 'hint', text: '«Compacta» sirve para cartas largas, como bebidas o panadería: la descripción se ve al tocar el plato.' },
      { k: 'priceStyle', t: 'sel', label: 'Formato de precio', opts: [['full', '$48.000'], ['short', '48 (en miles)']] },
      { k: 'showFilters', t: 'bool', label: 'Filtros por etiqueta', def: true },
      { k: 'showSearch', t: 'bool', label: 'Buscador' },
      F.area('footnote', 'Nota al pie', 'Impuesto al consumo incluido. La propina es voluntaria.', 2),
      { t: 'hint', text: 'Los platos y categorías se editan en la pestaña Carta.' }
    ]
  },
  destacados: {
    label: 'Destacados', code: 'DE', group: 'Ventas', desc: 'Carrusel con los platos de una etiqueta: recomendados, favoritos o nuevos.',
    defaults: { title: 'Recomendados', tag: 'chef', max: 4 },
    fields: [F.title('Recomendados'), { k: 'layout', t: 'sel', label: 'Diseño', def: 'carrusel', opts: [['carrusel', 'Carrusel'], ['cuadricula', 'Cuadrícula de dos columnas'], ['lista', 'Lista con foto pequeña']] }, { k: 'tag', t: 'tag', label: 'Mostrar platos con la etiqueta' }, { k: 'max', t: 'num', label: 'Máximo de platos', min: 1, max: 10 }]
  },
  promos: {
    label: 'Promociones', code: 'PR', group: 'Ventas', seg: 'Vecino', desc: 'Promos por día de la semana; la de hoy sale primero y resaltada.',
    defaults: { title: 'Promociones', highlightToday: true, items: [{ days: [2], title: 'Martes de 2×1', desc: '', price: 0 }] },
    fields: [
      F.title('Promociones'), { k: 'layout', t: 'sel', label: 'Diseño', def: 'tarjetas', opts: [['tarjetas', 'Tarjetas una debajo de otra'], ['carrusel', 'Carrusel']] }, { k: 'highlightToday', t: 'bool', label: 'Resaltar la promo de hoy', def: true },
      { k: 'items', t: 'list', label: 'Promociones', item: 'Promo', blank: { days: [], title: '', desc: '', price: 0 },
        fields: [{ k: 'days', t: 'days', label: 'Días' }, F.text('title', 'Título'), F.text('desc', 'Detalle'), { k: 'price', t: 'num', label: 'Precio (opcional)', min: 0, step: 100, money: true }] }
    ]
  },
  menudia: {
    label: 'Menú del día', code: 'MD', group: 'Ventas', seg: 'Vecino', desc: 'Almuerzo ejecutivo: sopa, principio, proteína, bebida y precio.',
    defaults: { title: 'Menú del día', days: [1, 2, 3, 4, 5], from: '12:00', to: '15:00', price: 16000, note: '', parts: [{ label: 'Sopa', value: '' }, { label: 'Principio', value: '' }, { label: 'Proteína', value: '' }, { label: 'Bebida', value: '' }] },
    fields: [
      F.title('Menú del día'), { k: 'days', t: 'days', label: 'Días' }, { k: 'from', t: 'time', label: 'Desde' }, { k: 'to', t: 'time', label: 'Hasta' },
      { k: 'price', t: 'num', label: 'Precio', min: 0, step: 500, money: true },
      { k: 'parts', t: 'list', label: 'Qué incluye hoy', item: 'Parte', blank: { label: '', value: '' }, fields: [F.text('label', 'Parte', 'Sopa'), F.text('value', 'Hoy', 'Sancocho')] },
      F.text('note', 'Nota', 'Mientras haya')
    ]
  },
  pedido: {
    label: 'Pedido por WhatsApp', code: 'PE', group: 'Ventas', single: true, seg: 'Vecino', desc: 'Carrito dentro de la app; el pedido llega armado al WhatsApp del local.',
    defaults: { title: 'Cómo pedir', showSection: true, modes: { mesa: true, llevar: true, domicilio: true }, deliveryFee: 0, minOrder: 0, deliveryNote: '', payments: 'Efectivo, Nequi, Daviplata, Tarjeta', intro: '' },
    fields: [
      F.title('Cómo pedir'), { k: 'showSection', t: 'bool', label: 'Mostrar la sección «Cómo pedir»', def: true },
      { k: 'modes.mesa', t: 'bool', label: 'Pedir en la mesa', def: true }, { k: 'modes.llevar', t: 'bool', label: 'Para llevar', def: true }, { k: 'modes.domicilio', t: 'bool', label: 'Domicilio', def: true },
      { k: 'deliveryFee', t: 'num', label: 'Valor del domicilio (0 = por confirmar)', min: 0, step: 500, money: true },
      { k: 'minOrder', t: 'num', label: 'Pedido mínimo para domicilio', min: 0, step: 1000, money: true },
      F.text('deliveryNote', 'Cobertura de domicilios', 'Casco urbano'),
      F.text('payments', 'Formas de pago', 'Efectivo, Nequi, Daviplata, Tarjeta'),
      { k: 'intro', t: 'text', label: 'Saludo del mensaje', ph: 'Vacío = «Hola, [local]. Quiero hacer este pedido:»' },
      { t: 'hint', text: 'El pedido llega al WhatsApp de la pestaña Datos, siempre en español para el personal.' }
    ]
  },
  reservas: {
    label: 'Reservas', code: 'RE', group: 'Ventas', single: true, desc: 'Fecha, hora, personas y ocasión; la solicitud llega por WhatsApp.',
    defaults: { title: 'Reservas', text: '', slots: '12:30, 13:30, 19:00, 20:00', maxPeople: 10, occasions: 'Cumpleaños, Aniversario, Negocios', note: 'Te confirmamos por WhatsApp.' },
    fields: [
      F.title('Reservas'), F.area('text', 'Texto', '', 2),
      { k: 'slots', t: 'text', label: 'Horas disponibles', ph: '12:30, 13:30, 19:00 (vacío = hora libre)' },
      { k: 'maxPeople', t: 'num', label: 'Máximo de personas', min: 1, max: 50 },
      F.text('occasions', 'Ocasiones', 'Cumpleaños, Aniversario'), F.text('note', 'Nota', 'Confirmamos por WhatsApp')
    ]
  },
  sellos: {
    label: 'Tarjeta de sellos', code: 'SE', group: 'Fidelización y juegos', single: true, seg: 'Vecino', desc: 'Cliente frecuente: el personal sella con un código en el celular del cliente.',
    defaults: { title: 'Tarjeta de sellos', goal: 8, reward: 'El siguiente va por la casa', icon: '☕', pin: '', note: '' },
    fields: [
      F.title('Tarjeta de sellos'), { k: 'goal', t: 'num', label: 'Sellos para el premio', min: 3, max: 20 }, F.text('reward', 'Premio'),
      { k: 'icon', t: 'text', label: 'Emoji del sello', ph: '☕' }, { k: 'ico', t: 'icon', label: 'Ícono del sello', emoji: 'icon', fb: 'estrella' },
      { k: 'pin', t: 'text', label: 'Código del personal (4 a 6 dígitos)', ph: '4826' },
      F.text('note', 'Nota'),
      { t: 'hint', text: 'Los sellos quedan guardados en el celular del cliente. Cambia el código de vez en cuando.' }
    ]
  },
  ruleta: {
    label: 'Ruleta', code: 'RU', group: 'Fidelización y juegos', seg: 'Juego', desc: 'Gira y sale un plato al azar, o un premio una vez al día.',
    defaults: { title: '¿No sabes qué pedir?', text: '', mode: 'carta', category: '', options: [], oncePerDay: true },
    fields: [
      F.title('¿No sabes qué pedir?'), F.text('text', 'Texto'),
      { k: 'mode', t: 'sel', label: 'Qué sale en la ruleta', opts: [['carta', 'Platos de la carta'], ['premios', 'Premios']] },
      { k: 'category', t: 'cat', label: 'Categoría (modo platos)' },
      { k: 'options', t: 'list', label: 'Premios (modo premios)', item: 'Premio', blank: { label: '' }, fields: [F.text('label', 'Premio', '10 % en tu próxima visita')] },
      { k: 'oncePerDay', t: 'bool', label: 'Un giro al día por celular (modo premios)' }
    ]
  },
  trivia: {
    label: 'Trivia', code: 'TR', group: 'Fidelización y juegos', seg: 'Juego', desc: 'Preguntas para jugar en la mesa mientras llega el plato.',
    defaults: { title: 'Trivia', intro: '', prize: '', questions: [{ q: '', a1: '', a2: '', a3: '', correct: 1, fact: '' }] },
    fields: [
      F.title('Trivia'), F.text('intro', 'Introducción'), F.text('prize', 'Premio por acertar todas'),
      { k: 'questions', t: 'list', label: 'Preguntas', item: 'Pregunta', blank: { q: '', a1: '', a2: '', a3: '', correct: 1, fact: '' },
        fields: [F.text('q', 'Pregunta'), F.text('a1', 'Opción 1'), F.text('a2', 'Opción 2'), F.text('a3', 'Opción 3'),
          { k: 'correct', t: 'sel', label: 'Respuesta correcta', opts: [['1', 'Opción 1'], ['2', 'Opción 2'], ['3', 'Opción 3']] }, F.text('fact', 'Dato curioso')] }
    ]
  },
  resenas: {
    label: 'Reseñas', code: 'RS', group: 'Turismo y contenido', seg: 'Turista', desc: 'Lleva a los clientes a dejar su reseña en Google o a escribirle al local.',
    defaults: { title: '¿Cómo te fue?', text: '', rating: '', quotes: [] },
    fields: [
      F.title('¿Cómo te fue?'), { k: 'layout', t: 'sel', label: 'Diseño', def: 'tarjetas', opts: [['tarjetas', 'Tarjetas'], ['destacada', 'Cita grande que se desliza']] }, F.area('text', 'Texto', '', 2), { k: 'rating', t: 'text', label: 'Calificación real en Google (opcional)', ph: '4,8' },
      { k: 'quotes', t: 'list', label: 'Testimonios', item: 'Testimonio', blank: { text: '', author: '' }, fields: [F.area('text', 'Texto', '', 2), { k: 'author', t: 'text', label: 'Autor' }] },
      { t: 'hint', text: 'El botón de Google usa el enlace de reseñas de Datos. Publica solo opiniones reales, con permiso de quien las escribió.' }
    ]
  },
  glosario: {
    label: 'Glosario', code: 'GL', group: 'Turismo y contenido', seg: 'Turista', desc: 'Explica platos y palabras de la región a quien viene de fuera.',
    defaults: { title: 'Glosario', intro: '', items: [{ term: '', def: '' }] },
    fields: [F.title('Glosario'), F.text('intro', 'Introducción'),
      { k: 'items', t: 'list', label: 'Palabras', item: 'Palabra', blank: { term: '', def: '' }, fields: [F.text('term', 'Palabra'), F.area('def', 'Significado', '', 2)] }]
  },
  historia: {
    label: 'Historia', code: 'HI', group: 'Turismo y contenido', desc: 'La historia del local con su año de fundación.',
    defaults: { title: 'Nuestra historia', kicker: '', year: '', text: '', signature: '' },
    fields: [F.title('Nuestra historia'), F.text('kicker', 'Antetítulo', 'Vacío = «Desde [año]»'), { k: 'year', t: 'text', label: 'Año de fundación', ph: '1987' },
      F.area('text', 'Texto (una línea en blanco separa párrafos)', '', 6), F.text('signature', 'Firma')]
  },
  eventos: {
    label: 'Agenda', code: 'EV', group: 'Turismo y contenido', desc: 'Música en vivo, talleres y fechas especiales, con cupos por WhatsApp.',
    defaults: { title: 'Agenda', items: [{ when: '', title: '', desc: '', rsvp: false }] },
    fields: [F.title('Agenda'), { k: 'layout', t: 'sel', label: 'Diseño', def: 'tarjetas', opts: [['tarjetas', 'Tarjetas'], ['linea', 'Línea de tiempo']] },
      { k: 'items', t: 'list', label: 'Eventos', item: 'Evento', blank: { when: '', title: '', desc: '', rsvp: false },
        fields: [F.text('when', 'Cuándo', 'Viernes · 7:00 p. m.'), F.text('title', 'Título'), F.area('desc', 'Descripción', '', 2), { k: 'rsvp', t: 'bool', label: 'Botón «Apartar cupo»' }] }]
  },
  wifi: {
    label: 'Wi-Fi', code: 'WF', group: 'Turismo y contenido', single: true, desc: 'Nombre de la red y clave con botón para copiar.',
    defaults: { title: 'Wi-Fi', network: '', password: '' },
    fields: [F.title('Wi-Fi'), { k: 'network', t: 'text', label: 'Nombre de la red' }, { k: 'password', t: 'text', label: 'Clave' }]
  },
  horario: {
    label: 'Horario', code: 'HO', group: 'Esenciales', single: true, desc: 'Horario semanal y si está abierto ahora, en hora de Colombia.',
    defaults: { title: '', note: '' },
    fields: [F.title('Horario'), { k: 'layout', t: 'sel', label: 'Diseño', def: 'lista', opts: [['lista', 'Día por día'], ['compacto', 'Compacto: días seguidos juntos']] }, F.text('note', 'Nota', 'Festivos de 10 a 6'), { t: 'hint', text: 'Los días y horas se editan en Datos.' }]
  },
  ubicacion: {
    label: 'Ubicación', code: 'UB', group: 'Esenciales', single: true, desc: 'Dirección con botones a Google Maps y Waze.',
    defaults: { title: '', text: '' },
    fields: [F.title('Cómo llegar'), F.text('text', 'Indicaciones', 'Vacío = las de Datos'), { t: 'hint', text: 'La dirección y la búsqueda en mapas se editan en Datos.' }]
  },
  contacto: {
    label: 'Contacto', code: 'CO', group: 'Esenciales', single: true, desc: 'WhatsApp, teléfono, redes y botón para compartir la carta.',
    defaults: { title: '' },
    fields: [F.title('Contacto'), { k: 'layout', t: 'sel', label: 'Diseño', def: 'filas', opts: [['filas', 'Filas con el dato'], ['botones', 'Botones con ícono']] }, { t: 'hint', text: 'WhatsApp, teléfono y redes se editan en Datos.' }]
  },
  libre: {
    label: 'Bloque libre', code: 'BL', group: 'Turismo y contenido', desc: 'Título, texto y botón para lo que el local necesite contar.',
    defaults: { kicker: '', title: 'Nuevo bloque', text: '', style: 'normal', btnLabel: '', btnTarget: 'none', url: '', waText: '' },
    fields: [F.text('kicker', 'Antetítulo'), F.text('title', 'Título'), F.area('text', 'Texto', '', 4),
      { k: 'style', t: 'sel', label: 'Estilo', opts: [['normal', 'Normal'], ['destacado', 'Destacado']] },
      F.text('btnLabel', 'Texto del botón'),
      { k: 'btnTarget', t: 'sel', label: 'El botón lleva a', opts: [['none', 'Sin botón'], ['whatsapp', 'WhatsApp con mensaje'], ['url', 'Enlace web'], ['carta', 'La carta'], ['reservas', 'Reservas'], ['eventos', 'La agenda'], ['ubicacion', 'Cómo llegar']] },
      { k: 'url', t: 'text', label: 'Enlace web', ph: 'https://' }, { k: 'waText', t: 'text', label: 'Mensaje de WhatsApp', ph: 'Hola, quiero información sobre…' }]
  },
  aviso: {
    label: 'Aviso destacado', code: 'AV', group: 'Esenciales', desc: 'Un anuncio corto arriba de todo, como «Este festivo abrimos de 8 a 8». Se quita solo después de la fecha que elijas.',
    defaults: { text: '', icon: '📣', style: 'acento', until: '', cta: 'none' },
    fields: [
      F.text('text', 'Aviso', 'Este festivo abrimos de 8:00 a. m. a 8:00 p. m.'),
      { k: 'icon', t: 'text', label: 'Emoji', ph: '📣' }, { k: 'ico', t: 'icon', label: 'Ícono', emoji: 'icon', fb: 'megafono' },
      { k: 'style', t: 'sel', label: 'Estilo', def: 'acento', opts: [['acento', 'Color de acento'], ['suave', 'Suave'], ['alerta', 'Alerta']] },
      { k: 'until', t: 'date', label: 'Mostrar hasta (incluido)', help: 'Vacío = siempre. Después de esa fecha el aviso deja de verse en la app.' },
      { k: 'cta', t: 'sel', label: 'Al tocarlo lleva a', def: 'none', opts: CTA_OPTS },
      { t: 'hint', text: 'Se agrega al principio de la lista para que salga arriba de la portada. Puedes moverlo como cualquier módulo.' }
    ]
  },
  galeria: {
    label: 'Galería', code: 'GA', group: 'Turismo y contenido', desc: 'Fotos del local y de los platos con pie de foto; se amplían al tocarlas.',
    defaults: { title: 'Galería', layout: 'carrusel', items: [{ img: '', emoji: '', caption: '' }] },
    fields: [F.title('Galería'),
      { k: 'layout', t: 'sel', label: 'Diseño', def: 'carrusel', opts: [['carrusel', 'Carrusel'], ['mosaico', 'Mosaico']] },
      { k: 'items', t: 'list', label: 'Fotos', item: 'Foto', blank: { img: '', emoji: '', caption: '' },
        fields: [{ k: 'img', t: 'img', label: 'Foto', max: 800 }, { k: 'emoji', t: 'text', label: 'Emoji si no hay foto', ph: '☕' }, { k: 'ico', t: 'icon', label: 'Ícono si no hay foto', emoji: 'emoji', fb: 'camara' }, F.text('caption', 'Pie de foto', 'Nuestro fogón de leña')] },
      { t: 'hint', text: 'Las fotos subidas quedan en la biblioteca de fotos y se pueden usar en cualquier app.' }]
  },
  servicios: {
    label: 'Servicios del local', code: 'SV', group: 'Turismo y contenido', single: true, seg: 'Turista', desc: 'Parqueadero, mascotas, terraza, zona infantil, pago con tarjeta y más, con íconos.',
    defaults: { title: 'Servicios', list: ['parqueadero', 'tarjeta', 'wifi'], extra: '', note: '' },
    fields: [F.title('Servicios'), { k: 'list', t: 'checks', label: 'Qué ofrece el local', opts: SERVICES },
      F.text('extra', 'Otros servicios', 'Separados por comas: Calefacción, Cambiador de bebé'), F.text('note', 'Nota', 'Parqueadero gratis para clientes')]
  },
  faq: {
    label: 'Preguntas frecuentes', code: 'PF', group: 'Turismo y contenido', seg: 'Turista', desc: 'Preguntas y respuestas que se despliegan: reservas, mascotas, parqueadero, opciones veganas…',
    defaults: { title: 'Preguntas frecuentes', items: [{ q: '', a: '' }] },
    fields: [F.title('Preguntas frecuentes'),
      { k: 'items', t: 'list', label: 'Preguntas', item: 'Pregunta', blank: { q: '', a: '' }, fields: [F.text('q', 'Pregunta', '¿Aceptan mascotas?'), F.area('a', 'Respuesta', 'Sí, en la terraza.', 2)] }]
  }
};

const BRAND_FIELDS = [
  { k: 'name', t: 'text', label: 'Nombre del local' },
  F.text('tagline', 'Eslogan', 'Café de especialidad'),
  { k: 'kind', t: 'text', label: 'Tipo de negocio', ph: 'Cafetería, restaurante, panadería…' },
  { k: 'logo.type', t: 'sel', label: 'Logo', opts: [['mono', 'Iniciales'], ['emoji', 'Emoji'], ['icon', 'Ícono'], ['img', 'Imagen']], rerender: true },
  { k: 'logo.value', t: 'text', label: 'Iniciales, emoji o enlace https de la imagen' },
  { t: 'sep', label: 'Ubicación' },
  { k: 'city', t: 'text', label: 'Ciudad', ph: 'Santa Rosa de Cabal, Risaralda' },
  { k: 'address', t: 'text', label: 'Dirección', ph: 'Calle 14 # 15-20' },
  F.text('addressNote', 'Cómo llegar', 'Frente al parque'),
  { k: 'mapsQuery', t: 'text', label: 'Búsqueda en mapas', ph: 'Vacío = dirección y ciudad' },
  { t: 'sep', label: 'Contacto' },
  { k: 'whatsapp', t: 'text', label: 'WhatsApp para pedidos y reservas', ph: '573001234567', help: 'Con el indicativo 57 y sin espacios.' },
  { k: 'phone', t: 'text', label: 'Teléfono', ph: '+57 606 000 0000' },
  { k: 'instagram', t: 'text', label: 'Instagram', ph: 'usuario' },
  { k: 'facebook', t: 'text', label: 'Facebook', ph: 'usuario o página' },
  { k: 'tiktok', t: 'text', label: 'TikTok', ph: 'usuario' },
  { k: 'reviewUrl', t: 'text', label: 'Enlace para dejar reseña en Google', ph: 'https://g.page/r/…' },
  { t: 'sep', label: 'Pie de página' },
  F.text('legal', 'Texto legal (opcional)', 'NIT 900.123.456-7 · Precios con impuestos incluidos')
];
