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
      fonts: { display: 'Bodoni Moda', body: 'Jost' }, radius: 2, motion: 'suave', texture: 'grano'
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
      fonts: { display: 'Lilita One', body: 'Nunito' }, radius: 18, motion: 'vivo', texture: 'puntos'
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
      fonts: { display: 'Alfa Slab One', body: 'Alegreya Sans' }, radius: 6, motion: 'suave', texture: 'none'
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
  }
];

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
      fonts: { display: 'Playfair Display', body: 'Work Sans' }, radius: 8, motion: 'suave', texture: 'none'
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
