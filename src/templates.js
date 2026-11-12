/* Break · las tres apps de ejemplo. Todo es configuración: el motor es el mismo. */
const HOURS = function (spec) {
  /* spec: { 0: ['12:00','17:00'] | null, ... } con 0 = domingo */
  return [1, 2, 3, 4, 5, 6, 0].map(function (d) {
    const h = spec[d];
    return h ? { d: d, open: h[0], close: h[1], closed: false } : { d: d, open: '', close: '', closed: true };
  });
};
const IT = function (id, name, desc, price, emoji, tags, extra) {
  return Object.assign({ id: id, name: name, desc: desc, price: price, emoji: emoji || '', img: '', tags: tags || [], on: true }, extra || {});
};

/* Portada de Neblina: montañas con niebla dibujadas en SVG (no es una foto real). */
const NEBLINA_IMG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAwIDgwMCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJzIiB4MT0iMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjYjljNmNhIi8+PHN0b3Agb2Zmc2V0PSIuNiIgc3RvcC1jb2xvcj0iI2U0ZTllOCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2Y0ZjVmMiIvPjwvbGluZWFyR3JhZGllbnQ+PGZpbHRlciBpZD0iYiIgeD0iLTIwJSIgeT0iLTUwJSIgd2lkdGg9IjE0MCUiIGhlaWdodD0iMjAwJSI+PGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMjgiLz48L2ZpbHRlcj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iODAwIiBmaWxsPSJ1cmwoI3MpIi8+PGNpcmNsZSBjeD0iODkwIiBjeT0iMjEwIiByPSI3MCIgZmlsbD0iI2Y2ZjNlYSIgb3BhY2l0eT0iLjc1Ii8+PHBhdGggZD0iTTAgNDIwIDEzMCAzMzAgMjQwIDM5MCAzODAgMjYwIDU0MCAzNzAgNjkwIDI5MCA4NTAgNDAwIDEwMDAgMzEwIDEyMDAgNDEwVjgwMEgwWiIgZmlsbD0iI2EzYjBiNCIvPjxlbGxpcHNlIGN4PSI0MjAiIGN5PSI0MzAiIHJ4PSI1MjAiIHJ5PSI0NiIgZmlsbD0iI2YyZjRmMiIgb3BhY2l0eT0iLjc1IiBmaWx0ZXI9InVybCgjYikiLz48cGF0aCBkPSJNMCA1MjBDMTUwIDQ2OCAyNjAgNTAwIDM4MCA0NTggNTIwIDQxMCA2NDAgNDk4IDc4MCA0NjggOTIwIDQzOCAxMDQwIDQ4MCAxMjAwIDQ0OFY4MDBIMFoiIGZpbGw9IiM3ZDhjOTEiLz48ZWxsaXBzZSBjeD0iODIwIiBjeT0iNTQ1IiByeD0iNTYwIiByeT0iNTAiIGZpbGw9IiNmMmY0ZjIiIG9wYWNpdHk9Ii43IiBmaWx0ZXI9InVybCgjYikiLz48cGF0aCBkPSJNMCA2MTBDMTgwIDU2MCAzMDAgNjAwIDQ3MCA1NzAgNjQwIDU0MCA3NjAgNjEyIDkzMCA1ODIgMTA2MCA1NjAgMTE0MCA1OTAgMTIwMCA1ODBWODAwSDBaIiBmaWxsPSIjNTY2NjZiIi8+PGcgZmlsbD0iIzNlNGM1MCI+PHBhdGggZD0iTTE1MCA2MDAgMTcwIDU0MCAxOTAgNjAwWiIvPjxwYXRoIGQ9Ik0xODUgNjA0IDIxMCA1MjggMjM1IDYwNFoiLz48cGF0aCBkPSJNOTkwIDU4NiAxMDEyIDUyMiAxMDM0IDU4NloiLz48cGF0aCBkPSJNMTAzMCA1OTAgMTA1MCA1MzYgMTA3MCA1OTBaIi8+PC9nPjxlbGxpcHNlIGN4PSIzODAiIGN5PSI2NTAiIHJ4PSI2MDAiIHJ5PSI0NCIgZmlsbD0iI2YyZjRmMiIgb3BhY2l0eT0iLjU1IiBmaWx0ZXI9InVybCgjYikiLz48cGF0aCBkPSJNMCA3MDBDMjAwIDY2MCA0MDAgNzAyIDYwMCA2ODAgODAwIDY1OCAxMDAwIDcwMCAxMjAwIDY3NlY4MDBIMFoiIGZpbGw9IiMzMzQwNDQiLz48L3N2Zz4=';

const TEMPLATES = [
  /* ---------------- 1. ELEGANTE ---------------- */
  {
    v: 1, id: 'tpl-araucaria', template: true,
    brand: {
      name: 'Araucaria', tagline: 'Cocina de montaña', kind: 'Restaurante de autor',
      logo: { type: 'mono', value: 'A' },
      city: 'Santa Rosa de Cabal, Risaralda', address: 'Centro', addressNote: 'A una cuadra del parque Las Araucarias.',
      mapsQuery: 'Parque Las Araucarias, Santa Rosa de Cabal', maps: '',
      whatsapp: '', phone: '', instagram: '', facebook: '', tiktok: '', reviewUrl: '', tz: 'America/Bogota',
      hours: HOURS({ 1: null, 2: ['12:00', '22:00'], 3: ['12:00', '22:00'], 4: ['12:00', '22:00'], 5: ['12:00', '23:00'], 6: ['12:00', '23:00'], 0: ['12:00', '17:00'] })
    },
    i18n: { bilingual: false, usted: true },
    theme: {
      skin: 'elegante',
      colors: { bg: '#111412', surface: '#191D1A', ink: '#EDE7DA', muted: '#A3A89D', accent: '#C8A46A', accent2: '#7FA088', accent3: '#8E6F4E' },
      fonts: { display: 'Bodoni Moda', body: 'Jost' }, radius: 2, motion: 'suave', texture: 'grano', icons: 'linea'
    },
    menu: {
      categories: [
        { id: 'empezar', name: 'Para empezar', icon: '', note: 'Para compartir o para uno', items: [
          IT('chorizo-curado', 'Chorizo santarrosano curado en casa', 'Láminas finas, encurtidos de la huerta y pan de masa madre.', 26000, '', ['local', 'chef']),
          IT('tartar-trucha', 'Tartar de trucha', 'Trucha de aguas frías, limón mandarino, crema de aguacate y crocante de plátano.', 34000, '', ['nuevo']),
          IT('hongos', 'Hongos del bosque al carbón', 'Setas de pino, mantequilla de ajo negro y queso campesino ahumado.', 29000, '', ['vegetariano']),
          IT('arracacha', 'Sopa fría de arracacha', 'Aceite de cilantro y semillas tostadas.', 22000, '', ['vegano', 'singluten'])
        ] },
        { id: 'fuego', name: 'Del fuego', icon: '', note: 'Leña de café y carbón', items: [
          IT('lomo', 'Lomo madurado en hoja de plátano', 'Puré de papa criolla, chimichurri de hierbas de monte y jugo de la cocción.', 68000, '', ['chef', 'singluten']),
          IT('costilla', 'Costilla de cerdo glaseada en panela', 'Doce horas de cocción lenta, repollo morado y maíz tostado.', 54000, '', ['popular']),
          IT('pollo', 'Pollo campesino a las brasas', 'Arroz de coco y fríjol, ají de tomate de árbol.', 46000),
          IT('risotto', 'Risotto de maíz pelado', 'Mazorca, quesillo, mantequilla de hierbas y flores de la huerta.', 44000, '', ['vegetariano'])
        ] },
        { id: 'rio', name: 'Del río', icon: '', note: '', items: [
          IT('trucha', 'Trucha entera al ajillo', 'Papas al romero, ensalada de berros y salsa de alcaparras.', 52000, '', ['local', 'singluten']),
          IT('pesca-cafe', 'Pesca del día en costra de café', 'Puré de ahuyama, espinaca salteada y reducción de mora.', 58000, '', ['chef'])
        ] },
        { id: 'postres', name: 'Postres', icon: '', note: '', items: [
          IT('brevas', 'Brevas en almíbar de panela', 'Helado de queso fresco y migas de galleta.', 21000, '', ['local']),
          IT('esfera', 'Esfera de chocolate y café', 'Chocolate colombiano al 70 %, mousse de café de origen y crumble de cacao.', 26000, '', ['chef']),
          IT('natilla', 'Natilla tibia', 'Espuma de canela y arequipe de la casa.', 18000)
        ] },
        { id: 'bodega', name: 'Bodega', icon: '', note: 'Copa · cocteles de autor', items: [
          IT('vino-tinto', 'Copa de vino tinto', 'Malbec o carménère; pregunte por la selección del mes.', 32000),
          IT('vino-blanco', 'Copa de vino blanco', 'Sauvignon blanc.', 30000),
          IT('sour', 'Araucaria Sour', 'Aguardiente añejo, lulo, panela y clara de huevo.', 32000, '', ['chef']),
          IT('gin-uchuva', 'Gin tonic de uchuva', 'Ginebra, uchuva, romero y tónica artesanal.', 34000),
          IT('sin-alcohol', 'Maracuyá, albahaca y soda', 'Coctel sin alcohol.', 18000, '', ['vegano'])
        ] },
        { id: 'cafe', name: 'Café de origen', icon: '', note: 'Fincas de Risaralda', items: [
          IT('espresso', 'Espresso', 'Café lavado con notas a panela y cítricos.', 7000, '', ['local']),
          IT('filtrado', 'Método filtrado', 'V60 o Chemex; pregunte por el lote de la semana.', 12000, '', ['local']),
          IT('carajillo', 'Carajillo', 'Espresso con ron añejo.', 16000)
        ] }
      ]
    },
    modules: [
      { id: 'hero', type: 'hero', on: true, s: { kicker: 'Santa Rosa de Cabal · Risaralda', title: '', subtitle: 'Cocina de montaña con producto de la región.', cta1: 'reservas', cta2: 'carta', showStatus: true, ribbon: '' } },
      { id: 'historia', type: 'historia', on: true, s: { title: 'La casa', kicker: '', year: '2019', text: 'Cocinamos con lo que da la cordillera: trucha de aguas frías, hongos de los bosques de pino, maíz, panela y el chorizo que hizo famosa a Santa Rosa.\n\nCada plato empieza en una conversación con los productores de las veredas cercanas. La carta cambia con la cosecha.', signature: 'La cocina de Araucaria' } },
      { id: 'chef', type: 'destacados', on: true, s: { title: 'Recomendación del chef', tag: 'chef', max: 4 } },
      { id: 'carta', type: 'carta', on: true, s: { title: 'La carta', intro: '', layout: 'lista', priceStyle: 'short', showFilters: true, showSearch: false, footnote: 'Precios en miles de pesos colombianos. Impuesto al consumo incluido. La propina es voluntaria; sugerimos el 10 %.' } },
      { id: 'degusta', type: 'libre', on: true, s: { kicker: 'Jueves a sábado', title: 'Menú degustación', text: 'Cinco tiempos que recorren la montaña, del páramo al cafetal.\n\n$185.000 por persona · maridaje opcional de $95.000.', style: 'destacado', btnLabel: 'Reservar la degustación', btnTarget: 'reservas', url: '', waText: '' } },
      { id: 'reservas', type: 'reservas', on: true, s: { title: 'Reserve su mesa', text: 'Recibimos grupos de hasta diez personas. Para eventos privados, escríbanos.', slots: '12:30, 13:30, 19:00, 20:00, 21:00', maxPeople: 10, occasions: 'Cena, Aniversario, Cumpleaños, Negocios', note: 'Confirmamos su reserva por WhatsApp.' } },
      { id: 'resenas', type: 'resenas', on: true, s: { title: '¿Nos acompañó?', text: 'Su opinión nos ayuda a crecer. Déjenos una reseña o escríbanos directamente.', rating: '', quotes: [] } },
      { id: 'horario', type: 'horario', on: true, s: { title: 'Horario', note: 'Lunes cerrado, excepto festivos.' } },
      { id: 'ubicacion', type: 'ubicacion', on: true, s: { title: 'Cómo llegar', text: '' } },
      { id: 'contacto', type: 'contacto', on: true, s: { title: 'Contacto' } }
    ],
    meta: { credit: true }
  },

  /* ---------------- 2. ANIMADO ---------------- */
  {
    v: 1, id: 'tpl-antojo', template: true,
    brand: {
      name: 'Antojo', tagline: 'Café, malteadas y algo más', kind: 'Cafetería',
      logo: { type: 'emoji', value: '🥤' },
      city: 'Santa Rosa de Cabal, Risaralda', address: 'Centro', addressNote: 'A media cuadra del parque principal.',
      mapsQuery: 'Parque Las Araucarias, Santa Rosa de Cabal', maps: '',
      whatsapp: '', phone: '', instagram: '', facebook: '', tiktok: '', reviewUrl: '', tz: 'America/Bogota',
      hours: HOURS({ 1: ['09:00', '20:00'], 2: ['09:00', '20:00'], 3: ['09:00', '20:00'], 4: ['09:00', '20:00'], 5: ['09:00', '22:00'], 6: ['09:00', '22:00'], 0: ['10:00', '20:00'] })
    },
    i18n: { bilingual: false, usted: false },
    theme: {
      skin: 'animado',
      colors: { bg: '#FFE36E', surface: '#FFFDF6', ink: '#1D1A1B', muted: '#5E5646', accent: '#FF5A36', accent2: '#2EBFA5', accent3: '#FF9BC8' },
      fonts: { display: 'Lilita One', body: 'Nunito' }, radius: 18, motion: 'vivo', texture: 'puntos', icons: 'emoji'
    },
    menu: {
      categories: [
        { id: 'malteadas', name: 'Malteadas', icon: '🥤', note: 'Con helado artesanal', items: [
          IT('malt-arequipe', 'Malteada de arequipe', 'Con galleta triturada y crema batida.', 15900, '🥤', ['popular']),
          IT('malt-galleta', 'Malteada de galleta y crema', 'Galletas de chocolate, helado de vainilla y salsa de chocolate.', 15900, '🍪'),
          IT('malt-fresa', 'Malteada de fresa', 'Fresas frescas, helado y leche.', 14900, '🍓', ['nuevo']),
          IT('malt-mango', 'Malteada de mango y maracuyá', 'Sin lácteos: con helado de coco.', 15900, '🥭', ['vegano'])
        ] },
        { id: 'waffles', name: 'Waffles', icon: '🧇', note: '', items: [
          IT('waffle-antojo', 'Waffle Antojo', 'Crema de avellanas, banano, fresas y helado.', 19900, '🧇', ['popular']),
          IT('waffle-pollo', 'Waffle de pollo crispy', 'Pollo apanado, miel picante y queso.', 21900, '🍗', ['picante', 'nuevo']),
          IT('waffle-arequipe', 'Waffle de arequipe y queso', 'El clásico: arequipe con queso fresco.', 16900, '🧀', ['vegetariano'])
        ] },
        { id: 'arepas', name: 'Arepas rellenas', icon: '🌽', note: '', items: [
          IT('arepa-choclo', 'Arepa de choclo con quesito', 'Maíz tierno y quesito fresco.', 11900, '🌽', ['vegetariano']),
          IT('arepa-pollo', 'Arepa de pollo y champiñones', 'Pollo desmechado en salsa de champiñones.', 15900, '🍄'),
          IT('arepa-chorizo', 'Arepa de chorizo santarrosano', 'Chorizo de la plaza, hogao y queso.', 15900, '🌭', ['popular']),
          IT('arepa-picante', 'Arepa picante de la casa', 'Carne desmechada, guacamole y ají de la casa.', 16900, '🌶️', ['picante'])
        ] },
        { id: 'cafe', name: 'Café y chocolate', icon: '☕', note: '', items: [
          IT('tinto', 'Tinto', 'Café de la región.', 2500, '☕'),
          IT('capuchino', 'Capuchino', 'Doble espresso con leche espumada.', 6500, '☕'),
          IT('cafe-panela', 'Café helado de panela', 'Café frío, panela y leche.', 8900, '🧊', ['nuevo']),
          IT('chocolate', 'Chocolate con queso', 'Chocolate caliente con queso para derretir.', 7900, '🍫')
        ] },
        { id: 'picar', name: 'Para picar', icon: '🍟', note: '', items: [
          IT('papas-locas', 'Papas locas', 'Papas a la francesa con salchicha, maíz, tocineta y salsas.', 17900, '🍟', ['popular']),
          IT('deditos', 'Deditos de queso (6)', 'Con salsa de mora.', 12900, '🧀'),
          IT('empanadas', 'Empanadas (3)', 'Con ají de la casa.', 8900, '🥟')
        ] }
      ]
    },
    modules: [
      { id: 'hero', type: 'hero', on: true, s: { kicker: 'Santa Rosa de Cabal', title: '', subtitle: 'Malteadas, waffles y arepas rellenas. Pide desde tu mesa o a domicilio.', cta1: 'carta', cta2: 'sellos', showStatus: true, ribbon: 'Malteadas, Waffles, Arepas rellenas, Café helado, Papas locas' } },
      { id: 'promos', type: 'promos', on: true, s: { title: 'Promos de la semana', highlightToday: true, items: [
        { days: [1], title: 'Lunes de waffle', desc: 'Waffle de arequipe y queso con tinto.', price: 15900 },
        { days: [2], title: 'Martes 2×1 en malteadas', desc: 'De 3:00 a 6:00 p. m., en todos los sabores.', price: 0 },
        { days: [3], title: 'Miércoles de arepa', desc: 'Cualquier arepa rellena con limonada.', price: 18900 },
        { days: [4], title: 'Jueves de parche', desc: 'Papas locas para compartir con 20 % de descuento.', price: 0 },
        { days: [5, 6], title: 'Fin de semana dulce', desc: 'Topping gratis en cualquier waffle.', price: 0 },
        { days: [0], title: 'Domingo en familia', desc: 'Cuatro malteadas del sabor que quieran.', price: 54900 }
      ] } },
      { id: 'top', type: 'destacados', on: true, s: { title: 'Lo más pedido', tag: 'popular', max: 6 } },
      { id: 'carta', type: 'carta', on: true, s: { title: 'La carta', intro: '', layout: 'cuadricula', priceStyle: 'full', showFilters: true, showSearch: true, footnote: 'Todos los precios incluyen impuestos.' } },
      { id: 'ruleta', type: 'ruleta', on: true, s: { title: '¿No sabes qué pedir?', text: 'Gira la ruleta y que decida el antojo.', mode: 'carta', category: '', options: [], oncePerDay: false } },
      { id: 'sellos', type: 'sellos', on: true, s: { title: 'Tu tarjeta de sellos', goal: 8, reward: 'La malteada número 9 va por la casa', icon: '🥤', pin: '2468', note: 'En cada compra, pídele a quien te atiende que selle tu tarjeta.' } },
      { id: 'pedido', type: 'pedido', on: true, s: { title: 'Cómo pedir', showSection: true, modes: { mesa: true, llevar: true, domicilio: true }, deliveryFee: 3000, minOrder: 15000, deliveryNote: 'Domicilios en el casco urbano de Santa Rosa.', payments: 'Efectivo, Nequi, Daviplata, Tarjeta', intro: '' } },
      { id: 'wifi', type: 'wifi', on: true, s: { title: 'Wi-Fi gratis', network: 'Antojo_Clientes', password: 'malteada2026' } },
      { id: 'horario', type: 'horario', on: true, s: { title: 'Horario', note: 'Festivos abrimos de 10:00 a. m. a 8:00 p. m.' } },
      { id: 'ubicacion', type: 'ubicacion', on: true, s: { title: 'Dónde estamos', text: '' } },
      { id: 'contacto', type: 'contacto', on: true, s: { title: 'Síguenos' } }
    ],
    meta: { credit: true }
  },

  /* ---------------- 3. CULTURAL ---------------- */
  {
    v: 1, id: 'tpl-zocalo', template: true,
    brand: {
      name: 'Casa Zócalo', tagline: 'Cocina del Eje Cafetero', tagline_en: 'Coffee Region home cooking', kind: 'Restaurante típico',
      logo: { type: 'mono', value: 'CZ' },
      city: 'Santa Rosa de Cabal, Risaralda', address: 'Centro', addressNote: 'A dos cuadras del parque Las Araucarias.', addressNote_en: 'Two blocks from Las Araucarias park.',
      mapsQuery: 'Parque Las Araucarias, Santa Rosa de Cabal', maps: '',
      whatsapp: '', phone: '', instagram: '', facebook: '', tiktok: '', reviewUrl: '', tz: 'America/Bogota',
      hours: HOURS({ 1: ['07:00', '16:00'], 2: ['07:00', '20:00'], 3: ['07:00', '20:00'], 4: ['07:00', '20:00'], 5: ['07:00', '21:00'], 6: ['07:00', '21:00'], 0: ['07:00', '20:00'] })
    },
    i18n: { bilingual: true, usted: true },
    theme: {
      skin: 'cultural',
      colors: { bg: '#F9F8F4', surface: '#FFFFFF', ink: '#2B2320', muted: '#6E625B', accent: '#C2362A', accent2: '#2E6B4F', accent3: '#2B5C9E' },
      fonts: { display: 'Alfa Slab One', body: 'Alegreya Sans' }, radius: 6, motion: 'suave', texture: 'none', icons: 'linea'
    },
    menu: {
      categories: [
        { id: 'desayunos', name: 'Desayunos de fonda', name_en: 'Country breakfasts', icon: '☀️', note: 'Hasta las 11:00 a. m.', note_en: 'Until 11:00 a.m.', items: [
          IT('calentado', 'Calentado paisa', 'Fríjoles y arroz del día anterior salteados, huevo frito, arepa y chocolate.', 18000, '🍳', ['local', 'popular'],
            { name_en: 'Paisa calentado', desc_en: 'Yesterday’s beans and rice pan-fried, fried egg, arepa and hot chocolate.' }),
          IT('pericos', 'Huevos pericos con arepa', 'Huevos con tomate y cebolla larga, arepa de maíz y quesito.', 13000, '🥚', ['vegetariano'],
            { name_en: 'Pericos eggs with arepa', desc_en: 'Eggs scrambled with tomato and scallion, corn arepa and fresh cheese.' }),
          IT('chocolate-queso', 'Chocolate con queso', 'Chocolate de mesa con queso fresco para derretir y pan de la panadería.', 9000, '🍫', ['local'],
            { name_en: 'Hot chocolate with cheese', desc_en: 'Hot chocolate with fresh cheese to melt inside, plus bread from the bakery.' })
        ] },
        { id: 'casa', name: 'Platos de la casa', name_en: 'House specialties', icon: '🍲', note: 'Cocinados en fogón de leña', note_en: 'Cooked over a wood fire', items: [
          IT('bandeja', 'Bandeja paisa', 'Fríjoles, arroz, carne molida, chicharrón, chorizo, huevo, maduro, arepa y aguacate.', 39900, '🍛', ['local', 'popular'],
            { name_en: 'Bandeja paisa', desc_en: 'Beans, rice, ground beef, pork crackling, chorizo, egg, sweet plantain, arepa and avocado.' }),
          IT('sancocho', 'Sancocho de gallina', 'Gallina criolla con yuca, plátano y mazorca; con arroz y aguacate. Fines de semana.', 32000, '🍲', ['chef'],
            { name_en: 'Hen sancocho', desc_en: 'Free-range hen broth with cassava, plantain and corn, served with rice and avocado. Weekends.' }),
          IT('chorizo-arepa', 'Chorizo santarrosano con arepa', 'Dos chorizos asados al carbón, arepa de maíz, limón y papa criolla.', 24000, '🌭', ['local', 'chef'],
            { name_en: 'Santa Rosa chorizo with arepa', desc_en: 'Two charcoal-grilled chorizos, corn arepa, lime and yellow potatoes.' }),
          IT('trucha-ajillo', 'Trucha al ajillo', 'Trucha de agua fría con patacón, ensalada y arroz.', 36000, '🐟', ['singluten'],
            { name_en: 'Garlic trout', desc_en: 'Cold-water trout with fried green plantain, salad and rice.' }),
          IT('frijoles', 'Fríjoles con garra', 'Fríjoles cargamanto con garra de cerdo, arroz, arepa y hogao.', 28000, '🥘', ['local'],
            { name_en: 'Bean stew with pork', desc_en: 'Cargamanto beans slow-cooked with pork, with rice, arepa and hogao.' }),
          IT('sudado', 'Sudado de verduras', 'Verduras de la plaza en hogao, con arroz y patacón.', 24000, '🥕', ['vegano'],
            { name_en: 'Vegetable stew', desc_en: 'Market vegetables simmered in hogao, with rice and fried plantain.' })
        ] },
        { id: 'picar', name: 'Para picar', name_en: 'To share', icon: '🥟', note: '', items: [
          IT('empanadas', 'Empanadas de papa y carne (4)', 'Masa de maíz, con ají de la casa.', 10000, '🥟', ['popular'],
            { name_en: 'Potato and beef empanadas (4)', desc_en: 'Corn dough, served with house chili sauce.' }),
          IT('patacon', 'Patacón con hogao', 'Plátano verde frito con salsa criolla.', 12000, '🍌', ['vegano'],
            { name_en: 'Patacón with hogao', desc_en: 'Fried green plantain with Creole tomato sauce.' }),
          IT('chicharron', 'Chicharrón carnudo', 'Con arepa y limón.', 16000, '🥓', [],
            { name_en: 'Meaty pork crackling', desc_en: 'With arepa and lime.' })
        ] },
        { id: 'dulces', name: 'Dulces de la abuela', name_en: 'Grandma’s sweets', icon: '🍯', note: '', items: [
          IT('mazamorra', 'Mazamorra con bocadillo', 'Maíz cocido en leche, frío, con panela rallada y bocadillo.', 8000, '🥛', ['local', 'popular'],
            { name_en: 'Mazamorra with guava paste', desc_en: 'Hominy corn in cold milk with grated panela and guava paste.' }),
          IT('brevas-arequipe', 'Brevas con arequipe', 'Brevas caladas con arequipe y queso.', 11000, '🍯', [],
            { name_en: 'Figs with arequipe', desc_en: 'Candied figs with arequipe (dulce de leche) and cheese.' }),
          IT('obleas', 'Obleas', 'Con arequipe, mermelada de mora y queso.', 7000, '🍪', ['vegetariano'],
            { name_en: 'Obleas', desc_en: 'Thin wafers with arequipe, blackberry jam and cheese.' })
        ] },
        { id: 'bebidas', name: 'Bebidas', name_en: 'Drinks', icon: '☕', note: '', items: [
          IT('tinto-campesino', 'Tinto campesino', 'Café negro colado en tela, endulzado con panela.', 3000, '☕', ['local'],
            { name_en: 'Country tinto', desc_en: 'Black coffee strained through cloth, sweetened with panela.' }),
          IT('cafe-origen', 'Café de origen', 'Filtrado, de fincas de Risaralda.', 8000, '☕', ['local', 'chef'],
            { name_en: 'Single-origin coffee', desc_en: 'Filter coffee from Risaralda farms.' }),
          IT('aguapanela', 'Aguapanela con limón', 'Fría o caliente.', 4000, '🍋', ['vegano'],
            { name_en: 'Aguapanela with lime', desc_en: 'Cane-sugar drink, cold or hot.' }),
          IT('jugos', 'Jugo de lulo, mora o maracuyá', 'En agua o en leche.', 7000, '🧃', [],
            { name_en: 'Lulo, blackberry or passion fruit juice', desc_en: 'Made with water or milk.' }),
          IT('cerveza', 'Cerveza nacional', 'Bien fría.', 6000, '🍺', [],
            { name_en: 'Colombian beer', desc_en: 'Ice cold.' })
        ] }
      ]
    },
    modules: [
      { id: 'hero', type: 'hero', on: true, s: { kicker: 'Santa Rosa de Cabal · desde 1987', kicker_en: 'Santa Rosa de Cabal · since 1987', title: '', subtitle: 'Cocina del Eje Cafetero, como la hacía la abuela.', subtitle_en: 'Coffee Region home cooking, the way grandma made it.', cta1: 'carta', cta2: 'ubicacion', showStatus: true, ribbon: 'Fogón de leña, Café de origen, Música de cuerda', ribbon_en: 'Wood-fired stove, Single-origin coffee, Live string music' } },
      { id: 'almuerzo', type: 'menudia', on: true, s: { title: 'Almuerzo del día', title_en: 'Set lunch', days: [1, 2, 3, 4, 5], from: '12:00', to: '15:00', price: 19000, note: 'De lunes a viernes, mientras haya.', note_en: 'Monday to Friday, while it lasts.', parts: [
        { label: 'Sopa', label_en: 'Soup', value: 'Sopa de guineo', value_en: 'Green banana soup' },
        { label: 'Principio', label_en: 'Side', value: 'Fríjoles o lentejas', value_en: 'Beans or lentils' },
        { label: 'Proteína', label_en: 'Main', value: 'Carne asada, pollo o cerdo', value_en: 'Grilled beef, chicken or pork' },
        { label: 'Acompañantes', label_en: 'With', value: 'Arroz, ensalada y maduro', value_en: 'Rice, salad and sweet plantain' },
        { label: 'Bebida', label_en: 'Drink', value: 'Jugo del día', value_en: 'Juice of the day' },
        { label: 'Postre', label_en: 'Dessert', value: 'Mazamorra con bocadillo', value_en: 'Mazamorra with guava paste' }
      ] } },
      { id: 'carta', type: 'carta', on: true, s: { title: 'La carta', title_en: 'Menu', intro: '', layout: 'tarjetas', priceStyle: 'full', showFilters: true, showSearch: false, footnote: 'Precios en pesos colombianos (COP), impuestos incluidos. La propina es voluntaria.', footnote_en: 'Prices in Colombian pesos (COP), taxes included. Tipping is voluntary.' } },
      { id: 'casa', type: 'historia', on: true, s: { title: 'La casa', title_en: 'The house', kicker: '', year: '1987',
        text: 'Casa Zócalo ocupa una casa de bahareque de más de cien años: paredes de guadua y tierra, balcones de madera y el zócalo pintado a mano que le dio el nombre.\n\nAquí se cocina en fogón de leña, con recetas que pasaron de abuelas a nietas y productos de las veredas de Santa Rosa.',
        text_en: 'Casa Zócalo lives in a bahareque house more than a hundred years old: walls of guadua bamboo and earth, wooden balconies and the hand-painted zócalo that gave it its name.\n\nWe cook over a wood fire, with recipes handed down from grandmothers to granddaughters and produce from the farms around Santa Rosa.',
        signature: 'La familia de la casa', signature_en: 'The family of the house' } },
      { id: 'glosario', type: 'glosario', on: true, s: { title: 'Palabras de la casa', title_en: 'Words of the house', intro: 'Para que pida como un local.', intro_en: 'So you can order like a local.', items: [
        { term: 'Tinto', def: 'Café negro, pequeño y fuerte. Se toma a cualquier hora del día.', def_en: 'A small, strong black coffee, drunk at any time of day. Not red wine!' },
        { term: 'Arepa', def: 'Torta de maíz asada. En el Eje Cafetero acompaña el desayuno, el almuerzo y la comida.', def_en: 'Grilled corn cake. In the Coffee Region it comes with breakfast, lunch and dinner.' },
        { term: 'Hogao', def: 'Salsa criolla de tomate y cebolla larga, base de muchos platos.', def_en: 'Creole sauce of tomato and scallion, the base of many dishes.' },
        { term: 'Mazamorra', def: 'Maíz cocido en leche que se sirve frío, con panela o bocadillo.', def_en: 'Hominy corn in milk, served cold with panela or guava paste.' },
        { term: 'Panela', def: 'Azúcar de caña sin refinar, en bloque. Endulza el tinto y el aguapanela.', def_en: 'Unrefined cane sugar in blocks. It sweetens tinto and aguapanela.' },
        { term: 'Bahareque', def: 'Técnica de construcción con guadua y tierra, típica de las casas de la región.', def_en: 'Building technique using guadua bamboo and earth, typical of the region’s houses.' },
        { term: 'Zócalo', def: 'Franja pintada en la base de los muros. Sus colores y figuras distinguen cada casa.', def_en: 'The painted band along the base of a house’s walls. Its colors and patterns set each house apart.' }
      ] } },
      { id: 'trivia', type: 'trivia', on: true, s: { title: 'Trivia cafetera', title_en: 'Coffee Region trivia', intro: 'Cinco preguntas mientras llega el plato.', intro_en: 'Five questions while your food arrives.',
        prize: 'Si acierta las cinco, muéstrele la pantalla al mesero: el tinto va por la casa.', prize_en: 'Get all five right and show your screen to the waiter: the tinto is on us.', questions: [
        { q: '¿Qué es un «tinto» en Colombia?', q_en: 'What is a “tinto” in Colombia?', a1: 'Un vino tinto', a1_en: 'A glass of red wine', a2: 'Un café negro', a2_en: 'A black coffee', a3: 'Un jugo de mora', a3_en: 'A blackberry juice', correct: 2, fact: 'Se pide a toda hora y casi siempre va endulzado con panela.', fact_en: 'People order it all day long, usually sweetened with panela.' },
        { q: '¿Con qué se construye una casa de bahareque?', q_en: 'What is a bahareque house built with?', a1: 'Ladrillo y cemento', a1_en: 'Brick and cement', a2: 'Piedra y hierro', a2_en: 'Stone and iron', a3: 'Guadua y tierra', a3_en: 'Guadua bamboo and earth', correct: 3, fact: 'La guadua es un bambú nativo, liviano y flexible.', fact_en: 'Guadua is a native bamboo, light and flexible.' },
        { q: '¿En qué año la UNESCO declaró Patrimonio de la Humanidad al Paisaje Cultural Cafetero?', q_en: 'When did UNESCO make the Coffee Cultural Landscape a World Heritage site?', a1: '2011', a1_en: '2011', a2: '1999', a2_en: '1999', a3: '2020', a3_en: '2020', correct: 1, fact: 'Incluye zonas de Caldas, Quindío, Risaralda y Valle del Cauca.', fact_en: 'It covers areas of Caldas, Quindío, Risaralda and Valle del Cauca.' },
        { q: '¿Por qué comida es famosa Santa Rosa de Cabal?', q_en: 'What food is Santa Rosa de Cabal famous for?', a1: 'La lechona', a1_en: 'Lechona', a2: 'El chorizo', a2_en: 'Chorizo sausage', a3: 'El ajiaco', a3_en: 'Ajiaco soup', correct: 2, fact: 'El chorizo santarrosano es uno de los sabores más conocidos de Risaralda.', fact_en: 'Santa Rosa chorizo is one of Risaralda’s best-known flavors.' },
        { q: 'En el Eje Cafetero, ¿qué es un «yipao»?', q_en: 'In the Coffee Region, what is a “yipao”?', a1: 'Un baile típico', a1_en: 'A folk dance', a2: 'Un postre de maíz', a2_en: 'A corn dessert', a3: 'Un jeep Willys cargado hasta el techo', a3_en: 'A Willys jeep loaded to the roof', correct: 3, fact: 'Los jeeps Willys llegaron a la región a mediados del siglo XX y todavía suben a las veredas.', fact_en: 'Willys jeeps arrived in the mid-20th century and still climb up to the farms.' }
      ] } },
      { id: 'agenda', type: 'eventos', on: true, s: { title: 'En la casa', title_en: 'At the house', items: [
        { when: 'Viernes · 7:00 p. m.', when_en: 'Fridays · 7:00 p.m.', title: 'Noche de música de cuerda', title_en: 'String music night', desc: 'Trío de bambucos y pasillos en vivo. Entrada libre.', desc_en: 'A live trio plays bambucos and pasillos. Free entry.', rsvp: false },
        { when: 'Sábados · 10:00 a. m.', when_en: 'Saturdays · 10:00 a.m.', title: 'Taller de arepas', title_en: 'Arepa workshop', desc: 'Amase, rellene y ase su propia arepa en el fogón de leña. Cupos limitados.', desc_en: 'Knead, fill and grill your own arepa over the wood fire. Limited spots.', rsvp: true },
        { when: 'Domingos · desde las 11:00 a. m.', when_en: 'Sundays · from 11:00 a.m.', title: 'Sancocho de olla grande', title_en: 'Big-pot sancocho', desc: 'Hasta que se acabe.', desc_en: 'Until it runs out.', rsvp: false }
      ] } },
      { id: 'resenas', type: 'resenas', on: true, s: { title: '¿Le gustó la visita?', title_en: 'Enjoyed your visit?', text: 'Su reseña ayuda a que otros viajeros encuentren la casa.', text_en: 'Your review helps other travelers find the house.', rating: '', quotes: [] } },
      { id: 'horario', type: 'horario', on: true, s: { title: 'Horario', title_en: 'Opening hours', note: 'Festivos abrimos con horario de domingo.', note_en: 'Public holidays: Sunday hours.' } },
      { id: 'ubicacion', type: 'ubicacion', on: true, s: { title: 'Cómo llegar', title_en: 'How to get here', text: '' } },
      { id: 'contacto', type: 'contacto', on: true, s: { title: 'Contacto', title_en: 'Contact' } }
    ],
    meta: { credit: true }
  },

  /* ---------- 4. PANADERÍA · NATURAL ---------- */
  {
    v: 1, id: 'tpl-espiga', template: true,
    brand: {
      name: 'La Espiga', tagline: 'Panadería de barrio desde 1986', kind: 'Panadería',
      logo: { type: 'emoji', value: '🌾' },
      city: 'Santa Rosa de Cabal, Risaralda', address: 'Centro', addressNote: 'Media cuadra abajo de la iglesia.',
      mapsQuery: 'Parque Las Araucarias, Santa Rosa de Cabal', maps: '',
      whatsapp: '', phone: '', instagram: '', facebook: '', tiktok: '', reviewUrl: '', tz: 'America/Bogota',
      hours: HOURS({ 1: ['06:00', '20:00'], 2: ['06:00', '20:00'], 3: ['06:00', '20:00'], 4: ['06:00', '20:00'], 5: ['06:00', '20:00'], 6: ['06:00', '20:00'], 0: ['06:30', '13:00'] })
    },
    i18n: { bilingual: false, usted: true },
    theme: {
      skin: 'natural',
      colors: { bg: '#E3D3B4', surface: '#F8F1E4', ink: '#2A2117', muted: '#62513C', accent: '#4E6130', accent2: '#963322', accent3: '#C98B2B' },
      fonts: { display: 'Young Serif', body: 'Karla' }, radius: 16, motion: 'suave', texture: 'papel', icons: 'linea', textSize: 'grande'
    },
    menu: {
      categories: [
        { id: 'horno', name: 'Del horno', icon: '🥖', note: 'Calientes a las 6:00 a. m. y a las 4:00 p. m.', items: [
          IT('pan-bono', 'Pan de bono', 'Con cuajada de las fincas de la vereda.', 2200, '🧀', ['popular', 'local']),
          IT('almojabana', 'Almojábana', 'Harina de maíz y queso, esponjosa por dentro.', 2200, '🧀', ['popular']),
          IT('pandeyuca', 'Pandeyuca', 'Almidón de yuca y queso costeño.', 2000, '🥯'),
          IT('bunuelo', 'Buñuelo', 'El de toda la vida, redondo y dorado.', 1800, '🧆', ['local']),
          IT('pan-alinado', 'Pan aliñado', 'Con mantequilla y un toque de azúcar.', 2500, '🍞'),
          IT('mantecada', 'Mantecada', 'Suave, de mantequilla y naranja.', 2800, '🧁'),
          IT('roscon', 'Roscón de arequipe', 'Relleno de arequipe y cubierto de azúcar.', 3500, '🍩', ['popular']),
          IT('croissant', 'Croissant de mantequilla', 'Hojaldrado en casa durante dos días.', 4500, '🥐', ['nuevo']),
          IT('masa-madre', 'Pan de masa madre (libra)', 'Fermentado 24 horas. Los domingos, por encargo.', 14000, '🍞'),
          IT('integral', 'Pan integral de semillas', 'Linaza, ajonjolí y girasol.', 9500, '🌾', ['vegano'])
        ] },
        { id: 'desayunos', name: 'Desayunos', icon: '🍳', note: 'De 6:00 a 11:00 a. m.', items: [
          IT('desayuno-casa', 'Desayuno La Espiga', 'Huevos al gusto, pan de la casa, mantequilla, fruta y café o chocolate.', 13900, '🍳', ['popular']),
          IT('caldo', 'Caldo de costilla', 'Con papa, cilantro y arepa.', 12000, '🍲', ['local']),
          IT('pericos', 'Huevos pericos con pan', 'Con tomate y cebolla larga.', 9500, '🥚', ['vegetariano']),
          IT('arepa-quesito', 'Arepa con quesito', 'Arepa de maíz asada con quesito fresco.', 6000, '🫓', ['vegetariano']),
          IT('parfait', 'Parfait de yogur y granola', 'Yogur griego, granola de la casa y fruta de temporada.', 9000, '🥣', ['temporada'])
        ] },
        { id: 'bebidas', name: 'Bebidas', icon: '☕', note: '', items: [
          IT('tinto', 'Tinto', 'Café de la región.', 1500, '☕', ['local']),
          IT('cafe-leche', 'Café con leche', 'En pocillo grande.', 3500, '☕'),
          IT('chocolate', 'Chocolate con queso', 'Chocolate de mesa batido con molinillo.', 6500, '🍫', ['popular']),
          IT('aguapanela', 'Aguapanela con queso', 'Caliente, con queso para derretir.', 5000, '🍯', ['local']),
          IT('capuchino', 'Capuchino', 'Doble espresso con leche espumada.', 5500, '☕'),
          IT('jugo', 'Jugo natural en leche', 'Mora, lulo, guanábana o fresa.', 6500, '🥤'),
          IT('avena', 'Avena fría', 'Con canela y clavos.', 4000, '🥛'),
          IT('kumis', 'Kumis de la casa', 'Con un trocito de panela.', 4500, '🥛')
        ] },
        { id: 'tortas', name: 'Tortas y postres', icon: '🍰', note: 'Por porción. Las tortas enteras son por encargo.', items: [
          IT('torta-naranja', 'Torta de naranja', 'Húmeda, con almíbar de naranja.', 4500, '🍊'),
          IT('torta-negra', 'Torta negra', 'Con frutas maceradas en vino. Ideal con el tinto.', 5500, '🍰'),
          IT('tres-leches', 'Tres leches', 'Con canela por encima.', 7500, '🍰', ['popular']),
          IT('natas', 'Postre de natas', 'La receta de la abuela.', 6500, '🥛', ['local']),
          IT('milhoja', 'Milhoja de arequipe', 'Hojaldre crujiente y mucho arequipe.', 6000, '🍰'),
          IT('zanahoria', 'Torta de zanahoria sin lactosa', 'Con nueces y glaseado de naranja.', 6500, '🥕', ['sinlactosa'])
        ] }
      ]
    },
    modules: [
      { id: 'aviso', type: 'aviso', on: true, s: { text: 'Pan caliente a las 6:00 a. m. y a las 4:00 p. m.', icon: '🔥', style: 'suave', until: '', cta: 'carta' } },
      { id: 'hero', type: 'hero', on: true, s: { kicker: 'Santa Rosa de Cabal · desde 1986', title: '', subtitle: 'Pan de bono, almojábanas y tortas de la casa. Pida para llevar o a domicilio.', cta1: 'carta', cta2: 'pedido', showStatus: true, ribbon: 'Pan de bono, Almojábanas, Buñuelos, Tortas por encargo', img: '', veil: '60', align: 'auto', size: 'm' } },
      { id: 'top', type: 'destacados', on: true, s: { title: 'Lo que más sale', tag: 'popular', max: 6 } },
      { id: 'promos', type: 'promos', on: true, s: { title: 'Promos de la semana', highlightToday: true, items: [
        { days: [1, 2, 3, 4, 5], title: 'Tinto y pan de bono', desc: 'De lunes a viernes, de 6:00 a 9:00 a. m.', price: 3200 },
        { days: [6], title: 'Sábado de pan blandito', desc: 'Diez panes blanditos para el desayuno de la familia.', price: 9000 },
        { days: [0], title: 'Domingo de chocolate', desc: 'Chocolate con queso y almojábana.', price: 8000 }
      ] } },
      { id: 'carta', type: 'carta', on: true, s: { title: 'Nuestro pan', intro: 'Toque un producto para ver de qué está hecho.', layout: 'compacta', priceStyle: 'full', showFilters: true, showSearch: true, footnote: 'Precios en pesos colombianos, impuestos incluidos.' } },
      { id: 'tortas-encargo', type: 'libre', on: true, s: { kicker: 'Por encargo', title: 'Tortas para celebrar', text: 'Cumpleaños, primeras comuniones, grados y bodas. Escríbanos con dos días de anticipación y se la tenemos lista.\n\nDesde $38.000 la torta de libra.', style: 'destacado', btnLabel: 'Encargar una torta', btnTarget: 'whatsapp', url: '', waText: 'Hola, La Espiga. Quiero encargar una torta para el día…' } },
      { id: 'galeria', type: 'galeria', on: true, s: { title: 'Del horno a su mesa', layout: 'mosaico', items: [
        { img: '', emoji: '🥖', caption: 'El horno se prende a las 4:00 a. m.' },
        { img: '', emoji: '🎂', caption: 'Tortas por encargo' },
        { img: '', emoji: '🥐', caption: 'Croissants de mantequilla' }
      ] } },
      { id: 'sellos', type: 'sellos', on: true, s: { title: 'Tarjeta del cliente', goal: 10, reward: 'La compra número 11 va por la casa (hasta $5.000)', icon: '🥖', pin: '5137', note: 'Un sello por cada compra desde $5.000.' } },
      { id: 'pedido', type: 'pedido', on: true, s: { title: 'Para llevar o a domicilio', showSection: true, modes: { mesa: false, llevar: true, domicilio: true }, deliveryFee: 3000, minOrder: 15000, deliveryNote: 'Domicilios en el casco urbano, de 7:00 a. m. a 7:00 p. m.', payments: 'Efectivo, Nequi, Daviplata, Tarjeta', intro: '' } },
      { id: 'historia', type: 'historia', on: true, s: { title: 'La casa del pan', kicker: '', year: '1986', text: 'Don Arturo prendió el primer horno en 1986, en el garaje de su casa. Hoy amasan sus nietas, con la misma receta de pan de bono y el mismo madrugón.\n\nCompramos la cuajada en las fincas lecheras de la vereda y el maíz en la plaza de mercado.', signature: 'La familia de La Espiga' } },
      { id: 'faq', type: 'faq', on: true, s: { title: 'Preguntas frecuentes', items: [
        { q: '¿Con cuánta anticipación encargo una torta?', a: 'Con dos días. Para bodas y primeras comuniones, con una semana.' },
        { q: '¿Hacen domicilios?', a: 'Sí, en el casco urbano de Santa Rosa, de 7:00 a. m. a 7:00 p. m. El domicilio vale $3.000.' },
        { q: '¿Tienen opciones sin lactosa?', a: 'La torta de zanahoria se hace sin lactosa y los jugos se pueden pedir en agua.' }
      ] } },
      { id: 'horario', type: 'horario', on: true, s: { title: 'Horario', note: 'Festivos, de 6:30 a. m. a 1:00 p. m.' } },
      { id: 'ubicacion', type: 'ubicacion', on: true, s: { title: 'Dónde estamos', text: '' } },
      { id: 'contacto', type: 'contacto', on: true, s: { title: 'Contacto' } }
    ],
    meta: { credit: true }
  },

  /* ---------- 5. CAFÉ DE ESPECIALIDAD · MINIMALISTA ---------- */
  {
    v: 1, id: 'tpl-neblina', template: true,
    brand: {
      name: 'Neblina', tagline: 'Café de altura, tostado en casa', kind: 'Café de especialidad',
      logo: { type: 'mono', value: 'N' },
      city: 'Santa Rosa de Cabal, Risaralda', address: 'Centro', addressNote: 'Frente al parque, segundo piso.',
      mapsQuery: 'Parque Las Araucarias, Santa Rosa de Cabal', maps: '',
      whatsapp: '', phone: '', instagram: '', facebook: '', tiktok: '', reviewUrl: '', tz: 'America/Bogota',
      hours: HOURS({ 1: null, 2: ['07:30', '19:00'], 3: ['07:30', '19:00'], 4: ['07:30', '19:00'], 5: ['07:30', '19:00'], 6: ['08:30', '20:00'], 0: ['08:30', '20:00'] })
    },
    i18n: { bilingual: false, usted: false },
    theme: {
      skin: 'minimalista',
      colors: { bg: '#FAFAF8', surface: '#F0F0EC', ink: '#141413', muted: '#66655E', accent: '#2445D6', accent2: '#141413', accent3: '#C9C8C0' },
      fonts: { display: 'Schibsted Grotesk', body: 'Instrument Sans' }, radius: 2, motion: 'suave', texture: 'none', icons: 'linea'
    },
    menu: {
      categories: [
        { id: 'espresso', name: 'Espresso y leche', icon: '☕', note: 'Leche de avena o almendras, $1.500 más', items: [
          IT('espresso', 'Espresso', 'Doble, con la mezcla de la casa.', 5000, '☕'),
          IT('americano', 'Americano', 'Espresso alargado con agua caliente.', 5500, '☕'),
          IT('cortado', 'Cortado', 'Espresso con un poco de leche texturizada.', 6000, '☕'),
          IT('capuchino', 'Capuchino', 'Mitad espresso, mitad leche y espuma.', 7500, '☕', ['popular']),
          IT('latte', 'Latte', 'Más leche, sabor suave.', 8000, '🥛'),
          IT('affogato', 'Affogato', 'Espresso sobre helado de vainilla.', 10500, '🍨', ['nuevo'])
        ] },
        { id: 'metodos', name: 'Métodos', icon: '🫖', note: 'Con el café del lote de la semana', items: [
          IT('v60', 'V60', 'Taza limpia y brillante. Pregunta por el lote del día.', 11000, '☕', ['chef', 'local']),
          IT('chemex', 'Chemex para dos', 'Filtro grueso, cuerpo ligero y dulce.', 18000, '☕', ['compartir']),
          IT('prensa', 'Prensa francesa', 'Más cuerpo y textura.', 10000, '☕'),
          IT('aeropress', 'AeroPress', 'Intenso y redondo.', 10000, '☕'),
          IT('sifon', 'Sifón japonés', 'El espectáculo de la casa, preparado en la mesa.', 14000, '⚗️'),
          IT('cold-brew', 'Cold brew', '18 horas en frío, con hielo y piel de naranja.', 10000, '🧊', ['nuevo'])
        ] },
        { id: 'granos', name: 'Café para llevar', icon: '🫘', note: 'Bolsa de 340 g · lo molemos para tu método', items: [
          IT('mirador', 'Finca El Mirador · Castillo lavado', 'Panela, mandarina y cacao.', 42000, '🫘', ['local', 'popular']),
          IT('cumbre', 'Finca La Cumbre · Geisha honey', 'Jazmín, durazno y té negro.', 68000, '🫘', ['chef', 'local']),
          IT('casa', 'Mezcla de la casa · tueste medio', 'Chocolate y caramelo, para todos los días.', 36000, '🫘')
        ] },
        { id: 'comer', name: 'Para acompañar', icon: '🥐', note: '', items: [
          IT('croissant-almendras', 'Croissant de almendras', 'Relleno de crema de almendras.', 9500, '🥐'),
          IT('pan-banano', 'Pan de banano', 'Sin huevo ni lácteos.', 7500, '🍌', ['vegano']),
          IT('torta-zanahoria', 'Torta de zanahoria', 'Con queso crema y nueces.', 9000, '🥕'),
          IT('tostada', 'Tostada de aguacate', 'Pan de masa madre, aguacate, rábano y semillas.', 16000, '🥑', ['vegano']),
          IT('sandwich', 'Sándwich de pavo y queso', 'En pan de masa madre, con pesto de la huerta.', 17000, '🥪')
        ] },
        { id: 'sin-cafe', name: 'Sin café', icon: '🍵', note: '', items: [
          IT('chai', 'Chai latte', 'Especias de la casa con leche.', 9000, '🍵'),
          IT('chocolate-origen', 'Chocolate de origen', 'Cacao colombiano al 70 %.', 8500, '🍫', ['local']),
          IT('infusion', 'Infusión de frutos rojos', 'Sin cafeína.', 7000, '🫖', ['vegano']),
          IT('limonada', 'Limonada de hierbabuena', 'Con panela.', 7500, '🍋', ['vegano']),
          IT('soda', 'Soda de jengibre', 'Fermentada en casa.', 8000, '🫚', ['temporada'])
        ] }
      ]
    },
    modules: [
      { id: 'hero', type: 'hero', on: true, s: { kicker: 'Santa Rosa de Cabal · 1.700 m', title: '', subtitle: 'Café de especialidad de fincas de Risaralda, tostado en casa cada semana.', cta1: 'carta', cta2: 'eventos', showStatus: true, ribbon: 'Filtrados, Espresso, Café en grano, Catas', img: NEBLINA_IMG, veil: '60', align: 'auto', size: 'm' } },
      { id: 'servicios', type: 'servicios', on: true, s: { title: 'Para quedarte', list: ['wifi', 'enchufes', 'mascotas', 'tarjeta', 'transferencia'], extra: 'Leche de avena y almendras', note: '' } },
      { id: 'carta', type: 'carta', on: true, s: { title: 'La carta', intro: '', layout: 'lista', priceStyle: 'full', showFilters: true, showSearch: false, footnote: 'Precios en pesos colombianos, impuestos incluidos.' } },
      { id: 'glosario', type: 'glosario', on: true, s: { title: 'Cómo se lee una taza', intro: 'Las palabras que vas a oír en la barra.', items: [
        { term: 'Lavado', def: 'El grano se fermenta y se lava antes de secarse. Da tazas limpias y brillantes.' },
        { term: 'Honey', def: 'Se seca con parte del mucílago, la capa dulce que lo envuelve. Más cuerpo y dulzor.' },
        { term: 'Natural', def: 'La cereza entera se seca al sol antes de sacar el grano. Notas a fruta madura.' },
        { term: 'Acidez', def: 'La sensación jugosa en la lengua, como de cítrico o de fruta roja.' },
        { term: 'Cuerpo', def: 'Qué tan pesado o ligero se siente el café en la boca.' },
        { term: 'Tueste medio', def: 'El punto que usamos casi siempre: deja ver el origen sin amargor.' }
      ] } },
      { id: 'agenda', type: 'eventos', on: true, s: { title: 'Agenda', items: [
        { when: 'Sábados · 10:00 a. m.', title: 'Cata guiada', desc: 'Probamos tres cafés de Risaralda y aprendes a reconocer sus notas. Cupo para ocho personas.', rsvp: true },
        { when: 'Domingos · 3:00 p. m.', title: 'Taller de métodos en casa', desc: 'V60, prensa y AeroPress: cómo preparar buen café sin máquina.', rsvp: true }
      ] } },
      { id: 'trivia', type: 'trivia', on: true, s: { title: 'Trivia de café', intro: 'Cuatro preguntas mientras se filtra tu café.', prize: 'Si aciertas las cuatro, tu próximo filtrado tiene 20 % de descuento.', questions: [
        { q: '¿Qué variedad de café es la más sembrada en Colombia?', a1: 'Geisha', a2: 'Castillo', a3: 'Robusta', correct: 2, fact: 'La desarrolló Cenicafé y resiste la roya, una enfermedad del cafeto.' },
        { q: '¿Qué es un café «honey»?', a1: 'Un café endulzado con miel', a2: 'Un grano secado con parte de su mucílago', a3: 'Un café de abejas', correct: 2, fact: 'El mucílago es dulce y pegajoso como la miel: de ahí el nombre.' },
        { q: '¿A qué altura se cultiva el café de especialidad en Risaralda?', a1: 'Entre 1.200 y 2.000 m', a2: 'A nivel del mar', a3: 'Por encima de 4.000 m', correct: 1, fact: 'Con la altura el grano madura despacio y gana sabor.' },
        { q: 'En una cata, ¿qué es la «acidez»?', a1: 'Qué tan amargo es', a2: 'La sensación brillante y jugosa, como de fruta', a3: 'La cantidad de cafeína', correct: 2, fact: 'Una buena acidez se parece a morder una mandarina, no a tomar vinagre.' }
      ] } },
      { id: 'sellos', type: 'sellos', on: true, s: { title: 'Tu tarjeta de sellos', goal: 8, reward: 'El café número 9 va por la casa', icon: '☕', pin: '7351', note: 'Pídele a quien te atiende que selle tu tarjeta en cada bebida.' } },
      { id: 'pedido', type: 'pedido', on: true, s: { title: 'Pide desde tu mesa', showSection: true, modes: { mesa: true, llevar: true, domicilio: false }, deliveryFee: 0, minOrder: 0, deliveryNote: '', payments: 'Efectivo, Nequi, Daviplata, Tarjeta', intro: '' } },
      { id: 'wifi', type: 'wifi', on: true, s: { title: 'Wi-Fi', network: 'Neblina_Clientes', password: 'tuestemedio' } },
      { id: 'faq', type: 'faq', on: true, s: { title: 'Preguntas frecuentes', items: [
        { q: '¿Venden café en grano o molido?', a: 'Sí, en bolsas de 340 g. Lo molemos en el momento para el método que uses en casa.' },
        { q: '¿Tienen leche vegetal?', a: 'De avena y de almendras, por $1.500 más.' },
        { q: '¿Puedo trabajar con el portátil?', a: 'Claro: hay Wi-Fi y enchufes en la barra larga. Los fines de semana, después de las 11:00 a. m., te pedimos compartir la mesa si hay fila.' }
      ] } },
      { id: 'resenas', type: 'resenas', on: true, s: { title: '¿Cómo estuvo tu café?', text: 'Tu reseña ayuda a que más gente descubra el café de la región.', rating: '', quotes: [] } },
      { id: 'horario', type: 'horario', on: true, s: { title: 'Horario', note: 'Lunes cerrado. Festivos, de 9:00 a. m. a 6:00 p. m.' } },
      { id: 'ubicacion', type: 'ubicacion', on: true, s: { title: 'Dónde estamos', text: '' } },
      { id: 'contacto', type: 'contacto', on: true, s: { title: 'Contacto' } }
    ],
    meta: { credit: true }
  },

  /* ---------- 6. TRUCHAS CAMINO A LOS TERMALES · NATURAL, BILINGÜE ---------- */
  {
    v: 1, id: 'tpl-alisos', template: true,
    brand: {
      name: 'Los Alisos', tagline: 'Trucha fresca camino a los termales', tagline_en: 'Fresh trout on the road to the hot springs', kind: 'Restaurante campestre',
      logo: { type: 'emoji', value: '🐟' },
      city: 'Santa Rosa de Cabal, Risaralda', address: 'Vía a los termales, km 4', addressNote: 'Pasando el puente, a mano izquierda. Hay parqueadero.', addressNote_en: 'Past the bridge, on the left. Parking available.',
      mapsQuery: 'Vía a los Termales, Santa Rosa de Cabal', maps: '',
      whatsapp: '', phone: '', instagram: '', facebook: '', tiktok: '', reviewUrl: '', tz: 'America/Bogota',
      hours: HOURS({ 1: null, 2: null, 3: null, 4: ['11:00', '18:00'], 5: ['11:00', '18:00'], 6: ['10:00', '19:00'], 0: ['10:00', '19:00'] })
    },
    i18n: { bilingual: true, usted: true },
    theme: {
      skin: 'natural',
      colors: { bg: '#DFE5DA', surface: '#F6F8F3', ink: '#1F2620', muted: '#505C50', accent: '#4E6E4D', accent2: '#9A4E2A', accent3: '#C9A04A' },
      fonts: { display: 'Young Serif', body: 'Karla' }, radius: 16, motion: 'suave', texture: 'hojas', icons: 'linea'
    },
    menu: {
      categories: [
        { id: 'truchas', name: 'Truchas', name_en: 'Trout', icon: '🐟', note: 'Con arroz, patacón y ensalada', note_en: 'With rice, fried plantain and salad', items: [
          IT('ajillo', 'Trucha al ajillo', 'Entera, dorada en ajo y mantequilla.', 38000, '🧄', ['local', 'popular'], { name_en: 'Garlic trout', desc_en: 'Whole trout, golden in garlic and butter.' }),
          IT('plancha', 'Trucha a la plancha', 'Con limón y hierbas de la huerta.', 36000, '🐟', ['singluten'], { name_en: 'Grilled trout', desc_en: 'With lime and herbs from our garden.' }),
          IT('gratinada', 'Trucha gratinada con champiñones', 'En salsa de champiñones con queso campesino.', 42000, '🍄', ['chef'], { name_en: 'Trout au gratin with mushrooms', desc_en: 'In mushroom sauce with farmer’s cheese.' }),
          IT('marinera', 'Trucha marinera', 'Con salsa de camarones y mejillones.', 46000, '🦐', [], { name_en: 'Seafood trout', desc_en: 'With shrimp and mussel sauce.' }),
          IT('ahumada', 'Trucha ahumada en casa', 'Ahumada con leña de café; con puré de arracacha en vez de arroz.', 44000, '🔥', ['chef', 'local'], { name_en: 'House-smoked trout', desc_en: 'Smoked over coffee wood, with arracacha mash instead of rice.' }),
          IT('ninos', 'Trucha para niños', 'Filete apanado sin espinas, con papas a la francesa y jugo.', 26000, '🍟', ['ninos'], { name_en: 'Kids’ trout', desc_en: 'Boneless breaded fillet with fries and juice.' })
        ] },
        { id: 'empezar', name: 'Para empezar', name_en: 'Starters', icon: '🥟', note: '', items: [
          IT('ceviche', 'Ceviche de trucha', 'Con limón mandarino, cebolla morada y aguacate.', 22000, '🍋', ['nuevo'], { name_en: 'Trout ceviche', desc_en: 'With mandarin lime, red onion and avocado.' }),
          IT('chorizo', 'Chorizo santarrosano', 'Asado al carbón, con arepa y limón.', 12000, '🌭', ['local'], { name_en: 'Santa Rosa chorizo', desc_en: 'Charcoal-grilled, with arepa and lime.' }),
          IT('patacones', 'Patacones con hogao', 'Plátano verde frito con salsa criolla.', 14000, '🍌', ['vegano'], { name_en: 'Patacones with hogao', desc_en: 'Fried green plantain with Creole tomato sauce.' }),
          IT('ahuyama', 'Crema de ahuyama', 'Con crocante de maíz.', 12000, '🎃', ['vegetariano', 'temporada'], { name_en: 'Pumpkin soup', desc_en: 'With crunchy corn.' })
        ] },
        { id: 'compartir', name: 'Para compartir', name_en: 'To share', icon: '🍽️', note: '', items: [
          IT('picada', 'Picada campestre para dos', 'Chorizo, chicharrón, dedos de trucha, papa criolla y arepitas.', 58000, '🍖', ['compartir'], { name_en: 'Country platter for two', desc_en: 'Chorizo, pork crackling, trout fingers, yellow potatoes and mini arepas.' }),
          IT('bandeja', 'Bandeja de truchas para cuatro', 'Cuatro truchas al gusto con todos sus acompañantes.', 142000, '🐟', ['compartir', 'popular'], { name_en: 'Trout platter for four', desc_en: 'Four trout cooked your way, with all the sides.' })
        ] },
        { id: 'bebidas', name: 'Bebidas', name_en: 'Drinks', icon: '🥤', note: '', items: [
          IT('limonada', 'Limonada de panela', 'Bien fría.', 7000, '🍋', ['vegano'], { name_en: 'Panela lemonade', desc_en: 'Ice cold.' }),
          IT('mora', 'Jugo de mora', 'En agua o en leche.', 7000, '🫐', [], { name_en: 'Blackberry juice', desc_en: 'With water or milk.' }),
          IT('aguapanela', 'Aguapanela con limón', 'Fría o caliente.', 5000, '🍯', ['local'], { name_en: 'Aguapanela with lime', desc_en: 'Cane-sugar drink, cold or hot.' }),
          IT('cafe', 'Café de la región', 'Tinto o con leche.', 4000, '☕', ['local'], { name_en: 'Local coffee', desc_en: 'Black or with milk.' }),
          IT('cerveza', 'Cerveza nacional', 'Solo para mayores de 18 años.', 7000, '🍺', [], { name_en: 'Colombian beer', desc_en: 'Adults 18 and over only.' })
        ] },
        { id: 'postres', name: 'Postres', name_en: 'Desserts', icon: '🍯', note: '', items: [
          IT('brevas', 'Brevas con arequipe', 'Con queso fresco.', 10000, '🍯', ['local'], { name_en: 'Figs with arequipe', desc_en: 'With fresh cheese.' }),
          IT('natas', 'Postre de natas', 'La receta de la casa.', 9000, '🥛', [], { name_en: 'Natas pudding', desc_en: 'Our family recipe.' }),
          IT('arroz-leche', 'Arroz con leche', 'Con canela y uvas pasas.', 8000, '🍚', [], { name_en: 'Rice pudding', desc_en: 'With cinnamon and raisins.' })
        ] }
      ]
    },
    modules: [
      { id: 'hero', type: 'hero', on: true, s: { kicker: 'Vía a los termales · km 4', kicker_en: 'Hot springs road · km 4', title: '', subtitle: 'Trucha de aguas frías, recién sacada de nuestros estanques.', subtitle_en: 'Cold-water trout, fresh from our own ponds.', cta1: 'reservas', cta2: 'carta', showStatus: true, ribbon: 'Trucha fresca, Fogón de leña, Zona infantil, Parqueadero', ribbon_en: 'Fresh trout, Wood-fired kitchen, Kids area, Parking', img: '', veil: '60', align: 'auto', size: 'm' } },
      { id: 'historia', type: 'historia', on: true, s: { title: 'La truchera', title_en: 'Our trout farm', kicker: '', year: '1998',
        text: 'Empezamos con dos estanques y una hornilla al lado del río. Hoy criamos la trucha en el agua que baja del páramo y la servimos el mismo día.\n\nLos alisos que le dan el nombre al lugar los sembró la abuela para darle sombra al agua.',
        text_en: 'We started with two ponds and a small stove by the river. Today we raise our trout in the water that comes down from the páramo and serve it the same day.\n\nGrandma planted the alder trees that give the place its name, to keep the water shaded.',
        signature: 'La familia de la truchera', signature_en: 'The family at the trout farm' } },
      { id: 'carta', type: 'carta', on: true, s: { title: 'La carta', title_en: 'Menu', intro: '', layout: 'tarjetas', priceStyle: 'full', showFilters: true, showSearch: false, footnote: 'Precios en pesos colombianos (COP), impuestos incluidos. La propina es voluntaria.', footnote_en: 'Prices in Colombian pesos (COP), taxes included. Tipping is voluntary.' } },
      { id: 'pesca', type: 'libre', on: true, s: { kicker: 'En los estanques', kicker_en: 'At the ponds', title: 'Pesque su trucha', title_en: 'Catch your own trout',
        text: 'Le prestamos la caña y la carnada. Usted la pesca, nosotros la limpiamos y se la preparamos como quiera.\n\n$45.000 el kilo, preparación incluida.',
        text_en: 'We lend you the rod and bait. You catch it, we clean it and cook it the way you like.\n\n$45,000 COP per kilo, cooking included.',
        style: 'destacado', btnLabel: 'Reservar', btnLabel_en: 'Book a table', btnTarget: 'reservas', url: '', waText: '' } },
      { id: 'servicios', type: 'servicios', on: true, s: { title: 'Servicios', title_en: 'Amenities', list: ['parqueadero', 'mascotas', 'infantil', 'terraza', 'accesible', 'tarjeta', 'ingles'], extra: 'Hamacas, Zona de fogata', extra_en: 'Hammocks, Bonfire area', note: 'Parqueadero gratis para clientes.', note_en: 'Free parking for customers.' } },
      { id: 'galeria', type: 'galeria', on: true, s: { title: 'El lugar', title_en: 'The place', layout: 'carrusel', items: [
        { img: '', emoji: '🎣', caption: 'Los estanques de trucha', caption_en: 'The trout ponds' },
        { img: '', emoji: '🌲', caption: 'El bosque de alisos', caption_en: 'The alder woods' },
        { img: '', emoji: '🔥', caption: 'El ahumador de leña', caption_en: 'Our wood smoker' },
        { img: '', emoji: '🧺', caption: 'La terraza junto al río', caption_en: 'The riverside terrace' }
      ] } },
      { id: 'reservas', type: 'reservas', on: true, s: { title: 'Reserve su mesa', title_en: 'Book a table', text: 'Recibimos grupos de hasta veinte personas. Para más, escríbanos.', text_en: 'We welcome groups of up to twenty people. For larger groups, message us.', slots: '11:30, 13:00, 14:30, 16:00', maxPeople: 20, occasions: 'Paseo familiar, Cumpleaños, Grupo de turistas', occasions_en: 'Family outing, Birthday, Tour group', note: 'Confirmamos su reserva por WhatsApp.', note_en: 'We confirm your booking on WhatsApp.' } },
      { id: 'faq', type: 'faq', on: true, s: { title: 'Preguntas frecuentes', title_en: 'FAQ', items: [
        { q: '¿Qué tan lejos están de los termales?', q_en: 'How far are you from the hot springs?', a: 'A unos diez minutos en carro, sobre la misma vía.', a_en: 'About ten minutes by car, on the same road.' },
        { q: '¿Puedo pagar con tarjeta?', q_en: 'Can I pay by card?', a: 'Sí, con tarjeta débito o crédito, Nequi y Daviplata.', a_en: 'Yes: debit and credit cards, Nequi and Daviplata.' },
        { q: '¿Aceptan mascotas?', q_en: 'Are pets allowed?', a: 'Sí, en la terraza y con correa.', a_en: 'Yes, on the terrace and on a leash.' },
        { q: '¿Tienen platos sin trucha?', q_en: 'Do you have dishes without trout?', a: 'Sí: chorizo, picada campestre, patacones y crema de ahuyama.', a_en: 'Yes: chorizo, the country platter, patacones and pumpkin soup.' }
      ] } },
      { id: 'resenas', type: 'resenas', on: true, s: { title: '¿Le gustó la visita?', title_en: 'Did you enjoy your visit?', text: 'Su reseña ayuda a que otros viajeros nos encuentren camino a los termales.', text_en: 'Your review helps other travelers find us on the way to the hot springs.', rating: '', quotes: [] } },
      { id: 'horario', type: 'horario', on: true, s: { title: 'Horario', title_en: 'Opening hours', note: 'Festivos, de 10:00 a. m. a 7:00 p. m.', note_en: 'Public holidays: 10:00 a.m. to 7:00 p.m.' } },
      { id: 'ubicacion', type: 'ubicacion', on: true, s: { title: 'Cómo llegar', title_en: 'How to get here', text: '' } },
      { id: 'contacto', type: 'contacto', on: true, s: { title: 'Contacto', title_en: 'Contact' } }
    ],
    meta: { credit: true }
  },

  /* ---------- 7. COMIDA RÁPIDA NOCTURNA · NOCTURNA ---------- */
  {
    v: 1, id: 'tpl-esquina', template: true,
    brand: {
      name: 'La Esquina', tagline: 'Hamburguesas, perros y picadas hasta tarde', kind: 'Comida rápida',
      logo: { type: 'emoji', value: '🍔' },
      city: 'Santa Rosa de Cabal, Risaralda', address: 'Centro', addressNote: 'En la esquina de la plaza de mercado.',
      mapsQuery: 'Plaza de mercado, Santa Rosa de Cabal', maps: '',
      whatsapp: '', phone: '', instagram: '', facebook: '', tiktok: '', reviewUrl: '', tz: 'America/Bogota',
      hours: HOURS({ 1: null, 2: ['17:00', '00:00'], 3: ['17:00', '00:00'], 4: ['17:00', '00:00'], 5: ['17:00', '02:00'], 6: ['17:00', '02:00'], 0: ['16:00', '23:00'] })
    },
    i18n: { bilingual: false, usted: false },
    theme: {
      skin: 'nocturna',
      colors: { bg: '#0E0B16', surface: '#181427', ink: '#F4F1FF', muted: '#A9A3C4', accent: '#FF4F9A', accent2: '#2EE6C8', accent3: '#FFC247' },
      fonts: { display: 'Tilt Neon', body: 'Barlow' }, radius: 12, motion: 'vivo', texture: 'none', icons: 'emoji'
    },
    menu: {
      categories: [
        { id: 'hamburguesas', name: 'Hamburguesas', icon: '🍔', note: 'Carne de res de 150 g al carbón, en pan brioche', items: [
          IT('clasica', 'Clásica', 'Queso, tomate, lechuga, cebolla y salsa de la casa.', 19900, '🍔', ['popular']),
          IT('doble', 'Doble queso con tocineta', 'Doble carne, doble cheddar y tocineta crocante.', 25900, '🧀', ['chef']),
          IT('ranchera', 'Ranchera', 'Carne, chorizo santarrosano, maicitos, huevo y papa ripio.', 27900, '🥓', ['local']),
          IT('picante', 'La picante', 'Jalapeños, queso pepper jack y ají de la casa.', 24900, '🌶️', ['picante']),
          IT('garbanzo', 'De garbanzo', 'Medallón de garbanzo y verduras asadas, con salsa de yogur.', 21900, '🥗', ['vegetariano'])
        ] },
        { id: 'perros', name: 'Perros', icon: '🌭', note: '', items: [
          IT('americano', 'Perro americano', 'Salchicha americana, cebolla, papa ripio y salsas.', 14900, '🌭'),
          IT('ranchero', 'Perro ranchero', 'Salchicha, tocineta, maicitos, queso gratinado y huevos de codorniz.', 18900, '🌭', ['popular']),
          IT('choriperro', 'Choriperro santarrosano', 'Chorizo de Santa Rosa en pan, con hogao y queso.', 17900, '🌭', ['chef', 'local'])
        ] },
        { id: 'picadas', name: 'Salchipapas y picadas', icon: '🍟', note: '', items: [
          IT('salchipapa', 'Salchipapa sencilla', 'Papas a la francesa, salchicha y salsas.', 13900, '🍟'),
          IT('salchipapa-casa', 'Salchipapa de la casa', 'Papas, salchicha, chorizo, pollo, queso gratinado y huevos de codorniz.', 21900, '🍟', ['compartir']),
          IT('mazorcada', 'Mazorcada', 'Maíz tierno, pollo desmechado, queso gratinado y papa ripio.', 24900, '🌽'),
          IT('picada', 'Picada para dos', 'Chorizo, chicharrón, carne, pollo, papa criolla, arepitas y guacamole.', 42900, '🍖', ['compartir', 'popular'])
        ] },
        { id: 'ninos', name: 'Para los niños', icon: '🧒', note: 'Con papas y jugo', items: [
          IT('mini', 'Mini hamburguesa', 'Carne, queso y salsa de tomate.', 16900, '🍔', ['ninos']),
          IT('deditos', 'Deditos de pollo', 'Cinco deditos apanados con salsa de miel y mostaza.', 15900, '🍗', ['ninos'])
        ] },
        { id: 'bebidas', name: 'Bebidas', icon: '🥤', note: '', items: [
          IT('gaseosa', 'Gaseosa', 'Personal, bien fría.', 4500, '🥤'),
          IT('coco', 'Limonada de coco', 'Cremosa, con leche de coco.', 9900, '🥥', ['nuevo']),
          IT('malteada', 'Malteada de vainilla', 'Con helado artesanal.', 12900, '🥤'),
          IT('cerveza', 'Cerveza nacional', 'Solo para mayores de 18 años.', 6500, '🍺'),
          IT('michelada', 'Michelada', 'Cerveza con limón, sal y salsas. Solo para mayores de 18 años.', 9500, '🍺')
        ] }
      ]
    },
    modules: [
      { id: 'aviso', type: 'aviso', on: true, s: { text: 'Martes y miércoles: domicilio gratis en el casco urbano.', icon: '🛵', style: 'acento', until: '', cta: 'pedido' } },
      { id: 'hero', type: 'hero', on: true, s: { kicker: 'Santa Rosa de Cabal', title: '', subtitle: 'Hamburguesas al carbón, perros, salchipapas y picadas. Pide en la mesa o a domicilio.', cta1: 'carta', cta2: 'pedido', showStatus: true, ribbon: 'Hamburguesas al carbón, Perros, Salchipapas, Picadas, Domicilios', img: '', veil: '60', align: 'auto', size: 'm' } },
      { id: 'promos', type: 'promos', on: true, s: { title: 'Promos de la semana', highlightToday: true, items: [
        { days: [2], title: 'Martes de perros 2×1', desc: 'En perro americano y ranchero, toda la noche.', price: 0 },
        { days: [3], title: 'Miércoles de salchipapa', desc: 'Salchipapa de la casa con dos gaseosas.', price: 26900 },
        { days: [4], title: 'Jueves de parche', desc: 'Picada para dos con dos cervezas nacionales.', price: 49900 },
        { days: [5, 6], title: 'Abierto hasta las 2:00 a. m.', desc: 'Cocina y domicilios hasta la 1:30 a. m.', price: 0 },
        { days: [0], title: 'Domingo en familia', desc: 'Cuatro hamburguesas clásicas con papas.', price: 69900 }
      ] } },
      { id: 'casa', type: 'destacados', on: true, s: { title: 'Las de la casa', tag: 'chef', max: 4 } },
      { id: 'carta', type: 'carta', on: true, s: { title: 'La carta', intro: '', layout: 'fotos', priceStyle: 'full', showFilters: true, showSearch: true, footnote: 'Todos los precios incluyen impuestos.' } },
      { id: 'ruleta', type: 'ruleta', on: true, s: { title: 'Gira y gana', text: 'Un giro al día por celular. Muéstrale el premio a quien te atiende.', mode: 'premios', category: '', options: [{ label: 'Papas gratis' }, { label: 'Gaseosa gratis' }, { label: '10 % de descuento' }, { label: 'Sigue intentando' }, { label: 'Malteada a mitad de precio' }], oncePerDay: true } },
      { id: 'pedido', type: 'pedido', on: true, s: { title: 'Cómo pedir', showSection: true, modes: { mesa: true, llevar: true, domicilio: true }, deliveryFee: 4000, minOrder: 20000, deliveryNote: 'Domicilios en el casco urbano; viernes y sábado hasta la 1:30 a. m.', payments: 'Efectivo, Nequi, Daviplata, Tarjeta', intro: '' } },
      { id: 'servicios', type: 'servicios', on: true, s: { title: 'Servicios', list: ['domicilios', 'tarjeta', 'transferencia', 'wifi', 'musica'], extra: 'Pantalla para partidos', note: '' } },
      { id: 'resenas', type: 'resenas', on: true, s: { title: '¿Qué tal estuvo?', text: 'Cuéntanos en Google o por WhatsApp. Leemos todo.', rating: '', quotes: [] } },
      { id: 'horario', type: 'horario', on: true, s: { title: 'Horario', note: 'Lunes cerrado. Festivos, de 5:00 p. m. a 12:00 a. m.' } },
      { id: 'ubicacion', type: 'ubicacion', on: true, s: { title: 'Dónde estamos', text: '' } },
      { id: 'contacto', type: 'contacto', on: true, s: { title: 'Síguenos' } }
    ],
    meta: { credit: true }
  }
];

/* Íconos de línea elegidos a mano, donde el plato no lleva emoji o su emoji no tiene un equivalente claro
   (la trucha al ajillo lleva un ajo; en modo íconos debe verse un pescado). */
const ICO = {
  'tpl-araucaria': { 'chorizo-curado': 'chorizo', 'tartar-trucha': 'pescado', hongos: 'hongo', arracacha: 'sopa', lomo: 'carne', costilla: 'carne', pollo: 'pollo', risotto: 'maiz',
    trucha: 'pescado', 'pesca-cafe': 'pescado', brevas: 'miel', esfera: 'postre', natilla: 'postre', 'vino-tinto': 'vino', 'vino-blanco': 'vino', sour: 'coctel', 'gin-uchuva': 'coctel',
    'sin-alcohol': 'vaso', espresso: 'cafe', filtrado: 'cafe', carajillo: 'cafe' },
  'tpl-zocalo': { 'chorizo-arepa': 'chorizo', 'chocolate-queso': 'cafe', patacon: 'arepa', aguapanela: 'vaso' },
  'tpl-espiga': { 'pan-bono': 'pan', almojabana: 'pan', parfait: 'postre', 'torta-naranja': 'torta', natas: 'postre', zanahoria: 'torta' },
  'tpl-neblina': { latte: 'cafe', sifon: 'cafe', 'pan-banano': 'pan', 'torta-zanahoria': 'torta', tostada: 'pan', limonada: 'vaso' },
  'tpl-alisos': { ajillo: 'pescado', gratinada: 'pescado', ceviche: 'pescado', chorizo: 'chorizo', patacones: 'arepa', ahuyama: 'sopa', limonada: 'vaso', mora: 'vaso', aguapanela: 'vaso',
    natas: 'postre', 'arroz-leche': 'postre' }
};
TEMPLATES.forEach(function (t) {
  const map = ICO[t.id]; if (!map) return;
  t.menu.categories.forEach(function (c) { c.items.forEach(function (it) { if (map[it.id]) it.ico = map[it.id]; }); });
});

function blankApp(name) {
  return {
    v: 1, id: 'nueva', template: false,
    brand: {
      name: name || 'Mi local', tagline: '', kind: 'Restaurante', logo: { type: 'mono', value: '' },
      city: '', address: '', addressNote: '', mapsQuery: '', maps: '',
      whatsapp: '', phone: '', instagram: '', facebook: '', tiktok: '', reviewUrl: '', tz: 'America/Bogota',
      hours: HOURS({ 1: ['08:00', '20:00'], 2: ['08:00', '20:00'], 3: ['08:00', '20:00'], 4: ['08:00', '20:00'], 5: ['08:00', '20:00'], 6: ['08:00', '20:00'], 0: null })
    },
    i18n: { bilingual: false, usted: false },
    theme: {
      skin: 'elegante',
      colors: { bg: '#FFFFFF', surface: '#F4F5F2', ink: '#1C1C1A', muted: '#66675F', accent: '#2F5D50', accent2: '#B4874A', accent3: '#7A7B72' },
      fonts: { display: 'Playfair Display', body: 'Work Sans' }, radius: 8, motion: 'suave', texture: 'none', icons: 'linea'
    },
    menu: { categories: [{ id: 'cat-1', name: 'Entradas', icon: '', note: '', items: [IT('plato-1', 'Primer plato', 'Describe el plato en una línea.', 15000)] }] },
    modules: [
      { id: 'hero', type: 'hero', on: true, s: { kicker: '', title: '', subtitle: '', cta1: 'carta', cta2: 'ubicacion', showStatus: true, ribbon: '' } },
      { id: 'carta', type: 'carta', on: true, s: { title: '', intro: '', layout: 'lista', priceStyle: 'full', showFilters: true, showSearch: false, footnote: '' } },
      { id: 'horario', type: 'horario', on: true, s: { title: '', note: '' } },
      { id: 'ubicacion', type: 'ubicacion', on: true, s: { title: '', text: '' } },
      { id: 'contacto', type: 'contacto', on: true, s: { title: '' } }
    ],
    meta: { credit: true }
  };
}
