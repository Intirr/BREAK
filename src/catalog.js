/* Break · catálogo del estudio: estéticas, módulos y campos de edición. */
const SKINS = {
  elegante: {
    label: 'Elegante', art: 'Cena', desc: 'Serif de alto contraste, filetes finos y mucho aire. Para cocina de autor y cenas.', layout: 'lista',
    defaults: { colors: { bg: '#111412', surface: '#191D1A', ink: '#EDE7DA', muted: '#A3A89D', accent: '#C8A46A', accent2: '#7FA088', accent3: '#8E6F4E' }, fonts: { display: 'Bodoni Moda', body: 'Jost' }, radius: 2, motion: 'suave', texture: 'grano' },
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
    defaults: { colors: { bg: '#FFE36E', surface: '#FFFDF6', ink: '#1D1A1B', muted: '#5E5646', accent: '#FF5A36', accent2: '#2EBFA5', accent3: '#FF9BC8' }, fonts: { display: 'Lilita One', body: 'Nunito' }, radius: 18, motion: 'vivo', texture: 'puntos' },
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
    defaults: { colors: { bg: '#F9F8F4', surface: '#FFFFFF', ink: '#2B2320', muted: '#6E625B', accent: '#C2362A', accent2: '#2E6B4F', accent3: '#2B5C9E' }, fonts: { display: 'Alfa Slab One', body: 'Alegreya Sans' }, radius: 6, motion: 'suave', texture: 'none' },
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
    defaults: { colors: { bg: '#E3D3B4', surface: '#F8F1E4', ink: '#2A2117', muted: '#62513C', accent: '#4E6130', accent2: '#963322', accent3: '#C98B2B' }, fonts: { display: 'Young Serif', body: 'Karla' }, radius: 16, motion: 'suave', texture: 'papel' },
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
    defaults: { colors: { bg: '#0E0B16', surface: '#181427', ink: '#F4F1FF', muted: '#A9A3C4', accent: '#FF4F9A', accent2: '#2EE6C8', accent3: '#FFC247' }, fonts: { display: 'Tilt Neon', body: 'Barlow' }, radius: 12, motion: 'vivo', texture: 'none' },
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
    defaults: { colors: { bg: '#FAFAF8', surface: '#F0F0EC', ink: '#141413', muted: '#66655E', accent: '#2445D6', accent2: '#141413', accent3: '#C9C8C0' }, fonts: { display: 'Schibsted Grotesk', body: 'Instrument Sans' }, radius: 2, motion: 'suave', texture: 'none' },
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
const TAGS = [['chef', 'Recomendado'], ['popular', 'Favorito'], ['nuevo', 'Nuevo'], ['local', 'De la región'], ['vegano', 'Vegano'], ['vegetariano', 'Vegetariano'], ['singluten', 'Sin gluten'], ['picante', 'Picante']];
const CTA_OPTS = [['carta', 'Ver la carta'], ['reservas', 'Reservar mesa'], ['pedido', 'Hacer un pedido'], ['sellos', 'Tarjeta de sellos'], ['ubicacion', 'Cómo llegar'], ['eventos', 'Ver la agenda'], ['whatsapp', 'Escribir por WhatsApp'], ['none', 'Ninguno']];
const GROUPS = ['Esenciales', 'Ventas', 'Fidelización y juegos', 'Turismo y contenido'];

const F = {
  title: function (ph) { return { k: 'title', t: 'text', label: 'Título', i18n: true, ph: ph || '' }; },
  text: function (k, label, ph) { return { k: k, t: 'text', label: label, i18n: true, ph: ph || '' }; },
  area: function (k, label, ph, rows) { return { k: k, t: 'area', label: label, i18n: true, ph: ph || '', rows: rows || 3 }; }
};

const MODULES = {
  hero: {
    label: 'Portada', code: 'PO', group: 'Esenciales', single: true, desc: 'Nombre, frase, estado abierto o cerrado y los botones principales.',
    defaults: { kicker: '', title: '', subtitle: '', cta1: 'carta', cta2: 'none', showStatus: true, ribbon: '' },
    fields: [
      F.text('kicker', 'Antetítulo', 'Santa Rosa de Cabal · desde 2019'),
      F.text('title', 'Título', 'Vacío = nombre del local'),
      F.area('subtitle', 'Frase', 'Vacío = eslogan del local', 2),
      { k: 'cta1', t: 'sel', label: 'Botón principal', opts: CTA_OPTS },
      { k: 'cta2', t: 'sel', label: 'Botón secundario', opts: CTA_OPTS },
      { k: 'showStatus', t: 'bool', label: 'Mostrar si está abierto ahora', def: true },
      F.text('ribbon', 'Cinta de palabras', 'Separadas por comas'),
      { t: 'hint', text: 'En la estética animada la cinta se mueve como marquesina.' }
    ]
  },
  carta: {
    label: 'Carta', code: 'CA', group: 'Esenciales', single: true, desc: 'El menú completo con categorías, filtros por etiqueta y buscador.',
    defaults: { title: '', intro: '', layout: 'lista', priceStyle: 'full', showFilters: true, showSearch: false, footnote: '' },
    fields: [
      F.title('La carta'), F.area('intro', 'Introducción', '', 2),
      { k: 'layout', t: 'sel', label: 'Diseño de la carta', opts: [['lista', 'Lista con puntos guía'], ['tarjetas', 'Tarjetas con foto o emoji'], ['cuadricula', 'Cuadrícula de dos columnas']] },
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
    fields: [F.title('Recomendados'), { k: 'tag', t: 'tag', label: 'Mostrar platos con la etiqueta' }, { k: 'max', t: 'num', label: 'Máximo de platos', min: 1, max: 10 }]
  },
  promos: {
    label: 'Promociones', code: 'PR', group: 'Ventas', seg: 'Vecino', desc: 'Promos por día de la semana; la de hoy sale primero y resaltada.',
    defaults: { title: 'Promociones', highlightToday: true, items: [{ days: [2], title: 'Martes de 2×1', desc: '', price: 0 }] },
    fields: [
      F.title('Promociones'), { k: 'highlightToday', t: 'bool', label: 'Resaltar la promo de hoy', def: true },
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
      { k: 'icon', t: 'text', label: 'Ícono del sello', ph: '☕' }, { k: 'pin', t: 'text', label: 'Código del personal (4 a 6 dígitos)', ph: '4826' },
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
      F.title('¿Cómo te fue?'), F.area('text', 'Texto', '', 2), { k: 'rating', t: 'text', label: 'Calificación real en Google (opcional)', ph: '4,8' },
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
    fields: [F.title('Agenda'),
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
    fields: [F.title('Horario'), F.text('note', 'Nota', 'Festivos de 10 a 6'), { t: 'hint', text: 'Los días y horas se editan en Datos.' }]
  },
  ubicacion: {
    label: 'Ubicación', code: 'UB', group: 'Esenciales', single: true, desc: 'Dirección con botones a Google Maps y Waze.',
    defaults: { title: '', text: '' },
    fields: [F.title('Cómo llegar'), F.text('text', 'Indicaciones', 'Vacío = las de Datos'), { t: 'hint', text: 'La dirección y la búsqueda en mapas se editan en Datos.' }]
  },
  contacto: {
    label: 'Contacto', code: 'CO', group: 'Esenciales', single: true, desc: 'WhatsApp, teléfono, redes y botón para compartir la carta.',
    defaults: { title: '' },
    fields: [F.title('Contacto'), { t: 'hint', text: 'WhatsApp, teléfono y redes se editan en Datos.' }]
  },
  libre: {
    label: 'Bloque libre', code: 'BL', group: 'Turismo y contenido', desc: 'Título, texto y botón para lo que el local necesite contar.',
    defaults: { kicker: '', title: 'Nuevo bloque', text: '', style: 'normal', btnLabel: '', btnTarget: 'none', url: '', waText: '' },
    fields: [F.text('kicker', 'Antetítulo'), F.text('title', 'Título'), F.area('text', 'Texto', '', 4),
      { k: 'style', t: 'sel', label: 'Estilo', opts: [['normal', 'Normal'], ['destacado', 'Destacado']] },
      F.text('btnLabel', 'Texto del botón'),
      { k: 'btnTarget', t: 'sel', label: 'El botón lleva a', opts: [['none', 'Sin botón'], ['whatsapp', 'WhatsApp con mensaje'], ['url', 'Enlace web'], ['carta', 'La carta'], ['reservas', 'Reservas'], ['eventos', 'La agenda'], ['ubicacion', 'Cómo llegar']] },
      { k: 'url', t: 'text', label: 'Enlace web', ph: 'https://' }, { k: 'waText', t: 'text', label: 'Mensaje de WhatsApp', ph: 'Hola, quiero información sobre…' }]
  }
};

const BRAND_FIELDS = [
  { k: 'name', t: 'text', label: 'Nombre del local' },
  F.text('tagline', 'Eslogan', 'Café de especialidad'),
  { k: 'kind', t: 'text', label: 'Tipo de negocio', ph: 'Cafetería, restaurante, panadería…' },
  { k: 'logo.type', t: 'sel', label: 'Logo', opts: [['mono', 'Iniciales'], ['emoji', 'Emoji'], ['img', 'Imagen']], rerender: true },
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
  { k: 'reviewUrl', t: 'text', label: 'Enlace para dejar reseña en Google', ph: 'https://g.page/r/…' }
];
