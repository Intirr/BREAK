/* Break · motor de apps de menú.
   Una sola función autocontenida: el estudio la usa para la vista previa
   y la incrusta (vía toString) en cada app exportada. No depende de nada externo. */
function breakApp(win, doc, initialCfg, opts) {
  'use strict';
  opts = opts || {};
  const PREVIEW = opts.mode === 'preview';

  /* ---------- Tipografías (Google Fonts) ---------- */
  const FONTS = {
    'Bodoni Moda': [':ital,wght@0,400;0,500;0,600;1,400;1,500', 'Didot, "Bodoni 72", Georgia, serif'],
    'Cormorant Garamond': [':ital,wght@0,400;0,500;0,600;1,400', 'Garamond, Georgia, serif'],
    'Playfair Display': [':ital,wght@0,400;0,600;0,700;1,400', 'Georgia, serif'],
    'Fraunces': [':ital,wght@0,400;0,600;0,800;1,400', 'Georgia, serif'],
    'Lilita One': ['', '"Arial Rounded MT Bold", system-ui, sans-serif'],
    'Fredoka': [':wght@400;500;600;700', '"Arial Rounded MT Bold", system-ui, sans-serif'],
    'Bricolage Grotesque': [':wght@400;600;800', 'system-ui, sans-serif'],
    'Baloo 2': [':wght@400;600;800', 'system-ui, sans-serif'],
    'Alfa Slab One': ['', 'Rockwell, "Roboto Slab", Georgia, serif'],
    'Yeseva One': ['', 'Georgia, serif'],
    'Abril Fatface': ['', 'Georgia, serif'],
    'Young Serif': ['', 'Georgia, "Times New Roman", serif'],
    'Tilt Neon': ['', '"Arial Rounded MT Bold", system-ui, sans-serif'],
    'Schibsted Grotesk': [':ital,wght@0,400;0,500;0,700;0,800;1,400', '"Helvetica Neue", Arial, system-ui, sans-serif'],
    'Barlow': [':ital,wght@0,400;0,500;0,600;0,700;1,400', 'system-ui, sans-serif'],
    'Instrument Sans': [':ital,wght@0,400;0,500;0,600;0,700;1,400', '"Helvetica Neue", Arial, system-ui, sans-serif'],
    'DM Serif Display': [':ital@0;1', 'Georgia, serif'],
    'Archivo Black': ['', '"Arial Black", system-ui, sans-serif'],
    'Pacifico': ['', '"Brush Script MT", cursive'],
    'Caveat': [':wght@400;600;700', '"Comic Sans MS", cursive'],
    'Oswald': [':wght@400;500;600;700', '"Arial Narrow", system-ui, sans-serif'],
    'Rubik': [':ital,wght@0,400;0,500;0,700;1,400', 'system-ui, sans-serif'],
    'Outfit': [':wght@400;500;600;700', 'system-ui, sans-serif'],
    'Source Serif 4': [':ital,wght@0,400;0,600;1,400', 'Georgia, serif'],
    'Jost': [':ital,wght@0,300;0,400;0,500;0,600;1,300', 'system-ui, sans-serif'],
    'Nunito': [':ital,wght@0,400;0,600;0,700;0,800;0,900;1,600', 'system-ui, sans-serif'],
    'Alegreya Sans': [':ital,wght@0,400;0,500;0,700;0,800;1,400', 'system-ui, sans-serif'],
    'DM Sans': [':ital,wght@0,400;0,500;0,700;1,400', 'system-ui, sans-serif'],
    'Work Sans': [':ital,wght@0,400;0,500;0,700;1,400', 'system-ui, sans-serif'],
    'Karla': [':ital,wght@0,400;0,500;0,700;1,400', 'system-ui, sans-serif'],
    'Lora': [':ital,wght@0,400;0,600;1,400', 'Georgia, serif'],
    'Libre Franklin': [':ital,wght@0,400;0,600;0,800;1,400', 'system-ui, sans-serif'],
    'Figtree': [':wght@400;600;700', 'system-ui, sans-serif']
  };

  /* ---------- Textos de interfaz ---------- */
  const UI = {
    es: {
      menu: 'Secciones', close: 'Cerrar', open: 'Abierto', closed: 'Cerrado',
      stOpen: 'Abierto ahora · cierra a las {t}', stClosedToday: 'Cerrado · abre hoy a las {t}',
      stClosedTomorrow: 'Cerrado · abre mañana a las {t}', stClosedDay: 'Cerrado · abre el {d} a las {t}', stClosedNoInfo: 'Cerrado por ahora',
      today: 'hoy', all: 'Todo', search: 'Buscar en la carta', noResults: 'No hay platos con ese filtro.', soldOut: 'Agotado',
      add: 'Agregar', added: 'Agregado a tu pedido', viewOrder: 'Ver pedido', yourOrder: 'Tu pedido',
      subtotal: 'Subtotal', delivery: 'Domicilio', toAgree: 'Por confirmar', total: 'Total',
      howWant: '¿Cómo lo quieres?', mode_mesa: 'En la mesa', mode_llevar: 'Para llevar', mode_domicilio: 'Domicilio', modeLbl: 'Entrega',
      table: 'Número de mesa', address: 'Dirección de entrega', name: 'Nombre', pay: 'Forma de pago', notes: 'Notas',
      notesPh: 'Sin cebolla, salsa aparte…', resNotesPh: 'Silla para bebé, mesa en terraza…',
      sendWa: 'Enviar pedido por WhatsApp', clear: 'Vaciar pedido',
      emptyCart: 'Tu pedido está vacío. Toca + en la carta para agregar productos.', pickFirst: 'Primero agrega productos desde la carta.',
      errTable: 'Escribe el número de tu mesa.', errName: 'Escribe tu nombre.', errAddress: 'Escribe la dirección de entrega.',
      errMin: 'El pedido mínimo para domicilio es {v}.', minShort: 'pedido mínimo {v}',
      waTitle: 'Revisa el mensaje', waOpen: 'Abrir WhatsApp', waCopy: 'Copiar mensaje', copied: 'Copiado', copyManual: 'Mantén presionado el texto para copiarlo.',
      waMissing: 'Este local todavía no tiene WhatsApp configurado. Puedes copiar el mensaje.',
      waMissingPreview: 'Agrega el número de WhatsApp en Datos para activar el envío.',
      date: 'Fecha', time: 'Hora', people: 'Personas', occasion: 'Ocasión', sendRes: 'Solicitar reserva',
      errDate: 'Elige la fecha.', errTime: 'Elige la hora.', qty: 'Cantidad', todayBadge: 'Hoy',
      lunch: 'Pedir almuerzo', lunchToday: 'Hoy hay almuerzo',
      stampBtn: 'Sellar mi tarjeta', redeemBtn: 'Canjear premio', pinTitle: 'Código del local',
      pinHint: 'Lo digita la persona que te atiende.', wrongPin: 'Código incorrecto. Intenta de nuevo.',
      stampOk: '¡Sello agregado!', prize: '¡Completaste tu tarjeta!', redeemed: 'Premio canjeado. Tu tarjeta empieza de nuevo.', stampsOf: '{n} de {g} sellos',
      spin: 'Girar la ruleta', spinAgain: 'Girar otra vez', spunToday: 'Ya giraste hoy. Vuelve mañana.',
      got: 'Te tocó', showStaff: 'Muéstrale esta pantalla a quien te atiende.', seeDish: 'Ver plato',
      next: 'Siguiente', again: 'Jugar de nuevo', score: 'Acertaste {s} de {t}', correct: '¡Correcto!', wrong: 'No era esa.', qOf: 'Pregunta {i} de {t}',
      mapsBtn: 'Abrir en Google Maps', wazeBtn: 'Ir con Waze', since: 'Desde {y}',
      network: 'Red', password: 'Clave', copyPass: 'Copiar clave', rsvp: 'Apartar cupo',
      reviewG: 'Escribir reseña en Google', reviewWa: 'Contarnos por WhatsApp', onGoogle: 'en Google',
      share: 'Compartir esta carta', shareSub: 'Envíasela a quien venga contigo', sharePreview: 'En la app publicada se comparte su enlace.',
      call: 'Llamar', writeUs: 'Escríbenos', credit: 'Hecho con Break', facade: 'Fachada de casa de bahareque',
      how1: 'Elige en la carta y toca +.', how2: 'Revisa tu pedido y dinos cómo lo quieres.', how3: 'Lo envías por WhatsApp y el local te confirma.',
      cta_carta: 'Ver la carta', cta_reservas: 'Reservar mesa', cta_pedido: 'Hacer un pedido', cta_sellos: 'Mi tarjeta de sellos',
      cta_ubicacion: 'Cómo llegar', cta_whatsapp: 'Escríbenos', cta_eventos: 'Ver la agenda',
      t_carta: 'La carta', t_destacados: 'Recomendados', t_promos: 'Promociones', t_menudia: 'Menú del día', t_pedido: 'Cómo pedir',
      t_reservas: 'Reservas', t_sellos: 'Tarjeta de sellos', t_resenas: 'Reseñas', t_horario: 'Horario', t_ubicacion: 'Cómo llegar',
      t_historia: 'Nuestra historia', t_glosario: 'Glosario', t_eventos: 'Agenda', t_wifi: 'Wi-Fi', t_ruleta: 'Ruleta', t_trivia: 'Trivia',
      t_contacto: 'Contacto', t_libre: 'Información',
      greet: 'Hola, {n}.', orderIntro: 'Hola, {n}. Quiero hacer este pedido:', resIntro: 'Hola, {n}. Quisiera reservar una mesa:',
      resFor: 'A nombre de', rsvpMsg: 'Hola, {n}. Quiero apartar cupo para «{e}» ({w}).',
      reviewMsg: 'Hola, {n}. Quiero contarles cómo me fue en mi visita:', guestEn: 'El cliente habla inglés.',
      dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
      everyday: 'Todos los días', and: 'y', to: 'a',
      tags: { chef: 'Recomendado', nuevo: 'Nuevo', popular: 'Favorito', vegano: 'Vegano', vegetariano: 'Vegetariano', picante: 'Picante', singluten: 'Sin gluten', local: 'De la región', temporada: 'De temporada', compartir: 'Para compartir', ninos: 'Para niños', sinlactosa: 'Sin lactosa' }
    },
    en: {
      menu: 'Sections', close: 'Close', open: 'Open', closed: 'Closed',
      stOpen: 'Open now · closes at {t}', stClosedToday: 'Closed · opens today at {t}',
      stClosedTomorrow: 'Closed · opens tomorrow at {t}', stClosedDay: 'Closed · opens {d} at {t}', stClosedNoInfo: 'Closed for now',
      today: 'today', all: 'All', search: 'Search the menu', noResults: 'No dishes match that filter.', soldOut: 'Sold out',
      add: 'Add', added: 'Added to your order', viewOrder: 'View order', yourOrder: 'Your order',
      subtotal: 'Subtotal', delivery: 'Delivery', toAgree: 'To be confirmed', total: 'Total',
      howWant: 'How would you like it?', mode_mesa: 'At my table', mode_llevar: 'Take away', mode_domicilio: 'Delivery', modeLbl: 'Order type',
      table: 'Table number', address: 'Delivery address', name: 'Name', pay: 'Payment', notes: 'Notes',
      notesPh: 'No onion, sauce on the side…', resNotesPh: 'High chair, terrace table…',
      sendWa: 'Send order on WhatsApp', clear: 'Empty order',
      emptyCart: 'Your order is empty. Tap + on the menu to add items.', pickFirst: 'Add something from the menu first.',
      errTable: 'Enter your table number.', errName: 'Enter your name.', errAddress: 'Enter the delivery address.',
      errMin: 'Minimum delivery order is {v}.', minShort: 'minimum order {v}',
      waTitle: 'Check your message', waOpen: 'Open WhatsApp', waCopy: 'Copy message', copied: 'Copied', copyManual: 'Press and hold the text to copy it.',
      waMissing: 'This place has not set up WhatsApp yet. You can copy the message.',
      waMissingPreview: 'Add the WhatsApp number in Datos to enable sending.',
      date: 'Date', time: 'Time', people: 'Guests', occasion: 'Occasion', sendRes: 'Request booking',
      errDate: 'Choose a date.', errTime: 'Choose a time.', qty: 'Quantity', todayBadge: 'Today',
      lunch: 'Order lunch', lunchToday: 'Lunch is on today',
      stampBtn: 'Stamp my card', redeemBtn: 'Redeem reward', pinTitle: 'Staff code',
      pinHint: 'Entered by the person serving you.', wrongPin: 'Wrong code. Try again.',
      stampOk: 'Stamp added!', prize: 'Your card is complete!', redeemed: 'Reward redeemed. Your card starts again.', stampsOf: '{n} of {g} stamps',
      spin: 'Spin the wheel', spinAgain: 'Spin again', spunToday: 'You already spun today. Come back tomorrow.',
      got: 'You got', showStaff: 'Show this screen to your server.', seeDish: 'See dish',
      next: 'Next', again: 'Play again', score: 'You got {s} of {t} right', correct: 'Correct!', wrong: 'Not that one.', qOf: 'Question {i} of {t}',
      mapsBtn: 'Open in Google Maps', wazeBtn: 'Go with Waze', since: 'Since {y}',
      network: 'Network', password: 'Password', copyPass: 'Copy password', rsvp: 'Save a spot',
      reviewG: 'Review us on Google', reviewWa: 'Tell us on WhatsApp', onGoogle: 'on Google',
      share: 'Share this menu', shareSub: 'Send it to whoever is coming with you', sharePreview: 'The published app shares its link.',
      call: 'Call', writeUs: 'Message us', credit: 'Made with Break', facade: 'Front of a bahareque house',
      how1: 'Pick from the menu and tap +.', how2: 'Check your order and tell us how you want it.', how3: 'Send it on WhatsApp and the place confirms.',
      cta_carta: 'See the menu', cta_reservas: 'Book a table', cta_pedido: 'Place an order', cta_sellos: 'My stamp card',
      cta_ubicacion: 'How to get here', cta_whatsapp: 'Message us', cta_eventos: 'See what’s on',
      t_carta: 'Menu', t_destacados: 'Recommended', t_promos: 'Deals', t_menudia: 'Set lunch', t_pedido: 'How to order',
      t_reservas: 'Bookings', t_sellos: 'Stamp card', t_resenas: 'Reviews', t_horario: 'Opening hours', t_ubicacion: 'How to get here',
      t_historia: 'Our story', t_glosario: 'Glossary', t_eventos: 'What’s on', t_wifi: 'Wi-Fi', t_ruleta: 'Wheel', t_trivia: 'Trivia',
      t_contacto: 'Contact', t_libre: 'Information',
      dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      everyday: 'Every day', and: 'and', to: 'to',
      tags: { chef: 'Chef’s pick', nuevo: 'New', popular: 'Favorite', vegano: 'Vegan', vegetariano: 'Vegetarian', picante: 'Spicy', singluten: 'Gluten-free', local: 'Local', temporada: 'Seasonal', compartir: 'To share', ninos: 'Kids', sinlactosa: 'Dairy-free' }
    }
  };
  /* Trato de usted: solo cambian las frases que le hablan al cliente. */
  const ES_USTED = {
    emptyCart: 'Su pedido está vacío. Toque + en la carta para agregar productos.', pickFirst: 'Primero agregue productos desde la carta.',
    errTable: 'Escriba el número de su mesa.', errName: 'Escriba su nombre.', errAddress: 'Escriba la dirección de entrega.',
    waTitle: 'Revise el mensaje', waMissing: 'Este local todavía no tiene WhatsApp configurado. Puede copiar el mensaje.',
    yourOrder: 'Su pedido', howWant: '¿Cómo lo desea?', added: 'Agregado a su pedido', errDate: 'Elija la fecha.', errTime: 'Elija la hora.',
    pinHint: 'Lo digita la persona que lo atiende.', wrongPin: 'Código incorrecto. Intente de nuevo.',
    prize: '¡Completó su tarjeta!', redeemed: 'Premio canjeado. Su tarjeta empieza de nuevo.',
    spunToday: 'Ya giró hoy. Vuelva mañana.', got: 'Le tocó', showStaff: 'Muéstrele esta pantalla a quien lo atiende.',
    score: 'Acertó {s} de {t}', shareSub: 'Envíela a quien venga con usted', writeUs: 'Escríbanos', cta_whatsapp: 'Escríbanos',
    how1: 'Elija en la carta y toque +.', how2: 'Revise su pedido y díganos cómo lo desea.', how3: 'Lo envía por WhatsApp y el local le confirma.',
    copyManual: 'Mantenga presionado el texto para copiarlo.', reviewWa: 'Cuéntenos por WhatsApp'
  };
  const TAG_ORDER = ['chef', 'popular', 'nuevo', 'temporada', 'local', 'compartir', 'ninos', 'vegano', 'vegetariano', 'singluten', 'sinlactosa', 'picante'];
  const NAVABLE = { carta: 1, destacados: 1, promos: 1, menudia: 1, reservas: 1, sellos: 1, resenas: 1, horario: 1, ubicacion: 1, historia: 1, glosario: 1, eventos: 1, wifi: 1, ruleta: 1, trivia: 1, contacto: 1, libre: 1, pedido: 1 };

  /* ---------- CSS ---------- */
  const ZZ = 'linear-gradient(135deg,var(--accent) 25%,transparent 25%) -10px 0/20px 20px,linear-gradient(225deg,var(--accent) 25%,transparent 25%) -10px 0/20px 20px,linear-gradient(315deg,var(--accent) 25%,transparent 25%) 0 0/20px 20px,linear-gradient(45deg,var(--accent) 25%,transparent 25%) 0 0/20px 20px,var(--accent3)';
  /* Máscaras SVG: la forma viene del SVG y el color del tema (background + mask). */
  const LEAF = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 14\'%3E%3Cpath d=\'M1 7C5 1 15 0 23 7C15 14 5 13 1 7Z\'/%3E%3C/svg%3E")';
  const SQUIG = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 60 10\'%3E%3Cpath d=\'M0 5Q7.5 0 15 5T30 5T45 5T60 5\' fill=\'none\' stroke=\'%23000\' stroke-width=\'2.2\' stroke-linecap=\'round\'/%3E%3C/svg%3E")';
  /* Hojas y ondas se dibujan en el fondo con el color de la paleta ya puesto (ver texCSS). */
  const LEAF_PATHS = '%3Cpath d=\'M12 30C20 21 34 21 42 30C34 39 20 39 12 30Z\' transform=\'rotate(-28 27 30)\'/%3E%3Cpath d=\'M70 22C78 13 92 13 100 22C92 31 78 31 70 22Z\' transform=\'rotate(40 85 22)\'/%3E%3Cpath d=\'M24 88C32 79 46 79 54 88C46 97 32 97 24 88Z\' transform=\'rotate(62 39 88)\'/%3E%3Cpath d=\'M76 84C84 75 98 75 106 84C98 93 84 93 76 84Z\' transform=\'rotate(-58 91 84)\'/%3E%3Ccircle cx=\'60\' cy=\'56\' r=\'3\'/%3E%3Ccircle cx=\'66\' cy=\'60\' r=\'3\'/%3E';
  const CSS_BASE = `
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--fb);font-size:16px;line-height:1.55;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
[hidden]{display:none!important}
img{max-width:100%;display:block}
button,input,textarea,select{font:inherit;color:inherit}
button{cursor:pointer;background:none;border:0;padding:0;text-align:inherit}
a{color:inherit}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.app{max-width:600px;margin:0 auto;min-height:100vh;position:relative;padding-bottom:calc(112px + env(safe-area-inset-bottom,0px));overflow-x:clip}
.wrap{padding-left:max(20px,env(safe-area-inset-left,0px));padding-right:max(20px,env(safe-area-inset-right,0px))}
.vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.small{font-size:14px;color:var(--muted);margin:0}
.price{font-variant-numeric:tabular-nums;white-space:nowrap;font-weight:700}
.top{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;gap:10px;height:58px;padding:0 max(12px,env(safe-area-inset-right,0px)) 0 max(14px,env(safe-area-inset-left,0px));background:color-mix(in srgb,var(--bg) 90%,transparent);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.brand-mini{display:flex;align-items:center;gap:10px;min-width:0;font-family:var(--fd);font-size:19px;line-height:1.1}
.brand-mini b{font-weight:inherit;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.top-r{display:flex;align-items:center;gap:6px;flex:none}
.status{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:5px 10px;border-radius:999px;background:color-mix(in srgb,var(--ink) 8%,transparent);white-space:nowrap}
.status i,.hero-st i,.hstat i{width:8px;height:8px;border-radius:50%;background:#d9534f;display:inline-block;flex:none}
.status.on i,.hero-st.on i,.hstat.on i{background:#2fbf71;box-shadow:0 0 0 3px color-mix(in srgb,#2fbf71 28%,transparent)}
.lang{display:inline-flex;border-radius:999px;padding:2px;background:color-mix(in srgb,var(--ink) 8%,transparent)}
.lang button{font-size:12px;font-weight:800;padding:5px 9px;border-radius:999px;color:var(--muted)}
.lang button.on{background:var(--ink);color:var(--bg)}
.menu-btn{width:42px;height:42px;display:grid;place-content:center;gap:4px;border-radius:999px}
.menu-btn span{display:block;width:18px;height:2px;background:currentColor;border-radius:2px}
.logo{display:inline-grid;place-items:center;flex:none;overflow:hidden;border-radius:50%;line-height:1}
.logo.sm{width:32px;height:32px;font-size:15px}
.logo.lg{width:78px;height:78px;font-size:32px}
.logo.mono{background:var(--accent);color:var(--on-accent);font-family:var(--fd)}
.logo.emo{background:color-mix(in srgb,var(--ink) 8%,transparent)}
.logo img{width:100%;height:100%;object-fit:cover}
.m{padding-block:52px 4px;scroll-margin-top:64px}
.sh{margin-bottom:22px}
.sh-k{margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--accent)}
.sh-t{margin:0;font-family:var(--fd);font-weight:400;font-size:clamp(30px,8vw,40px);line-height:1.08;text-wrap:balance}
.lead-p{margin:-6px 0 20px;color:var(--muted);max-width:60ch}
.orn{display:none}
.btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}
.btns.center{justify-content:center}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:12px 20px;border-radius:var(--r);font-weight:700;font-size:15px;line-height:1.2;text-decoration:none;text-align:center;border:1.5px solid currentColor;transition:transform .15s ease,background-color .2s}
.btn.pri{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}
.btn.ghost{background:transparent;color:var(--ink)}
.btn.text{border-color:transparent;background:transparent;color:var(--muted);min-height:42px}
.btn.wide{width:100%}
.btn.sm{min-height:40px;padding:8px 14px;font-size:14px}
.btn:active{transform:scale(.97)}
.btn[disabled],.btn.disabled{opacity:.45;pointer-events:none}
.card{background:var(--surface);border-radius:var(--r);padding:20px}
.chips{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding:3px}
.chips::-webkit-scrollbar{display:none}
.chips.wrapc{flex-wrap:wrap;overflow:visible}
.chip{flex:none;display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:7px 15px;border-radius:999px;font-size:14px;font-weight:600;border:1.5px solid color-mix(in srgb,var(--ink) 20%,transparent);white-space:nowrap}
.chip.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.chips.static .chip{cursor:default}
.ci{font-size:1.05em;line-height:1}
.tag{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:3px 8px;border-radius:999px;background:color-mix(in srgb,var(--accent2) 22%,transparent);color:var(--ink)}
.tag.sold{background:color-mix(in srgb,var(--ink) 12%,transparent)}
.pv-empty{margin:0;padding:14px 16px;border:1.5px dashed color-mix(in srgb,var(--ink) 35%,transparent);border-radius:12px;font:600 13px/1.45 system-ui,sans-serif;color:var(--muted)}
.pv-focus{outline:3px solid #4361ee;outline-offset:-3px}
.m-hero{padding-block:44px 4px}
.hero-in{position:relative}
.hero-k{margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--accent)}
.hero-t{margin:0;font-family:var(--fd);font-weight:400;font-size:min(calc(clamp(48px,14vw,80px) * var(--hs,1)),var(--fit,999px));line-height:.98;letter-spacing:-.01em;text-wrap:balance;overflow-wrap:break-word}
.hero-s{margin:14px 0 0;font-size:18px;color:var(--muted);max-width:34ch}
.hero-st,.hstat{display:inline-flex;align-items:center;gap:8px;margin:16px 0 0;font-size:14px;font-weight:600}
.hstat{margin:0 0 14px}
.ribbon{margin-top:34px;overflow:hidden;white-space:nowrap;font-size:14px;color:var(--muted);padding-left:max(20px,env(safe-area-inset-left,0px));padding-right:max(20px,env(safe-area-inset-right,0px))}
.ribbon-track{display:inline-flex}
.ribbon-track span{padding-right:26px}
.zocalo{height:26px;margin-top:34px;background:${ZZ}}
.hero-box{position:relative;--fit:calc((min(100vw,600px) - 46px) / (var(--wl,6) * var(--gw,.56)))}
.hero-box.has-img{display:flex;flex-direction:column;justify-content:flex-end;min-height:min(66vh,560px);padding-top:84px;isolation:isolate}
section.m-hero:has(.hero-box.has-img:not(.ph-fail)){padding-top:0}
.hero-ph{position:absolute;inset:0;z-index:-1;overflow:hidden;background:color-mix(in srgb,var(--ink) 10%,var(--bg));-webkit-mask-image:linear-gradient(180deg,#000 58%,transparent 100%);mask-image:linear-gradient(180deg,#000 58%,transparent 100%)}
.hero-ph img{width:100%;height:100%;object-fit:cover}
.hero-ph i{position:absolute;inset:0;background:linear-gradient(180deg,color-mix(in srgb,var(--bg) calc(var(--veil) * .55),transparent) 0%,color-mix(in srgb,var(--bg) var(--veil),transparent) 55%,color-mix(in srgb,var(--bg) calc(var(--veil) + 20%),transparent) 100%)}
.ph-note{display:none;margin:0 20px 16px}
.hero-box.ph-fail{min-height:0;padding-top:0}
.ph-fail .hero-ph{display:none}
.ph-fail .ph-note{display:block}
.hs-s{--hs:.78}
.hs-l{--hs:1.14}
.al-izq .hero-in,.hero-box.al-izq .ribbon{text-align:left}
.hero-box.al-izq .hero-mono,.hero-box.al-izq .btns,.hero-box.al-izq .hero-k{justify-content:flex-start}
.hero-box.al-izq .hero-s,.hero-box.al-izq .orn{margin-inline:0}
.al-centro .hero-in,.hero-box.al-centro .ribbon{text-align:center}
.hero-box.al-centro .hero-mono,.hero-box.al-centro .btns,.hero-box.al-centro .hero-k,.hero-box.al-centro .ribbon-track{justify-content:center}
.hero-box.al-centro .hero-s,.hero-box.al-centro .orn{margin-inline:auto}
.search{display:block;margin-bottom:14px}
.search input{width:100%;min-height:48px;padding:10px 16px;border-radius:var(--r);border:1.5px solid color-mix(in srgb,var(--ink) 20%,transparent);background:var(--surface);font-size:16px}
.filters{margin:0 -3px 4px}
.cat-tabs{position:sticky;top:58px;z-index:20;padding:9px max(17px,env(safe-area-inset-left,0px));background:color-mix(in srgb,var(--bg) 94%,transparent);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.cat{padding-top:26px;scroll-margin-top:122px}
.cat-h{margin-bottom:12px}
.cat-h h3{margin:0;font-family:var(--fd);font-weight:400;font-size:26px;line-height:1.15;display:flex;align-items:center;gap:10px}
.cat-h p{margin:4px 0 0;font-size:14px;color:var(--muted)}
.items{display:grid;gap:12px}
.it{position:relative;cursor:pointer}
.it h4{margin:0;font-size:17px;line-height:1.25;font-weight:700}
.it-d{margin:4px 0 0;font-size:14px;color:var(--muted);line-height:1.45}
.it.off{opacity:.55}
.add{position:relative;flex:none;width:40px;height:40px;border-radius:50%;background:var(--accent);color:var(--on-accent);display:grid;place-items:center;font-size:24px;line-height:1;font-weight:700}
.add .q{position:absolute;top:-6px;right:-6px;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:var(--ink);color:var(--bg);font-size:11px;font-weight:800;display:grid;place-items:center}
.bump{animation:bump .4s ease}
@keyframes bump{30%{transform:scale(1.18)}60%{transform:scale(.94)}100%{transform:scale(1)}}
.media{display:grid;place-items:center;overflow:hidden;border-radius:calc(var(--r) * .8);background:color-mix(in srgb,var(--accent) 16%,transparent);max-width:100%}
.media span{line-height:1}
.media img{width:100%;height:100%;object-fit:cover}
.media.m1{background:color-mix(in srgb,var(--accent2) 20%,transparent)}
.media.m2{background:color-mix(in srgb,var(--accent3) 20%,transparent)}
.media.none span{font-family:var(--fd)}
.lay-lista .items{gap:0}
.lay-lista .it{padding:14px 0;border-bottom:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
.it-l{display:flex;align-items:baseline;gap:10px}
.it-l h4{min-width:0}
.lead{flex:1;min-width:14px;border-bottom:1.5px dotted color-mix(in srgb,var(--muted) 60%,transparent);transform:translateY(-4px)}
.it-f{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:8px}
.it-f:empty{display:none}
.lay-lista .add{width:34px;height:34px;font-size:20px;margin-left:auto}
.lay-tarjetas .it{display:grid;grid-template-columns:72px minmax(0,1fr) auto;gap:14px;align-items:start;padding:14px;background:var(--surface);border-radius:var(--r)}
.lay-tarjetas .media{width:72px;height:72px;font-size:36px}
.it-b{min-width:0}
.it-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.it-p{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:8px}
.lay-tarjetas .add{align-self:end}
.lay-cuadricula .items{grid-template-columns:repeat(2,minmax(0,1fr))}
.lay-cuadricula .it{display:flex;flex-direction:column;padding:12px;background:var(--surface);border-radius:var(--r)}
.lay-cuadricula .media{aspect-ratio:1;width:100%;font-size:54px;margin-bottom:10px}
.lay-cuadricula .it h4{font-size:15px}
.lay-cuadricula .it-p{margin-top:auto;padding-top:8px}
.lay-cuadricula .add{position:absolute;right:8px;top:8px;width:38px;height:38px}
.lay-cuadricula .it-tags{margin-top:6px}
.lay-fotos .items{gap:16px}
.lay-fotos .it{display:block;background:var(--surface);border-radius:var(--r);overflow:hidden}
.lay-fotos .media{aspect-ratio:16/10;width:100%;border-radius:0;font-size:80px}
.lay-fotos .it-b{padding:14px 16px 16px}
.lay-fotos .it-l h4{font-size:18px}
.lay-fotos .it-tags{margin-top:10px}
.lay-fotos .add{position:absolute;right:12px;top:12px}
.lay-compacta .items{gap:0}
.lay-compacta .it{padding:10px 0;border-bottom:1px solid color-mix(in srgb,var(--ink) 9%,transparent)}
.lay-compacta .it-l{align-items:center}
.lay-compacta .it h4{font-size:16px;font-weight:600}
.lay-compacta .lead{transform:none}
.lay-compacta .tag{flex:none}
.lay-compacta .add{width:30px;height:30px;font-size:18px;margin-left:4px}
.empty{color:var(--muted);padding:20px 0;margin:0}
.foot-note{font-size:13px;color:var(--muted);margin:24px 0 0}
.rail{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px max(20px,env(safe-area-inset-left,0px)) 14px;scrollbar-width:none;scroll-padding-left:20px}
.rail::-webkit-scrollbar{display:none}
.feat{flex:0 0 78%;max-width:300px;scroll-snap-align:start;background:var(--surface);border-radius:var(--r);overflow:hidden;cursor:pointer;display:flex;flex-direction:column}
.feat .media{aspect-ratio:16/10;width:100%;font-size:64px;border-radius:0}
.feat-b{padding:16px 18px 18px;display:grid;gap:6px;justify-items:start}
.feat-b h4{margin:0;font-size:18px;line-height:1.25}
.feat-b p{margin:0;font-size:14px;color:var(--muted)}
.promos{display:grid;gap:12px}
.promo{position:relative;padding:18px 20px;border-radius:var(--r);background:var(--surface)}
.promo h4{margin:4px 0 4px;font-size:19px;line-height:1.25;padding-right:56px}
.promo p{margin:0;color:var(--muted);font-size:14px}
.promo-d{font-size:12px!important;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--accent)!important}
.promo .price{display:inline-block;margin-top:10px}
.promo.today{background:var(--accent);color:var(--on-accent)}
.promo.today p,.promo.today .promo-d{color:inherit!important;opacity:.9}
.badge{position:absolute;top:14px;right:14px;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:4px 9px;border-radius:999px;background:var(--ink);color:var(--bg)}
.md-top{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:12px}
.md-when{margin:0;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}
.md-price{margin:0;font-family:var(--fd);font-size:30px;line-height:1}
.md-today{display:inline-block;margin-bottom:10px;font-size:12px;font-weight:800;padding:4px 10px;border-radius:999px;background:color-mix(in srgb,#2fbf71 22%,transparent)}
.md-list{margin:0 0 14px}
.md-row{display:grid;grid-template-columns:minmax(0,7.5em) minmax(0,1fr);gap:12px;padding:10px 0;border-top:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
.md-row dt{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);padding-top:3px}
.md-row dd{margin:0}
.md-note{font-size:14px;color:var(--muted);margin:0 0 14px}
.steps{margin:0 0 16px;padding-left:22px;display:grid;gap:6px}
.how .chips{margin:0 -3px 12px}
.form{display:grid;gap:16px}
.row2{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px}
.field{display:grid;gap:7px;min-width:0}
.lbl{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.inp{width:100%;min-height:48px;padding:11px 14px;border-radius:calc(var(--r) * .7);border:1.5px solid color-mix(in srgb,var(--ink) 20%,transparent);background:var(--bg);color:var(--ink);font-size:16px}
textarea.inp{resize:vertical;min-height:76px}
.stepper{display:inline-flex;align-items:center;gap:4px;border:1.5px solid color-mix(in srgb,var(--ink) 20%,transparent);border-radius:999px;padding:3px;width:max-content}
.stepper button{width:40px;height:40px;border-radius:50%;font-size:20px;font-weight:700;display:grid;place-items:center}
.stepper output{min-width:34px;text-align:center;font-weight:800;font-variant-numeric:tabular-nums}
.stepper.sm button{width:32px;height:32px;font-size:17px}
.form-err{margin:0;color:#d64545;font-weight:700;font-size:14px}
.seg{display:flex;border-radius:999px;padding:3px;background:color-mix(in srgb,var(--ink) 8%,transparent)}
.seg button{flex:1;min-height:42px;border-radius:999px;font-size:14px;font-weight:700;color:var(--muted);text-align:center;padding:0 8px}
.seg button.on{background:var(--surface);color:var(--ink);box-shadow:0 1px 4px rgba(0,0,0,.14)}
.sc-top{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap}
.sc-reward{margin:0;font-weight:800;font-size:17px;max-width:26ch;line-height:1.3}
.sc-count{margin:0;font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}
.stamps{display:grid;grid-template-columns:repeat(var(--cols,4),minmax(0,1fr));gap:10px;margin-top:16px}
.stamp{aspect-ratio:1;border-radius:50%;display:grid;place-items:center;font-size:26px;border:2px dashed color-mix(in srgb,var(--ink) 30%,transparent)}
.stamp em{font-style:normal;font-size:13px;font-weight:700;color:var(--muted)}
.stamp.on{border-style:solid;border-color:var(--accent2);background:color-mix(in srgb,var(--accent2) 22%,transparent)}
.stamp.just{animation:stampin .55s cubic-bezier(.2,1.6,.4,1)}
@keyframes stampin{from{transform:scale(1.8) rotate(-25deg);opacity:0}}
.sc-won{margin:16px 0 0;font-weight:800;color:var(--accent)}
.pin-dots{display:flex;gap:14px;justify-content:center;margin:10px 0}
.pin-dots i{width:16px;height:16px;border-radius:50%;border:2px solid var(--ink)}
.pin-dots i.f{background:var(--ink)}
.pin-dots.shake{animation:shake .4s}
@keyframes shake{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
.keypad{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;width:100%;max-width:300px;margin:0 auto}
.keypad button{min-height:58px;border-radius:14px;font-size:22px;font-weight:700;background:color-mix(in srgb,var(--ink) 7%,transparent);text-align:center}
.wheel-box{position:relative;width:min(300px,80vw);aspect-ratio:1;margin:12px auto 0;max-width:100%}
.wheel{position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 6px var(--surface),0 0 0 8px color-mix(in srgb,var(--ink) 22%,transparent)}
.wl{position:absolute;left:50%;top:50%;width:50%;height:22px;margin-top:-11px;transform-origin:0 50%;display:flex;align-items:center;justify-content:flex-end}
.wl span{display:block;padding:0 16px 0 46px;font-size:12px;font-weight:800;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pointer{position:absolute;left:50%;top:-16px;transform:translateX(-50%);width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;border-top:26px solid var(--ink);z-index:2}
.hub{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:58px;height:58px;border-radius:50%;background:var(--surface);display:grid;place-items:center;box-shadow:0 0 0 3px var(--ink);z-index:1}
.hub .logo{width:44px;height:44px}
.wheel-res{min-height:8px;margin-top:22px;text-align:center}
.wres{display:inline-grid;gap:6px;justify-items:center;padding:16px 22px;border-radius:var(--r);background:var(--surface);max-width:100%}
.wres b{font-family:var(--fd);font-weight:400;font-size:24px;line-height:1.15}
.trivia{display:grid;gap:12px}
.tq-n{margin:0;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.tq-q{margin:0;font-size:20px;line-height:1.3}
.tq-opts{display:grid;gap:8px}
.tq-o{text-align:left;padding:13px 16px;border-radius:calc(var(--r) * .8);border:1.5px solid color-mix(in srgb,var(--ink) 18%,transparent);font-weight:600;min-height:52px;width:100%}
.tq-o.ok{border-color:#2f9e5e;background:color-mix(in srgb,#2f9e5e 18%,transparent)}
.tq-o.bad{border-color:#d64545;background:color-mix(in srgb,#d64545 15%,transparent)}
.tq-o[disabled]{cursor:default}
.tq-fb{font-size:15px;padding:12px 14px;border-radius:calc(var(--r) * .8);background:color-mix(in srgb,var(--ink) 6%,transparent)}
.tq-end{display:grid;gap:12px;justify-items:start}
.tq-score{margin:0;font-family:var(--fd);font-size:30px;line-height:1.1}
.tq-prize{margin:0;font-weight:700;color:var(--accent)}
.hours{margin:0;display:grid}
.hrow{display:flex;align-items:baseline;gap:10px;padding:11px 0;border-bottom:1px solid color-mix(in srgb,var(--ink) 9%,transparent)}
.hrow dt{font-weight:600}
.hrow dd{margin:0;font-variant-numeric:tabular-nums;color:var(--muted);text-align:right}
.hrow .lead{transform:none}
.hrow.today dt,.hrow.today dd{color:var(--ink);font-weight:800}
.hrow .hoy{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-left:8px;padding:2px 7px;border-radius:999px;background:var(--accent);color:var(--on-accent)}
.mapcard{padding:0;overflow:hidden}
.map-art{height:150px;position:relative;background:linear-gradient(90deg,transparent 44%,color-mix(in srgb,var(--ink) 13%,transparent) 44% 56%,transparent 56%) 0 0/84px 84px,linear-gradient(0deg,transparent 44%,color-mix(in srgb,var(--ink) 13%,transparent) 44% 56%,transparent 56%) 0 0/84px 84px,color-mix(in srgb,var(--accent2) 14%,var(--surface))}
.pin{position:absolute;left:50%;top:50%;width:28px;height:28px;margin:-30px 0 0 -14px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:var(--accent);box-shadow:0 0 0 5px color-mix(in srgb,var(--accent) 22%,transparent)}
.pin::after{content:"";position:absolute;inset:9px;border-radius:50%;background:var(--surface)}
.map-b{padding:18px 20px 20px}
.addr{margin:0;font-weight:800;font-size:18px}
.city{margin:2px 0 8px;color:var(--muted)}
.story{display:grid;gap:14px;max-width:62ch;font-size:17px}
.story p{margin:0}
.sig{font-style:italic;color:var(--muted)}
.gloss{margin:0;display:grid}
.g{padding:14px 0;border-bottom:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
.g dt{font-family:var(--fd);font-size:21px;line-height:1.2;color:var(--accent)}
.g dd{margin:4px 0 0}
.events{display:grid;gap:12px}
.ev{display:grid;gap:6px;justify-items:start}
.ev h4{margin:0;font-size:19px;line-height:1.25}
.ev p{margin:0;color:var(--muted);font-size:15px}
.ev .btn{margin-top:6px}
.ev-w{font-size:12px!important;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--accent)!important}
.wifi{display:grid;gap:12px}
.wf-row{display:flex;justify-content:space-between;align-items:center;gap:10px;padding-bottom:12px;border-bottom:1px solid color-mix(in srgb,var(--ink) 10%,transparent)}
.wf-row code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:16px;font-weight:700;overflow-wrap:anywhere;text-align:right;min-width:0}
.sel{-webkit-user-select:all;user-select:all}
.contact{display:grid;gap:10px}
.cl{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:15px 18px;border-radius:var(--r);background:var(--surface);text-decoration:none;text-align:left;width:100%;min-height:58px}
.cl-k{font-weight:800;flex:none}
.cl-v{color:var(--muted);font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.free{padding:28px 22px;border-radius:var(--r);background:var(--surface)}
.free.hl{background:var(--accent);color:var(--on-accent)}
.free.hl .sh-k{color:inherit;opacity:.85}
.free p{margin:12px 0 0;max-width:60ch}
.free .sh-t{font-size:clamp(28px,7.5vw,36px)}
.free.hl .btn.pri{background:var(--on-accent);color:var(--accent);border-color:var(--on-accent)}
.quotes{display:grid;gap:12px;margin-bottom:6px}
.quote{margin:0;padding:18px;border-radius:var(--r);background:var(--surface)}
.quote blockquote{margin:0;font-size:16px}
.quote figcaption{margin-top:8px;font-size:13px;color:var(--muted);font-weight:700}
.rating{font-size:15px;margin:0 0 14px}
.rating b{font-size:22px;font-family:var(--fd)}
.foot{padding-block:60px 26px;text-align:center;color:var(--muted);font-size:14px}
.foot p{margin:4px 0}
.foot-n{font-family:var(--fd);font-size:24px;color:var(--ink)}
.credit{margin-top:20px!important;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.7}
.fab{position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:40;display:flex;align-items:center;gap:12px;min-height:58px;padding:9px 12px 9px 9px;border-radius:999px;background:var(--ink);color:var(--bg);font-weight:800;box-shadow:0 10px 30px rgba(0,0,0,.28);width:max-content;max-width:calc(100% - 32px);white-space:nowrap}
.fab-n{min-width:40px;height:40px;padding:0 6px;border-radius:999px;background:var(--accent);color:var(--on-accent);display:grid;place-items:center;font-variant-numeric:tabular-nums}
.fab-t{padding-right:6px;font-variant-numeric:tabular-nums;opacity:.85}
.fab.bump{animation:fabbump .45s ease}
@keyframes fabbump{35%{transform:translateX(-50%) scale(1.08)}}
.sheet-bg{position:fixed;inset:0;z-index:60;background:rgba(8,8,8,.5);opacity:0;pointer-events:none;transition:opacity .25s}
.sheet{position:fixed;left:0;right:0;bottom:0;z-index:61;max-width:600px;margin:0 auto;max-height:90vh;max-height:90dvh;overflow:auto;overscroll-behavior:contain;background:var(--surface);color:var(--ink);border-radius:22px 22px 0 0;padding:10px max(20px,env(safe-area-inset-right,0px)) calc(26px + env(safe-area-inset-bottom,0px)) max(20px,env(safe-area-inset-left,0px));transform:translateY(105%);transition:transform .32s cubic-bezier(.2,.8,.2,1),visibility .32s;visibility:hidden}
.app.sheet-open .sheet{transform:none;visibility:visible}
.app.sheet-open .sheet-bg{opacity:1;pointer-events:auto}
.sheet-c{display:grid;gap:16px}
.sheet-h{display:flex;justify-content:space-between;align-items:center;gap:12px;position:sticky;top:-10px;background:var(--surface);padding:10px 0 4px;z-index:2}
.sheet-h h3{margin:0;font-family:var(--fd);font-size:24px;font-weight:400;line-height:1.15}
.x{width:42px;height:42px;border-radius:50%;font-size:24px;line-height:1;background:color-mix(in srgb,var(--ink) 8%,transparent);flex:none;display:grid;place-items:center}
.isheet{display:grid;gap:10px}
.isheet .media{width:100%;aspect-ratio:16/9;font-size:86px}
.isheet h3{margin:6px 0 0;font-family:var(--fd);font-size:28px;font-weight:400;line-height:1.1}
.isheet p{margin:0;color:var(--muted)}
.isheet .it-tags{margin:0}
.price.big{font-size:22px}
.lines{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.lines li{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:10px;align-items:center}
.ln{min-width:0;display:grid}
.totals{display:grid;gap:6px;padding:14px 0;border-block:1px solid color-mix(in srgb,var(--ink) 12%,transparent)}
.totals div{display:flex;justify-content:space-between;gap:12px;font-variant-numeric:tabular-nums}
.totals .tt{font-weight:800;font-size:18px}
.wa-msg{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.5 ui-monospace,Menlo,Consolas,monospace;background:color-mix(in srgb,#25d366 13%,var(--surface));color:var(--ink);border-radius:14px;padding:14px;max-height:42vh;overflow:auto}
.note{margin:0;padding:12px 14px;border-radius:12px;background:color-mix(in srgb,var(--accent) 15%,transparent);font-size:14px}
.navlist{display:grid}
.navi{text-align:left;padding:15px 2px;font-size:20px;font-family:var(--fd);border-bottom:1px solid color-mix(in srgb,var(--ink) 10%,transparent);width:100%}
.toast{position:fixed;left:50%;bottom:calc(92px + env(safe-area-inset-bottom,0px));transform:translate(-50%,16px);z-index:70;padding:12px 18px;border-radius:999px;background:var(--ink);color:var(--bg);font-weight:700;font-size:14px;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;width:max-content;max-width:calc(100% - 40px);text-align:center}
.toast.show{opacity:1;transform:translate(-50%,0)}
.confetti{position:fixed;inset:0;pointer-events:none;z-index:80;overflow:hidden}
.confetti i{position:absolute;top:-14px;width:9px;height:14px;border-radius:2px;animation:fall 1.3s ease-in forwards}
@keyframes fall{to{transform:translate(var(--dx),105vh) rotate(var(--rot))}}
.facade{display:block;width:100%;height:auto;max-width:440px;margin:0 auto 20px}
.facade .f-wall{fill:var(--surface);stroke:color-mix(in srgb,var(--ink) 20%,transparent);stroke-width:1.5}
.facade .f-roof{fill:var(--accent)}
.facade .f-eave{fill:color-mix(in srgb,var(--ink) 65%,var(--accent))}
.facade .f-frame,.facade .f-bal,.facade .f-z1{fill:var(--accent2)}
.facade .f-shut,.facade .f-door{fill:var(--accent3)}
.facade .f-doorframe{fill:var(--accent2)}
.facade .f-glass{fill:color-mix(in srgb,var(--ink) 78%,var(--accent3))}
.facade .f-rail{stroke:var(--accent2);stroke-width:3;fill:none}
.facade .f-grille{stroke:color-mix(in srgb,var(--surface) 70%,transparent);stroke-width:2;fill:none}
.facade .f-z2{fill:var(--accent)}
.facade .f-z3{fill:var(--surface)}
.facade .f-ground{fill:color-mix(in srgb,var(--ink) 16%,transparent)}
.facade .f-flower{fill:var(--accent)}
.facade .f-flower2{fill:color-mix(in srgb,var(--accent2) 60%,var(--surface))}
html[data-tex="puntos"] body{background-image:radial-gradient(color-mix(in srgb,var(--ink) 11%,transparent) 1.2px,transparent 1.5px);background-size:18px 18px}
html[data-tex="rayas"] body{background-image:repeating-linear-gradient(135deg,color-mix(in srgb,var(--ink) 5%,transparent) 0 2px,transparent 2px 13px)}
html[data-tex="grano"] body{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .07 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
html[data-tex="papel"] body{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .4 0 0 0 0 .33 0 0 0 0 .25 0 0 0 .7 -.25'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E")}
html[data-tex="cuadros"] body{background-image:linear-gradient(90deg,color-mix(in srgb,var(--accent) 8%,transparent) 50%,transparent 50%),linear-gradient(color-mix(in srgb,var(--accent) 8%,transparent) 50%,transparent 50%);background-size:28px 28px}
html[data-tex="zocalo"] .m+.m{position:relative}
html[data-tex="zocalo"] .m+.m::before{content:"";position:absolute;left:20px;right:20px;top:0;height:10px;background:${ZZ};opacity:.9}
.intro[data-motion="suave"] .m{animation:rise .8s cubic-bezier(.2,.7,.2,1) both}
.intro[data-motion="vivo"] .m{animation:pop .6s cubic-bezier(.2,1.4,.4,1) both}
.intro .m:nth-child(2){animation-delay:.08s}.intro .m:nth-child(3){animation-delay:.16s}.intro .m:nth-child(4){animation-delay:.24s}
@keyframes rise{from{transform:translateY(16px);opacity:0}}
@keyframes pop{from{transform:translateY(22px) scale(.96);opacity:0}}
@keyframes wiggle{25%{transform:rotate(-10deg)}75%{transform:rotate(10deg)}}
@keyframes float{50%{translate:0 -10px}}
@keyframes marq{to{transform:translateX(-50%)}}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}
`;

  const CSS_SKIN = {
    elegante: `
[data-skin="elegante"]{font-weight:300;letter-spacing:.005em;--gw:.5}
[data-skin="elegante"] .top{border-bottom:1px solid color-mix(in srgb,var(--accent) 22%,transparent)}
[data-skin="elegante"] .brand-mini{font-size:21px;letter-spacing:.05em}
[data-skin="elegante"] .brand-mini .logo{display:none}
[data-skin="elegante"] .status,[data-skin="elegante"] .lang{background:transparent;border:1px solid color-mix(in srgb,var(--accent) 35%,transparent);font-weight:500}
[data-skin="elegante"] .lang button.on{background:var(--accent);color:var(--on-accent)}
[data-skin="elegante"] .m-hero{text-align:center;padding-block:64px 8px}
[data-skin="elegante"] .hero-mono{display:flex;justify-content:center;margin-bottom:28px}
[data-skin="elegante"] .hero-mono .logo{background:transparent;border:1px solid var(--accent);color:var(--accent);font-style:italic;font-size:34px}
[data-skin="elegante"] .hero-mono .logo.img{border:0}
[data-skin="elegante"] .hero-k{letter-spacing:.34em;font-weight:500;font-size:11px}
[data-skin="elegante"] .hero-t{font-size:min(calc(clamp(58px,18vw,96px) * var(--hs,1)),var(--fit,999px));letter-spacing:.01em;line-height:.95}
[data-skin="elegante"] .hero-s{margin-inline:auto;font-family:var(--fd);font-style:italic;font-size:21px;line-height:1.4;color:var(--muted)}
[data-skin="elegante"] .hero-st{justify-content:center;font-weight:400;letter-spacing:.04em}
[data-skin="elegante"] .orn{display:block;position:relative;width:132px;height:9px;margin:28px auto 0;background:linear-gradient(var(--accent),var(--accent)) left 50%/52px 1px no-repeat,linear-gradient(var(--accent),var(--accent)) right 50%/52px 1px no-repeat}
[data-skin="elegante"] .orn::after{content:"";position:absolute;left:50%;top:50%;width:7px;height:7px;border:1px solid var(--accent);transform:translate(-50%,-50%) rotate(45deg)}
[data-skin="elegante"] .btns{justify-content:center}
[data-skin="elegante"] .btn{font-weight:500;font-size:12px;letter-spacing:.22em;text-transform:uppercase;border-width:1px;min-height:52px;padding:12px 26px}
[data-skin="elegante"] .btn.ghost{color:var(--accent);border-color:color-mix(in srgb,var(--accent) 55%,transparent)}
[data-skin="elegante"] .btn.text{color:var(--muted)}
[data-skin="elegante"] .ribbon{text-align:center;white-space:normal;font-family:var(--fd);font-style:italic;font-size:16px}
[data-skin="elegante"] .ribbon-track{display:inline;}
[data-skin="elegante"] .ribbon-track span{padding:0 10px}
[data-skin="elegante"] .sh{text-align:center}
[data-skin="elegante"] .sh-k{font-weight:500;letter-spacing:.3em;font-size:11px}
[data-skin="elegante"] .sh-t{font-size:clamp(34px,9vw,46px)}
[data-skin="elegante"] .sh .orn{margin-top:18px}
[data-skin="elegante"] .lead-p{text-align:center;margin-inline:auto}
[data-skin="elegante"] .card{background:transparent;border:1px solid color-mix(in srgb,var(--accent) 26%,transparent)}
[data-skin="elegante"] .chip{border-width:1px;font-weight:400;letter-spacing:.08em;font-size:13px;border-color:color-mix(in srgb,var(--accent) 35%,transparent)}
[data-skin="elegante"] .chip.on{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}
[data-skin="elegante"] .cat-tabs{border-bottom:1px solid color-mix(in srgb,var(--accent) 16%,transparent)}
[data-skin="elegante"] .cat{padding-top:36px}
[data-skin="elegante"] .cat-h{text-align:center;margin-bottom:4px}
[data-skin="elegante"] .cat-h h3{justify-content:center;font-style:italic;font-size:30px}
[data-skin="elegante"] .cat-h p{font-size:11px;letter-spacing:.24em;text-transform:uppercase}
[data-skin="elegante"] .it h4{font-family:var(--fd);font-weight:500;font-size:20px;letter-spacing:.005em}
[data-skin="elegante"] .lay-lista .it{border-bottom:0;padding:15px 0}
[data-skin="elegante"] .lay-compacta .it{border-bottom:0}
[data-skin="elegante"] .it-d{font-weight:300}
[data-skin="elegante"] .lead{border-bottom-width:1px;border-bottom-color:color-mix(in srgb,var(--accent) 45%,transparent)}
[data-skin="elegante"] .price{font-weight:400;color:var(--accent);font-size:17px;letter-spacing:.06em}
[data-skin="elegante"] .tag{background:transparent;padding:0;color:var(--accent2);font-weight:500;letter-spacing:.2em;font-size:10px}
[data-skin="elegante"] .tag+.tag::before{content:"·";margin-right:6px;color:var(--muted)}
[data-skin="elegante"] .add{background:transparent;border:1px solid var(--accent);color:var(--accent);font-weight:300}
[data-skin="elegante"] .media{background:color-mix(in srgb,var(--accent) 9%,transparent);border-radius:var(--r)}
[data-skin="elegante"] .media.none span{font-style:italic;color:var(--accent)}
[data-skin="elegante"] .feat{background:transparent;border:1px solid color-mix(in srgb,var(--accent) 26%,transparent)}
[data-skin="elegante"] .feat .media{font-size:76px}
[data-skin="elegante"] .feat-b h4{font-family:var(--fd);font-weight:500;font-size:23px}
[data-skin="elegante"] .inp{background:transparent;border:0;border-bottom:1px solid color-mix(in srgb,var(--accent) 45%,transparent);border-radius:0;padding-inline:0}
[data-skin="elegante"] .stepper{border-width:1px;border-color:color-mix(in srgb,var(--accent) 45%,transparent)}
[data-skin="elegante"] .lbl{font-weight:500;letter-spacing:.22em;font-size:10.5px}
[data-skin="elegante"] .hrow{border-bottom:0;padding:9px 0}
[data-skin="elegante"] .hrow dt{font-weight:400}
[data-skin="elegante"] .hrow.today dt,[data-skin="elegante"] .hrow.today dd{color:var(--accent);font-weight:500}
[data-skin="elegante"] .hrow .lead{border-bottom-color:color-mix(in srgb,var(--accent) 30%,transparent)}
[data-skin="elegante"] .hstat{display:flex;justify-content:center}
[data-skin="elegante"] .story{margin-inline:auto;text-align:center;font-family:var(--fd);font-size:20px;line-height:1.6}
[data-skin="elegante"] .free{text-align:center;background:transparent;border:1px solid color-mix(in srgb,var(--accent) 30%,transparent)}
[data-skin="elegante"] .free.hl{color:var(--ink);border-color:var(--accent);background:color-mix(in srgb,var(--accent) 7%,transparent)}
[data-skin="elegante"] .free.hl .sh-k{color:var(--accent);opacity:1}
[data-skin="elegante"] .free p{margin-inline:auto}
[data-skin="elegante"] .free .btns{justify-content:center}
[data-skin="elegante"] .free.hl .btn.pri{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}
[data-skin="elegante"] .promo,[data-skin="elegante"] .quote{background:transparent;border:1px solid color-mix(in srgb,var(--accent) 26%,transparent)}
[data-skin="elegante"] .cl{background:transparent;border-bottom:1px solid color-mix(in srgb,var(--accent) 22%,transparent);border-radius:0;padding-inline:2px}
[data-skin="elegante"] .cl-k{font-weight:500;letter-spacing:.06em}
[data-skin="elegante"] .map-art{background:linear-gradient(90deg,transparent 49.5%,color-mix(in srgb,var(--accent) 30%,transparent) 49.5% 50.5%,transparent 50.5%) 0 0/70px 70px,linear-gradient(0deg,transparent 49.5%,color-mix(in srgb,var(--accent) 30%,transparent) 49.5% 50.5%,transparent 50.5%) 0 0/70px 70px,var(--surface)}
[data-skin="elegante"] .pin{background:var(--accent)}
[data-skin="elegante"] .fab{background:var(--accent);color:var(--on-accent)}
[data-skin="elegante"] .fab-n{background:var(--bg);color:var(--accent)}
[data-skin="elegante"] .sheet{border-top:1px solid color-mix(in srgb,var(--accent) 35%,transparent)}
[data-skin="elegante"] .foot-n{letter-spacing:.08em}
[data-skin="elegante"] .navi{font-style:italic}
`,
    animado: `
[data-skin="animado"]{font-weight:600;--gw:.52}
[data-skin="animado"] .top{background:var(--bg);border-bottom:2.5px solid var(--ink)}
[data-skin="animado"] .brand-mini{font-size:23px}
[data-skin="animado"] .logo.sm{border:2px solid var(--ink)}
[data-skin="animado"] .status,[data-skin="animado"] .lang{border:2px solid var(--ink);background:var(--surface)}
[data-skin="animado"] .menu-btn{border:2px solid var(--ink);background:var(--surface);width:40px;height:40px}
[data-skin="animado"] .m-hero{padding-block:24px 0;overflow:hidden}
[data-skin="animado"] .hero-in{padding-top:30px}
[data-skin="animado"] .hero-k{display:inline-block;background:var(--ink);color:var(--bg);padding:6px 13px;border-radius:999px;transform:rotate(-2.5deg);letter-spacing:.12em;font-weight:800}
[data-skin="animado"] .hero-t{font-size:min(calc(clamp(66px,21vw,108px) * var(--hs,1)),var(--fit,999px));line-height:.9;color:var(--ink);text-shadow:4px 4px 0 var(--accent);letter-spacing:.01em;position:relative;z-index:2}
[data-skin="animado"] .hero-s{color:var(--ink);font-weight:700;font-size:19px;position:relative;z-index:2}
[data-skin="animado"] .stk{position:absolute;font-size:46px;line-height:1;pointer-events:none;z-index:1;filter:drop-shadow(3px 3px 0 var(--ink))}
[data-skin="animado"] .stk.s1{right:4%;top:6px;rotate:14deg}
[data-skin="animado"] .stk.s2{right:20%;top:-14px;font-size:34px;rotate:-12deg}
[data-skin="animado"] .stk.s3{right:2%;top:86px;font-size:38px;rotate:-8deg}
[data-skin="animado"] .stk.s4{right:26%;top:62px;font-size:30px;rotate:18deg}
[data-skin="animado"][data-motion="vivo"] .stk{animation:float 3.2s ease-in-out infinite}
[data-skin="animado"][data-motion="vivo"] .stk.s2{animation-delay:-1.1s}
[data-skin="animado"][data-motion="vivo"] .stk.s3{animation-delay:-2s}
[data-skin="animado"][data-motion="vivo"] .stk.s4{animation-delay:-.6s}
[data-skin="animado"] .btn{border:2.5px solid var(--ink);border-radius:999px;box-shadow:4px 4px 0 var(--ink);font-weight:800;font-size:16px}
[data-skin="animado"] .btn:active{transform:translate(3px,3px);box-shadow:1px 1px 0 var(--ink)}
[data-skin="animado"] .btn.pri{color:var(--on-accent)}
[data-skin="animado"] .btn.ghost{background:var(--surface)}
[data-skin="animado"] .btn.text{box-shadow:none;border-color:transparent}
[data-skin="animado"] .ribbon{margin:36px -20px 0;background:var(--ink);color:var(--bg);rotate:-2deg;padding:12px 0;font-family:var(--fd);font-size:22px}
[data-skin="animado"] .ribbon-track span::after{content:"✸";margin-left:26px;color:var(--accent)}
[data-skin="animado"][data-motion="vivo"] .ribbon-track,[data-skin="animado"][data-motion="suave"] .ribbon-track{animation:marq 22s linear infinite}
[data-skin="animado"] .sh-k{display:inline-block;background:var(--accent2);color:var(--on-accent2);border:2px solid var(--ink);padding:4px 12px;border-radius:999px;letter-spacing:.1em;rotate:-1.5deg;font-weight:800}
[data-skin="animado"] .sh-t{font-size:clamp(38px,10.5vw,48px);line-height:1}
[data-skin="animado"] .card,[data-skin="animado"] .lay-tarjetas .it,[data-skin="animado"] .lay-cuadricula .it,[data-skin="animado"] .lay-fotos .it,[data-skin="animado"] .feat,[data-skin="animado"] .promo,[data-skin="animado"] .cl,[data-skin="animado"] .quote,[data-skin="animado"] .free,[data-skin="animado"] .wres{border:2.5px solid var(--ink);box-shadow:4px 4px 0 var(--ink)}
[data-skin="animado"] .chip{border:2px solid var(--ink);background:var(--surface);font-weight:800}
[data-skin="animado"] .chip.on{background:var(--ink);color:var(--bg)}
[data-skin="animado"] .cat-tabs{background:var(--bg);border-bottom:2.5px solid var(--ink)}
[data-skin="animado"] .cat-h h3{font-size:31px}
[data-skin="animado"] .it h4{font-weight:800}
[data-skin="animado"] .media{border:2px solid var(--ink);background:var(--accent)}
[data-skin="animado"] .media.m1{background:var(--accent2)}
[data-skin="animado"] .media.m2{background:var(--accent3)}
[data-skin="animado"] .media span{filter:drop-shadow(2px 3px 0 rgba(0,0,0,.22))}
[data-skin="animado"][data-motion="vivo"] .lay-cuadricula .it:hover .media span,[data-skin="animado"][data-motion="vivo"] .feat:hover .media span{animation:wiggle .5s}
[data-skin="animado"] .price{background:var(--ink);color:var(--bg);padding:3px 10px;border-radius:999px;font-weight:800;font-size:14px}
[data-skin="animado"] .tag{border:1.5px solid var(--ink);background:var(--surface);letter-spacing:.04em}
[data-skin="animado"] .tag.t-picante{background:var(--accent);color:var(--on-accent)}
[data-skin="animado"] .tag.t-nuevo{background:var(--accent3);color:var(--on-accent3)}
[data-skin="animado"] .tag.t-temporada{background:var(--accent3);color:var(--on-accent3)}
[data-skin="animado"] .tag.t-vegano,[data-skin="animado"] .tag.t-vegetariano{background:var(--accent2);color:var(--on-accent2)}
[data-skin="animado"] .add{border:2.5px solid var(--ink);box-shadow:2px 2px 0 var(--ink)}
[data-skin="animado"][data-motion="vivo"] .add:active{transform:scale(.85)}
[data-skin="animado"] .md-price{background:none;color:var(--ink);padding:0;font-size:34px;text-shadow:3px 3px 0 var(--accent)}
[data-skin="animado"] .promo.today{rotate:-1deg}
[data-skin="animado"] .promo.today .price{background:var(--surface);color:var(--ink)}
[data-skin="animado"] .badge{rotate:8deg;font-size:13px;border:2px solid var(--ink);background:var(--accent3);color:var(--on-accent3)}
[data-skin="animado"] .stamp{border:2.5px dashed var(--ink)}
[data-skin="animado"] .stamp.on{border-style:solid;background:var(--accent3)}
[data-skin="animado"] .wheel{box-shadow:0 0 0 5px var(--ink),6px 8px 0 5px var(--ink)}
[data-skin="animado"] .wl span{color:var(--ink)}
[data-skin="animado"] .fab{background:var(--accent);color:var(--on-accent);border:2.5px solid var(--ink);box-shadow:4px 4px 0 var(--ink)}
[data-skin="animado"] .fab-n{background:var(--ink);color:var(--bg)}
[data-skin="animado"] .sheet{border:2.5px solid var(--ink);border-bottom:0}
[data-skin="animado"] .inp,[data-skin="animado"] .stepper,[data-skin="animado"] .seg,[data-skin="animado"] .search input{border:2px solid var(--ink);background:var(--surface)}
[data-skin="animado"] .seg button.on{background:var(--ink);color:var(--bg);box-shadow:none}
[data-skin="animado"] .tq-o{border:2px solid var(--ink);background:var(--surface)}
[data-skin="animado"] .hrow{border-bottom:2px dashed color-mix(in srgb,var(--ink) 25%,transparent)}
[data-skin="animado"] .map-art{border-bottom:2.5px solid var(--ink)}
[data-skin="animado"] .pin{border:2.5px solid var(--ink)}
[data-skin="animado"] .wa-msg{border:2px solid var(--ink)}
[data-skin="animado"] .keypad button{border:2px solid var(--ink);background:var(--surface)}
[data-skin="animado"] .foot-n{font-size:32px}
[data-skin="animado"] .x{border:2px solid var(--ink);background:var(--surface)}
`,
    cultural: `
[data-skin="cultural"]{font-size:17px;--gw:.62}
[data-skin="cultural"] .top{background:var(--bg)}
[data-skin="cultural"] .top::after{content:"";position:absolute;left:0;right:0;bottom:0;height:6px;background:repeating-linear-gradient(90deg,var(--accent) 0 16px,var(--accent2) 16px 32px,var(--accent3) 32px 48px)}
[data-skin="cultural"] .brand-mini{color:var(--accent);font-size:19px}
[data-skin="cultural"] .lang button.on{background:var(--accent);color:var(--on-accent)}
[data-skin="cultural"] .m-hero{padding-block:24px 0}
[data-skin="cultural"] .hero-k{color:var(--accent2);letter-spacing:.16em;font-weight:800}
[data-skin="cultural"] .hero-t{color:var(--accent);font-size:min(calc(clamp(46px,13.5vw,76px) * var(--hs,1)),var(--fit,999px));line-height:1;letter-spacing:.005em}
[data-skin="cultural"] .hero-s{font-style:italic;color:var(--ink);font-size:20px}
[data-skin="cultural"] .btn{border-width:2px;text-transform:uppercase;letter-spacing:.06em;font-size:14px;font-weight:800}
[data-skin="cultural"] .btn.pri{background:var(--accent2);border-color:var(--accent2);color:var(--on-accent2)}
[data-skin="cultural"] .btn.ghost{border-color:var(--accent3);color:var(--accent3)}
[data-skin="cultural"] .ribbon{font-weight:800;color:var(--accent3);letter-spacing:.08em;text-transform:uppercase;font-size:12px;white-space:normal;margin-top:26px}
[data-skin="cultural"] .ribbon-track{display:flex;flex-wrap:wrap;gap:6px 0}
[data-skin="cultural"] .ribbon-track span{padding:0 12px 0 0}
[data-skin="cultural"] .ribbon-track span+span::before{content:"✦";color:var(--accent);margin-right:12px}
[data-skin="cultural"] .zocalo{margin-top:30px}
[data-skin="cultural"] .sh-k{color:var(--accent3);font-weight:800}
[data-skin="cultural"] .sh-t{font-size:clamp(32px,9vw,42px)}
[data-skin="cultural"] .sh .orn{display:block;width:86px;height:10px;margin-top:14px;background:${ZZ}}
[data-skin="cultural"] .cat{padding-top:30px}
[data-skin="cultural"] .cat-h{position:relative;background:var(--accent2);color:var(--on-accent2);padding:12px 16px 13px;border-radius:var(--r) var(--r) 0 0;margin-bottom:0}
[data-skin="cultural"] .cat-h::after{content:"";position:absolute;left:0;right:0;bottom:-10px;height:10px;background:${ZZ}}
[data-skin="cultural"] .cat-h h3{font-size:23px}
[data-skin="cultural"] .cat-h p{color:inherit;opacity:.88}
[data-skin="cultural"] .cat .items{padding-top:22px}
[data-skin="cultural"] .lay-tarjetas .it,[data-skin="cultural"] .lay-cuadricula .it,[data-skin="cultural"] .lay-fotos .it,[data-skin="cultural"] .card,[data-skin="cultural"] .promo,[data-skin="cultural"] .cl,[data-skin="cultural"] .feat,[data-skin="cultural"] .quote{border:1.5px solid color-mix(in srgb,var(--ink) 15%,transparent)}
[data-skin="cultural"] .media{background:var(--bg);border:3px solid var(--accent3);border-radius:4px;box-shadow:inset 0 0 0 3px var(--surface)}
[data-skin="cultural"] .media.m1{border-color:var(--accent);background:var(--bg)}
[data-skin="cultural"] .media.m2{border-color:var(--accent2);background:var(--bg)}
[data-skin="cultural"] .it h4{font-size:18px;font-weight:800}
[data-skin="cultural"] .price{background:var(--accent);color:var(--on-accent);padding:4px 10px 3px;border-radius:4px;font-family:var(--fd);font-weight:400;font-size:15px;letter-spacing:.02em}
[data-skin="cultural"] .tag{background:transparent;border:1.5px solid var(--accent2);color:var(--accent2);text-transform:none;letter-spacing:0;font-size:12.5px;font-weight:700}
[data-skin="cultural"] .tag.t-local{border-color:var(--accent);color:var(--accent)}
[data-skin="cultural"] .tag.sold{border-color:var(--muted);color:var(--muted)}
[data-skin="cultural"] .chip{border-color:var(--accent3);color:var(--accent3);font-weight:700}
[data-skin="cultural"] .chip.on{background:var(--accent3);color:var(--on-accent3);border-color:var(--accent3)}
[data-skin="cultural"] .md{border-top:8px solid var(--accent)}
[data-skin="cultural"] .md-price{background:none;color:var(--accent);padding:0;font-size:30px}
[data-skin="cultural"] .g dt{font-size:22px}
[data-skin="cultural"] .g{border-bottom:2px dotted color-mix(in srgb,var(--accent3) 40%,transparent)}
[data-skin="cultural"] .story{font-size:18px}
[data-skin="cultural"] .story p:first-child::first-letter{font-family:var(--fd);float:left;font-size:3.3em;line-height:.85;padding:6px 10px 0 0;color:var(--accent)}
[data-skin="cultural"] .sig{color:var(--accent2);font-weight:700}
[data-skin="cultural"] .ev-w{color:var(--accent3)!important}
[data-skin="cultural"] .promo.today{background:var(--accent2);color:var(--on-accent2)}
[data-skin="cultural"] .promo-d{color:var(--accent3)!important}
[data-skin="cultural"] .stamp.on{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 14%,transparent)}
[data-skin="cultural"] .tq-o{background:var(--surface)}
[data-skin="cultural"] .hrow.today dt,[data-skin="cultural"] .hrow.today dd{color:var(--accent)}
[data-skin="cultural"] .fab{background:var(--accent);color:var(--on-accent)}
[data-skin="cultural"] .fab-n{background:var(--surface);color:var(--accent)}
[data-skin="cultural"] .foot{position:relative;margin-top:64px;background:var(--accent2);color:var(--on-accent2);padding-block:46px 30px}
[data-skin="cultural"] .foot::before{content:"";position:absolute;left:0;right:0;top:-14px;height:14px;background:${ZZ}}
[data-skin="cultural"] .foot-n,[data-skin="cultural"] .foot p{color:inherit}
[data-skin="cultural"] .navi{color:var(--accent)}
`,
    natural: `
[data-skin="natural"]{--gw:.58}
[data-skin="natural"] .top{background:color-mix(in srgb,var(--bg) 90%,transparent);border-bottom:1.5px dashed color-mix(in srgb,var(--ink) 22%,transparent)}
[data-skin="natural"] .brand-mini{font-size:20px}
[data-skin="natural"] .status,[data-skin="natural"] .lang,[data-skin="natural"] .menu-btn{background:var(--surface);box-shadow:0 1px 0 color-mix(in srgb,var(--ink) 12%,transparent)}
[data-skin="natural"] .menu-btn{width:40px;height:40px}
[data-skin="natural"] .lang button.on{background:var(--accent);color:var(--on-accent)}
[data-skin="natural"] .m-hero{padding-block:40px 0}
[data-skin="natural"] .hero-k{display:flex;align-items:center;gap:10px;color:var(--accent);letter-spacing:.14em;font-weight:800}
[data-skin="natural"] .hero-k::before{content:"";flex:none;width:24px;height:14px;background:color-mix(in srgb,var(--accent) 75%,var(--bg));-webkit-mask:${LEAF} center/contain no-repeat;mask:${LEAF} center/contain no-repeat}
[data-skin="natural"] .hero-t{font-size:min(calc(clamp(50px,15vw,86px) * var(--hs,1)),var(--fit,999px));line-height:.95;letter-spacing:-.02em}
[data-skin="natural"] .hero-s{color:color-mix(in srgb,var(--ink) 78%,var(--bg));font-size:19px}
[data-skin="natural"] .btn{border-radius:999px;border-width:2px}
[data-skin="natural"] .btn.pri{box-shadow:0 3px 0 color-mix(in srgb,var(--accent) 55%,var(--ink))}
[data-skin="natural"] .btn.pri:active{box-shadow:0 1px 0 color-mix(in srgb,var(--accent) 55%,var(--ink))}
[data-skin="natural"] .btn.ghost{background:var(--surface);border-color:color-mix(in srgb,var(--ink) 16%,transparent)}
[data-skin="natural"] .btn.text{box-shadow:none}
[data-skin="natural"] .ribbon{margin-top:30px;white-space:normal;font-family:var(--fd);font-size:17px;color:var(--accent2)}
[data-skin="natural"] .ribbon-track{display:flex;flex-wrap:wrap;gap:4px 0}
[data-skin="natural"] .ribbon-track span{padding:0 10px 0 0}
[data-skin="natural"] .ribbon-track span:not(:last-child)::after{content:"";display:inline-block;width:14px;height:9px;margin-left:10px;background:var(--accent);-webkit-mask:${LEAF} center/contain no-repeat;mask:${LEAF} center/contain no-repeat}
[data-skin="natural"] .hills{display:block;width:100%;height:72px;margin-top:30px}
[data-skin="natural"] .hills .hl1{fill:color-mix(in srgb,var(--accent3) 50%,var(--bg))}
[data-skin="natural"] .hills .hl2{fill:color-mix(in srgb,var(--accent) 62%,var(--bg))}
[data-skin="natural"] .hills .hl3{fill:var(--accent)}
[data-skin="natural"] .hills .hrw{fill:none;stroke:color-mix(in srgb,var(--accent) 55%,var(--ink));stroke-width:3.2;stroke-linecap:round;stroke-dasharray:.1 7;vector-effect:non-scaling-stroke}
[data-skin="natural"] .sh-k{color:var(--accent);letter-spacing:.14em;font-weight:800}
[data-skin="natural"] .sh-t{font-size:clamp(32px,8.8vw,44px);letter-spacing:-.01em}
[data-skin="natural"] .sh .orn{display:block;width:84px;height:11px;margin-top:12px;background:var(--accent3);-webkit-mask:${SQUIG} 0 50%/42px 11px repeat-x;mask:${SQUIG} 0 50%/42px 11px repeat-x}
[data-skin="natural"] .card,[data-skin="natural"] .lay-tarjetas .it,[data-skin="natural"] .lay-cuadricula .it,[data-skin="natural"] .lay-fotos .it,[data-skin="natural"] .feat,[data-skin="natural"] .promo,[data-skin="natural"] .cl,[data-skin="natural"] .quote,[data-skin="natural"] .free,[data-skin="natural"] .wres{box-shadow:0 1px 0 color-mix(in srgb,var(--ink) 9%,transparent),0 16px 26px -24px color-mix(in srgb,var(--ink) 70%,transparent)}
[data-skin="natural"] .chip{border-color:color-mix(in srgb,var(--ink) 15%,transparent);background:color-mix(in srgb,var(--surface) 75%,transparent)}
[data-skin="natural"] .chip.on{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}
[data-skin="natural"] .cat-tabs{border-bottom:1.5px dashed color-mix(in srgb,var(--ink) 18%,transparent)}
[data-skin="natural"] .cat-h h3{font-size:27px}
[data-skin="natural"] .cat-h h3::after{content:"";flex:1;min-width:24px;height:10px;background:color-mix(in srgb,var(--accent3) 75%,transparent);-webkit-mask:${SQUIG} 0 50%/36px 10px repeat-x;mask:${SQUIG} 0 50%/36px 10px repeat-x}
[data-skin="natural"] .lay-lista .it,[data-skin="natural"] .lay-compacta .it{border-bottom:1.5px dashed color-mix(in srgb,var(--ink) 14%,transparent)}
[data-skin="natural"] .price{font-family:var(--fd);font-weight:400;font-size:17px;color:var(--accent2)}
[data-skin="natural"] .tag{background:color-mix(in srgb,var(--accent) 13%,transparent);text-transform:none;letter-spacing:0;font-size:12.5px}
[data-skin="natural"] .tag.t-local,[data-skin="natural"] .tag.t-chef{background:color-mix(in srgb,var(--accent3) 30%,transparent)}
[data-skin="natural"] .add{box-shadow:0 2px 0 color-mix(in srgb,var(--accent) 55%,var(--ink))}
[data-skin="natural"] .media{background:color-mix(in srgb,var(--accent3) 26%,var(--surface))}
[data-skin="natural"] .media.m1{background:color-mix(in srgb,var(--accent) 18%,var(--surface))}
[data-skin="natural"] .media.m2{background:color-mix(in srgb,var(--accent2) 15%,var(--surface))}
[data-skin="natural"] .promo-d,[data-skin="natural"] .ev-w{color:var(--accent2)!important}
[data-skin="natural"] .badge{background:var(--accent3);color:var(--on-accent3);rotate:5deg}
[data-skin="natural"] .md-price{font-size:32px}
[data-skin="natural"] .stamp{border-color:color-mix(in srgb,var(--accent) 40%,transparent)}
[data-skin="natural"] .stamp.on{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 15%,transparent)}
[data-skin="natural"] .hrow,[data-skin="natural"] .g{border-bottom:1.5px dashed color-mix(in srgb,var(--ink) 13%,transparent)}
[data-skin="natural"] .hrow.today dt,[data-skin="natural"] .hrow.today dd{color:var(--accent)}
[data-skin="natural"] .g dt{color:var(--accent2)}
[data-skin="natural"] .sig{font-family:var(--fd);font-style:normal;color:var(--accent)}
[data-skin="natural"] .map-art{background:repeating-radial-gradient(circle at 32% 58%,transparent 0 13px,color-mix(in srgb,var(--accent) 26%,transparent) 13px 14.5px),color-mix(in srgb,var(--accent) 9%,var(--surface))}
[data-skin="natural"] .pin{background:var(--accent2)}
[data-skin="natural"] .wheel{box-shadow:0 0 0 6px var(--surface),0 0 0 8px color-mix(in srgb,var(--accent) 45%,transparent)}
[data-skin="natural"] .fab{background:var(--accent);color:var(--on-accent);box-shadow:0 12px 26px -8px color-mix(in srgb,var(--ink) 60%,transparent)}
[data-skin="natural"] .fab-n{background:var(--surface);color:var(--accent)}
[data-skin="natural"] .foot::before{content:"";display:block;width:120px;height:12px;margin:0 auto 20px;background:var(--accent3);-webkit-mask:${SQUIG} 0 50%/40px 12px repeat-x;mask:${SQUIG} 0 50%/40px 12px repeat-x}
`,
    nocturna: `
[data-skin="nocturna"]{font-weight:500;--gw:.52}
[data-skin="nocturna"] .top{background:color-mix(in srgb,var(--bg) 84%,transparent);border-bottom:1px solid color-mix(in srgb,var(--accent) 38%,transparent);box-shadow:0 8px 22px -14px color-mix(in srgb,var(--accent) 70%,transparent)}
[data-skin="nocturna"] .brand-mini{font-size:21px;letter-spacing:.03em;text-shadow:0 0 12px color-mix(in srgb,var(--accent) 65%,transparent)}
[data-skin="nocturna"] .logo.mono{box-shadow:0 0 14px color-mix(in srgb,var(--accent) 60%,transparent)}
[data-skin="nocturna"] .status,[data-skin="nocturna"] .lang{background:transparent;border:1px solid color-mix(in srgb,var(--accent2) 45%,transparent)}
[data-skin="nocturna"] .status.on i{box-shadow:0 0 10px 2px color-mix(in srgb,#2fbf71 80%,transparent)}
[data-skin="nocturna"] .lang button.on{background:var(--accent2);color:var(--on-accent2)}
[data-skin="nocturna"] .m-hero{padding-block:34px 0;overflow:hidden}
[data-skin="nocturna"] .neon{display:inline-block;margin:6px 0 26px;padding:11px 20px 10px;border:2.5px solid var(--accent2);border-radius:16px;font-family:var(--fd);font-size:28px;line-height:1;letter-spacing:.1em;text-transform:uppercase;color:color-mix(in srgb,var(--accent2) 30%,var(--ink));text-shadow:0 0 4px var(--accent2),0 0 16px var(--accent2),0 0 34px color-mix(in srgb,var(--accent2) 70%,transparent);box-shadow:0 0 6px var(--accent2),0 0 24px color-mix(in srgb,var(--accent2) 55%,transparent),inset 0 0 14px color-mix(in srgb,var(--accent2) 40%,transparent);rotate:-3deg}
[data-skin="nocturna"] .neon.off{border-color:color-mix(in srgb,var(--ink) 24%,transparent);color:color-mix(in srgb,var(--ink) 34%,transparent);text-shadow:none;box-shadow:none}
[data-skin="nocturna"][data-motion="vivo"] .neon.on{animation:flick 6s linear infinite}
@keyframes flick{0%,6%,8.5%,62%,64%,100%{opacity:1}7%,63%{opacity:.5}}
[data-skin="nocturna"] .hero-k{color:var(--accent2);letter-spacing:.26em;font-weight:600}
[data-skin="nocturna"] .hero-t{font-size:min(calc(clamp(58px,17vw,100px) * var(--hs,1)),var(--fit,999px));line-height:.92;letter-spacing:.01em;color:color-mix(in srgb,var(--accent) 22%,var(--ink));text-shadow:0 0 6px color-mix(in srgb,var(--accent) 85%,transparent),0 0 26px color-mix(in srgb,var(--accent) 60%,transparent),0 0 60px color-mix(in srgb,var(--accent) 40%,transparent)}
[data-skin="nocturna"] .hero-s{font-size:18px}
[data-skin="nocturna"] .btn{border-width:1.5px;letter-spacing:.02em}
[data-skin="nocturna"] .btn.pri{box-shadow:0 0 22px -4px color-mix(in srgb,var(--accent) 85%,transparent)}
[data-skin="nocturna"] .btn.ghost{color:var(--accent2);border-color:var(--accent2);box-shadow:0 0 16px -6px color-mix(in srgb,var(--accent2) 80%,transparent),inset 0 0 12px -6px color-mix(in srgb,var(--accent2) 70%,transparent)}
[data-skin="nocturna"] .btn.text{box-shadow:none}
[data-skin="nocturna"] .ribbon{margin:34px -20px 0;padding:12px 0;border-block:1px solid color-mix(in srgb,var(--accent3) 40%,transparent);background:color-mix(in srgb,var(--accent3) 8%,transparent);color:var(--accent3);font-family:var(--fd);font-size:20px;letter-spacing:.05em;text-shadow:0 0 12px color-mix(in srgb,var(--accent3) 70%,transparent)}
[data-skin="nocturna"] .ribbon-track span::after{content:"✦";margin-left:26px;color:var(--accent)}
[data-skin="nocturna"][data-motion="vivo"] .ribbon-track,[data-skin="nocturna"][data-motion="suave"] .ribbon-track{animation:marq 26s linear infinite}
[data-skin="nocturna"] .sh-k{color:var(--accent2);letter-spacing:.24em;font-weight:600}
[data-skin="nocturna"] .sh-t{font-size:clamp(36px,10vw,50px);line-height:1;color:color-mix(in srgb,var(--accent) 12%,var(--ink));text-shadow:0 0 20px color-mix(in srgb,var(--accent) 50%,transparent)}
[data-skin="nocturna"] .card,[data-skin="nocturna"] .lay-tarjetas .it,[data-skin="nocturna"] .lay-cuadricula .it,[data-skin="nocturna"] .lay-fotos .it,[data-skin="nocturna"] .feat,[data-skin="nocturna"] .promo,[data-skin="nocturna"] .cl,[data-skin="nocturna"] .quote,[data-skin="nocturna"] .free,[data-skin="nocturna"] .wres{border:1px solid color-mix(in srgb,var(--accent) 22%,transparent)}
[data-skin="nocturna"] .chip{border-color:color-mix(in srgb,var(--accent2) 40%,transparent)}
[data-skin="nocturna"] .chip.on{background:var(--accent2);border-color:var(--accent2);color:var(--on-accent2);box-shadow:0 0 16px -4px color-mix(in srgb,var(--accent2) 85%,transparent)}
[data-skin="nocturna"] .cat-tabs{border-bottom:1px solid color-mix(in srgb,var(--accent2) 22%,transparent)}
[data-skin="nocturna"] .cat-h h3{font-size:30px;letter-spacing:.03em;color:var(--accent3);text-shadow:0 0 16px color-mix(in srgb,var(--accent3) 55%,transparent)}
[data-skin="nocturna"] .lay-lista .it,[data-skin="nocturna"] .lay-compacta .it{border-bottom-color:color-mix(in srgb,var(--accent2) 16%,transparent)}
[data-skin="nocturna"] .lead{border-bottom-color:color-mix(in srgb,var(--accent2) 35%,transparent)}
[data-skin="nocturna"] .price{color:var(--accent3);text-shadow:0 0 12px color-mix(in srgb,var(--accent3) 45%,transparent)}
[data-skin="nocturna"] .tag{background:transparent;border:1px solid color-mix(in srgb,var(--accent2) 55%,transparent);color:var(--accent2)}
[data-skin="nocturna"] .tag.t-picante,[data-skin="nocturna"] .tag.t-nuevo{border-color:var(--accent);color:var(--accent)}
[data-skin="nocturna"] .tag.sold{border-color:color-mix(in srgb,var(--ink) 28%,transparent);color:var(--muted)}
[data-skin="nocturna"] .add{box-shadow:0 0 16px -3px color-mix(in srgb,var(--accent) 85%,transparent)}
[data-skin="nocturna"] .media{background:radial-gradient(circle at 50% 42%,color-mix(in srgb,var(--accent) 30%,transparent),transparent 68%),color-mix(in srgb,var(--surface) 60%,var(--bg))}
[data-skin="nocturna"] .media.m1{background:radial-gradient(circle at 50% 42%,color-mix(in srgb,var(--accent2) 28%,transparent),transparent 68%),color-mix(in srgb,var(--surface) 60%,var(--bg))}
[data-skin="nocturna"] .media.m2{background:radial-gradient(circle at 50% 42%,color-mix(in srgb,var(--accent3) 28%,transparent),transparent 68%),color-mix(in srgb,var(--surface) 60%,var(--bg))}
[data-skin="nocturna"] .media span{filter:drop-shadow(0 0 12px color-mix(in srgb,var(--accent) 55%,transparent))}
[data-skin="nocturna"] .promo.today{background:color-mix(in srgb,var(--accent) 13%,var(--surface));color:var(--ink);border-color:var(--accent);box-shadow:0 0 26px -8px color-mix(in srgb,var(--accent) 80%,transparent)}
[data-skin="nocturna"] .badge{background:var(--accent);color:var(--on-accent);box-shadow:0 0 14px color-mix(in srgb,var(--accent) 80%,transparent)}
[data-skin="nocturna"] .promo-d,[data-skin="nocturna"] .promo.today .promo-d{color:var(--accent2)!important;opacity:1}
[data-skin="nocturna"] .md-price{font-size:34px}
[data-skin="nocturna"] .stamp{border-color:color-mix(in srgb,var(--accent2) 40%,transparent)}
[data-skin="nocturna"] .stamp.on{border-color:var(--accent2);background:color-mix(in srgb,var(--accent2) 14%,transparent);box-shadow:0 0 16px -4px color-mix(in srgb,var(--accent2) 85%,transparent)}
[data-skin="nocturna"] .wheel{box-shadow:0 0 0 5px var(--surface),0 0 0 7px var(--accent2),0 0 34px 2px color-mix(in srgb,var(--accent2) 45%,transparent)}
[data-skin="nocturna"] .pointer{border-top-color:var(--accent3);filter:drop-shadow(0 0 6px var(--accent3))}
[data-skin="nocturna"] .hrow{border-bottom-color:color-mix(in srgb,var(--accent2) 14%,transparent)}
[data-skin="nocturna"] .hrow.today dt,[data-skin="nocturna"] .hrow.today dd{color:var(--accent2)}
[data-skin="nocturna"] .map-art{background:linear-gradient(90deg,transparent 49%,color-mix(in srgb,var(--accent2) 32%,transparent) 49% 51%,transparent 51%) 0 0/58px 58px,linear-gradient(0deg,transparent 49%,color-mix(in srgb,var(--accent2) 32%,transparent) 49% 51%,transparent 51%) 0 0/58px 58px,color-mix(in srgb,var(--surface) 55%,var(--bg))}
[data-skin="nocturna"] .pin{box-shadow:0 0 0 5px color-mix(in srgb,var(--accent) 25%,transparent),0 0 20px var(--accent)}
[data-skin="nocturna"] .g dt{color:var(--accent2)}
[data-skin="nocturna"] .ev-w{color:var(--accent3)!important}
[data-skin="nocturna"] .free.hl{background:color-mix(in srgb,var(--accent) 12%,var(--surface));color:var(--ink);border-color:var(--accent)}
[data-skin="nocturna"] .free.hl .sh-k{color:var(--accent2);opacity:1}
[data-skin="nocturna"] .free.hl .btn.pri{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}
[data-skin="nocturna"] .fab{background:var(--accent);color:var(--on-accent);box-shadow:0 0 30px -4px color-mix(in srgb,var(--accent) 85%,transparent)}
[data-skin="nocturna"] .fab-n{background:var(--bg);color:var(--accent)}
[data-skin="nocturna"] .sheet{border-top:1px solid color-mix(in srgb,var(--accent) 45%,transparent);box-shadow:0 -12px 40px -14px color-mix(in srgb,var(--accent) 60%,transparent)}
[data-skin="nocturna"] .inp,[data-skin="nocturna"] .search input,[data-skin="nocturna"] .stepper{border-color:color-mix(in srgb,var(--accent2) 32%,transparent)}
[data-skin="nocturna"] .seg button.on{background:var(--accent2);color:var(--on-accent2)}
[data-skin="nocturna"] .tq-o{border-color:color-mix(in srgb,var(--accent2) 30%,transparent)}
[data-skin="nocturna"] .foot-n{font-size:30px;color:var(--accent);text-shadow:0 0 18px color-mix(in srgb,var(--accent) 70%,transparent)}
`,
    minimalista: `
[data-skin="minimalista"]{letter-spacing:-.003em;--gw:.52}
[data-skin="minimalista"] .top{background:color-mix(in srgb,var(--bg) 94%,transparent);border-bottom:1px solid var(--ink)}
[data-skin="minimalista"] .brand-mini{font-size:16px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
[data-skin="minimalista"] .logo{border-radius:var(--r)}
[data-skin="minimalista"] .status,[data-skin="minimalista"] .lang,[data-skin="minimalista"] .menu-btn{background:transparent;border:1px solid var(--ink);border-radius:var(--r)}
[data-skin="minimalista"] .status{font-weight:600}
[data-skin="minimalista"] .lang button{border-radius:max(0px,calc(var(--r) - 2px))}
[data-skin="minimalista"] .lang button.on{background:var(--ink);color:var(--bg)}
[data-skin="minimalista"] .menu-btn{width:40px;height:40px}
[data-skin="minimalista"] .m{padding-block:60px 4px}
[data-skin="minimalista"] .m-hero{padding-block:46px 8px}
[data-skin="minimalista"] .sh{padding-top:14px;border-top:1px solid var(--ink)}
[data-skin="minimalista"] .hero-k{display:flex;align-items:center;gap:12px;color:var(--ink);font-weight:600;letter-spacing:.16em}
[data-skin="minimalista"] .hero-k::before{content:"";flex:none;width:28px;height:2px;background:var(--accent)}
[data-skin="minimalista"] .hero-t{font-weight:800;font-size:min(calc(clamp(54px,16.5vw,104px) * var(--hs,1)),var(--fit,999px));line-height:.9;letter-spacing:-.05em}
[data-skin="minimalista"] .hero-t .dot{color:var(--accent)}
[data-skin="minimalista"] .hero-s{font-size:19px;max-width:30ch}
[data-skin="minimalista"] .hero-st{font-weight:500}
[data-skin="minimalista"] .btn{border-width:1px;font-weight:600;min-height:50px;padding:12px 22px}
[data-skin="minimalista"] .btn.pri{background:var(--ink);color:var(--bg);border-color:var(--ink)}
[data-skin="minimalista"] .btn.ghost{border-color:var(--ink)}
[data-skin="minimalista"] .ribbon{margin:32px max(20px,env(safe-area-inset-right,0px)) 0 max(20px,env(safe-area-inset-left,0px));padding:12px 0 0;border-top:1px solid color-mix(in srgb,var(--ink) 20%,transparent);white-space:normal;font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--ink)}
[data-skin="minimalista"] .ribbon-track{display:flex;flex-wrap:wrap;gap:4px 18px}
[data-skin="minimalista"] .ribbon-track span{padding:0}
[data-skin="minimalista"] .sh-k{color:var(--muted);font-weight:600;letter-spacing:.16em}
[data-skin="minimalista"] .sh-t{font-weight:800;font-size:clamp(34px,9.6vw,50px);line-height:.98;letter-spacing:-.04em}
[data-skin="minimalista"] .lay-tarjetas .it,[data-skin="minimalista"] .lay-cuadricula .it,[data-skin="minimalista"] .lay-fotos .it,[data-skin="minimalista"] .feat{background:var(--bg);border:1px solid color-mix(in srgb,var(--ink) 15%,transparent)}
[data-skin="minimalista"] .cl{background:transparent;border-bottom:1px solid color-mix(in srgb,var(--ink) 18%,transparent);border-radius:0;padding-inline:0}
[data-skin="minimalista"] .chip{border-width:1px;border-color:color-mix(in srgb,var(--ink) 24%,transparent);border-radius:var(--r);font-weight:500}
[data-skin="minimalista"] .chip.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
[data-skin="minimalista"] .cat-tabs{border-bottom:1px solid color-mix(in srgb,var(--ink) 14%,transparent)}
[data-skin="minimalista"] .cat-h{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:2px 12px;padding-bottom:8px;border-bottom:1px solid var(--ink)}
[data-skin="minimalista"] .cat-h h3{font-weight:800;font-size:23px;letter-spacing:-.025em}
[data-skin="minimalista"] .cat-h p{margin:0;font-size:13px}
[data-skin="minimalista"] .it h4{font-weight:600}
[data-skin="minimalista"] .lay-lista .it,[data-skin="minimalista"] .lay-compacta .it{border-bottom-color:color-mix(in srgb,var(--ink) 11%,transparent)}
[data-skin="minimalista"] .lead{border-bottom-color:transparent}
[data-skin="minimalista"] .price{font-weight:600}
[data-skin="minimalista"] .tag{background:transparent;border:1px solid color-mix(in srgb,var(--ink) 22%,transparent);border-radius:var(--r);color:var(--muted);font-weight:600;font-size:10.5px;letter-spacing:.1em}
[data-skin="minimalista"] .tag.t-chef,[data-skin="minimalista"] .tag.t-nuevo{border-color:var(--accent);color:var(--accent)}
[data-skin="minimalista"] .add{background:transparent;color:var(--ink);border:1px solid var(--ink);border-radius:var(--r);font-weight:400}
[data-skin="minimalista"] .add .q{background:var(--accent);color:var(--on-accent)}
[data-skin="minimalista"] .media,[data-skin="minimalista"] .media.m1,[data-skin="minimalista"] .media.m2{background:var(--surface);border-radius:var(--r)}
[data-skin="minimalista"] .media.none span{font-weight:800;color:var(--accent)}
[data-skin="minimalista"] .feat .media{border-radius:0}
[data-skin="minimalista"] .promo.today{background:var(--ink);color:var(--bg)}
[data-skin="minimalista"] .badge{background:var(--accent);color:var(--on-accent);border-radius:var(--r)}
[data-skin="minimalista"] .promo-d{color:var(--accent)!important}
[data-skin="minimalista"] .md-price{font-weight:800;font-size:34px;letter-spacing:-.03em}
[data-skin="minimalista"] .md-today,[data-skin="minimalista"] .hrow .hoy{border-radius:var(--r)}
[data-skin="minimalista"] .stamp{border-radius:var(--r);border:1px dashed color-mix(in srgb,var(--ink) 35%,transparent)}
[data-skin="minimalista"] .stamp.on{border:1px solid var(--ink);background:var(--ink)}
[data-skin="minimalista"] .hrow{border-bottom-color:color-mix(in srgb,var(--ink) 10%,transparent)}
[data-skin="minimalista"] .hrow .lead{border-bottom-color:transparent}
[data-skin="minimalista"] .map-art{background:linear-gradient(90deg,transparent 49.6%,color-mix(in srgb,var(--ink) 16%,transparent) 49.6% 50.4%,transparent 50.4%) 0 0/48px 48px,linear-gradient(0deg,transparent 49.6%,color-mix(in srgb,var(--ink) 16%,transparent) 49.6% 50.4%,transparent 50.4%) 0 0/48px 48px,var(--surface)}
[data-skin="minimalista"] .story{font-size:19px;letter-spacing:-.01em}
[data-skin="minimalista"] .g dt{font-weight:700;color:var(--ink)}
[data-skin="minimalista"] .free.hl{background:var(--ink);color:var(--bg)}
[data-skin="minimalista"] .free.hl .sh-k{color:inherit;opacity:.7}
[data-skin="minimalista"] .free.hl .btn.pri{background:var(--bg);color:var(--ink);border-color:var(--bg)}
[data-skin="minimalista"] .fab{border-radius:max(6px,var(--r))}
[data-skin="minimalista"] .fab-n{border-radius:max(4px,calc(var(--r) - 2px))}
[data-skin="minimalista"] .sheet{border-radius:max(10px,var(--r)) max(10px,var(--r)) 0 0;border-top:1px solid var(--ink)}
[data-skin="minimalista"] .x,[data-skin="minimalista"] .keypad button,[data-skin="minimalista"] .toast{border-radius:var(--r)}
[data-skin="minimalista"] .inp,[data-skin="minimalista"] .search input,[data-skin="minimalista"] .stepper,[data-skin="minimalista"] .tq-o{border-width:1px;border-color:color-mix(in srgb,var(--ink) 28%,transparent);border-radius:var(--r)}
[data-skin="minimalista"] .stepper button,[data-skin="minimalista"] .seg button{border-radius:max(0px,calc(var(--r) - 3px))}
[data-skin="minimalista"] .seg{border-radius:var(--r)}
[data-skin="minimalista"] .seg button.on{background:var(--ink);color:var(--bg);box-shadow:none}
[data-skin="minimalista"] .wheel,[data-skin="minimalista"] .hub{box-shadow:0 0 0 1px var(--ink)}
[data-skin="minimalista"] .foot{text-align:left;margin-top:40px;border-top:1px solid var(--ink)}
[data-skin="minimalista"] .foot-n{font-weight:800;font-size:30px;letter-spacing:-.03em}
[data-skin="minimalista"] .navi{font-weight:700;letter-spacing:-.02em}
`
  };

  /* Opciones de diseño que valen para cualquier estética: van después de su CSS. */
  const CSS_OPT = `
.app[data-btn="redondo"] .btn{border-radius:999px}
.app[data-btn="cuadrado"] .btn{border-radius:3px}
.app[data-btn="contorno"] .btn.pri{background:transparent;color:var(--ink);border-color:var(--accent);border-width:2px}
.app[data-btn="contorno"] .free.hl .btn.pri{background:transparent;color:inherit;border-color:currentColor}
`;

  /* ---------- Estado ---------- */
  let cfg = normalize(initialCfg);
  let skin = 'elegante';
  let root = null, sheetEl = null, sheetC = null, toastEl = null;
  let firstRender = true, spy = null;
  const timers = [];
  const memStore = {};
  const state = freshState();

  function freshState() {
    return {
      lang: 'es', cart: [], filter: 'all', q: '', itemSheet: null,
      order: { mode: '', table: '', address: '', name: '', pay: '', notes: '' },
      res: { date: '', time: '', people: 2, occ: '', name: '', notes: '' },
      trivia: {}, wheel: {}, pin: '', pinFor: null, justStamped: -1
    };
  }

  function normalize(c) {
    c = (c && typeof c === 'object') ? c : {};
    c.brand = c.brand || {};
    c.brand.hours = Array.isArray(c.brand.hours) ? c.brand.hours : [];
    c.theme = c.theme || {};
    c.theme.colors = c.theme.colors || {};
    c.theme.fonts = c.theme.fonts || {};
    c.menu = c.menu || {};
    c.menu.categories = Array.isArray(c.menu.categories) ? c.menu.categories : [];
    c.menu.categories.forEach(function (cat) { cat.items = Array.isArray(cat.items) ? cat.items : []; });
    c.modules = Array.isArray(c.modules) ? c.modules.filter(Boolean) : [];
    c.modules.forEach(function (m) { m.s = m.s || {}; });
    c.i18n = c.i18n || {};
    c.meta = c.meta || {};
    return c;
  }

  /* ---------- Utilidades ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  const attr = esc;
  function later(fn, ms) { const t = win.setTimeout(fn, ms); timers.push(t); return t; }
  function bilingual() { return !!(cfg.i18n && cfg.i18n.bilingual); }
  function lang() { return bilingual() && state.lang === 'en' ? 'en' : 'es'; }
  function tx(o, k) {
    if (!o) return '';
    if (lang() === 'en') { const v = o[k + '_en']; if (v != null && String(v).trim() !== '') return v; }
    return o[k] == null ? '' : o[k];
  }
  function uiL(L, k, vars) {
    let s = UI[L] && UI[L][k];
    if (L === 'es' && cfg.i18n && cfg.i18n.usted && ES_USTED[k] != null) s = ES_USTED[k];
    if (s == null) s = UI.es[k];
    if (s == null) return k;
    if (typeof s !== 'string') return s;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m0, p) { return vars[p] != null ? vars[p] : m0; });
    return s;
  }
  function ui(k, vars) { return uiL(lang(), k, vars); }
  function tagLabel(t) { const T = ui('tags'); return (T && T[t]) || t; }
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
  function norm(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function splitList(s) { return String(s || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean); }
  function safeUrl(u) { u = String(u || '').trim(); return /^https?:\/\/[^\s"'<>]+$/i.test(u) ? u : ''; }
  function safeImg(u) { u = String(u || '').trim(); return (/^https:\/\/[^\s"'<>]+$/i.test(u) || /^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,[a-z0-9+\/=]+$/i.test(u)) ? u : ''; }
  function handle(s) { s = String(s || '').trim().replace(/\/+$/, ''); if (/^https?:/i.test(s)) s = s.split('/').pop(); return s.replace(/^@/, '').replace(/[^\w.\-]/g, ''); }
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function money(n, style) {
    n = Math.round(Number(n) || 0);
    if (style === 'short') { const k = Math.round(n / 100) / 10; return k.toLocaleString('es-CO', { maximumFractionDigits: 1 }); }
    return '$' + n.toLocaleString('es-CO', { maximumFractionDigits: 0 });
  }
  function toMin(s) { const m = /^(\d{1,2}):(\d{2})$/.exec(s || ''); return m ? (+m[1]) * 60 + (+m[2]) : null; }
  function fmtTimeL(L, hhmm) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || '');
    if (!m) return hhmm || '';
    let h = +m[1]; if (h === 24) h = 0;
    const pm = h >= 12, h12 = (h % 12) || 12;
    return L === 'en' ? h12 + ':' + m[2] + ' ' + (pm ? 'PM' : 'AM') : h12 + ':' + m[2] + ' ' + (pm ? 'p. m.' : 'a. m.');
  }
  function fmtTime(hhmm) { return fmtTimeL(lang(), hhmm); }
  function dayName(d, L) { return uiL(L || lang(), 'dayNames')[d]; }
  function fmtDays(days, L) {
    L = L || lang();
    const D = uiL(L, 'dayNames'), order = [1, 2, 3, 4, 5, 6, 0];
    const set = order.filter(function (d) { return (days || []).map(Number).indexOf(d) >= 0; });
    if (!set.length) return '';
    if (set.length === 7) return uiL(L, 'everyday');
    const idx = set.map(function (d) { return order.indexOf(d); });
    const contiguous = idx.every(function (v, i) { return i === 0 || v === idx[i - 1] + 1; });
    if (set.length >= 3 && contiguous) return cap(D[set[0]] + ' ' + uiL(L, 'to') + ' ' + D[set[set.length - 1]]);
    if (set.length === 1) return cap(D[set[0]]);
    return cap(set.slice(0, -1).map(function (d) { return D[d]; }).join(', ') + ' ' + uiL(L, 'and') + ' ' + D[set[set.length - 1]]);
  }
  function fmtPhone(s) {
    const d = digits(s);
    if (d.length === 12 && d.indexOf('57') === 0) return '+57 ' + d.slice(2, 5) + ' ' + d.slice(5, 8) + ' ' + d.slice(8);
    return s;
  }
  function paras(text) {
    return String(text || '').split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean)
      .map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; }).join('');
  }
  function reducedMotion() {
    try { return !!(win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }
  function motion() { return reducedMotion() ? 'off' : (cfg.theme.motion || 'suave'); }
  function sget(k, d) {
    try { const v = win.localStorage.getItem(k); if (v != null) return JSON.parse(v); } catch (e) { /* almacenamiento no disponible */ }
    return Object.prototype.hasOwnProperty.call(memStore, k) ? memStore[k] : d;
  }
  function sset(k, v) { memStore[k] = v; try { win.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  function key(x) { return 'break:' + String(cfg.id || 'app') + ':' + x; }

  function nowLocal() {
    const d = opts.now ? new Date(opts.now) : new Date();
    const tz = cfg.brand.tz || 'America/Bogota';
    try {
      const p = {};
      new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
      let h = +p.hour; if (h === 24) h = 0;
      return { d: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[p.weekday], min: h * 60 + (+p.minute), iso: p.year + '-' + p.month + '-' + p.day };
    } catch (e) {
      return { d: d.getDay(), min: d.getHours() * 60 + d.getMinutes(), iso: d.toISOString().slice(0, 10) };
    }
  }
  function fmtDate(iso, L) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return iso || '';
    try {
      return new Intl.DateTimeFormat(L === 'en' ? 'en-US' : 'es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(iso + 'T12:00:00Z'));
    } catch (e) { return iso; }
  }

  function statusInfo() {
    const H = cfg.brand.hours || [];
    if (!H.some(function (h) { return h && !h.closed && toMin(h.open) != null && toMin(h.close) != null; })) return null;
    const now = nowLocal();
    const get = function (d) { return H.filter(function (h) { return h && +h.d === d; })[0]; };
    const span = function (h) { return { o: toMin(h.open), c: toMin(h.close) }; };
    const td = get(now.d);
    if (td && !td.closed) {
      const t = span(td);
      if (t.o != null && t.c != null && (t.c > t.o ? (now.min >= t.o && now.min < t.c) : now.min >= t.o)) return { open: true, text: ui('stOpen', { t: fmtTime(td.close) }) };
    }
    const yd = get((now.d + 6) % 7);
    if (yd && !yd.closed) {
      const t = span(yd);
      if (t.o != null && t.c != null && t.c <= t.o && now.min < t.c) return { open: true, text: ui('stOpen', { t: fmtTime(yd.close) }) };
    }
    for (let k = 0; k <= 7; k++) {
      const dd = (now.d + k) % 7, h = get(dd);
      if (!h || h.closed) continue;
      const t = span(h);
      if (t.o == null) continue;
      if (k === 0 && t.o <= now.min) continue;
      const at = fmtTime(h.open);
      if (k === 0) return { open: false, text: ui('stClosedToday', { t: at }) };
      if (k === 1) return { open: false, text: ui('stClosedTomorrow', { t: at }) };
      return { open: false, text: ui('stClosedDay', { d: dayName(dd), t: at }) };
    }
    return { open: false, text: ui('stClosedNoInfo') };
  }

  /* ---------- Datos ---------- */
  function mods() { return cfg.modules.filter(function (m) { return m && m.on !== false && RENDER[m.type]; }); }
  function firstMod(type) { return mods().filter(function (m) { return m.type === type; })[0] || null; }
  function modById(id) { return cfg.modules.filter(function (m) { return m && m.id === id; })[0] || null; }
  function ordering() { return !!firstMod('pedido'); }
  function pedidoS() { const m = firstMod('pedido'); return (m && m.s) || {}; }
  function cartaS() { const m = firstMod('carta'); return (m && m.s) || {}; }
  function priceStyle() { return cartaS().priceStyle || 'full'; }
  function allItems() {
    const out = [];
    cfg.menu.categories.forEach(function (c) { c.items.forEach(function (it) { if (it) out.push(it); }); });
    return out;
  }
  function catOf(id) { return cfg.menu.categories.filter(function (c) { return c.items.some(function (it) { return it && it.id === id; }); })[0] || null; }
  function findItem(id) { return allItems().filter(function (it) { return it.id === id; })[0] || null; }
  function anchor(m) { return 's-' + m.id; }
  function modTitle(m) { return tx(m.s, 'title') || ui('t_' + m.type); }

  /* ---------- Piezas visuales ---------- */
  function logoHTML(size) {
    const l = cfg.brand.logo || {}, name = cfg.brand.name || '';
    const img = l.type === 'img' ? safeImg(l.value) : '';
    if (img) return '<span class="logo img ' + size + '"><img src="' + attr(img) + '" alt=""></span>';
    if (l.type === 'emoji' && l.value) return '<span class="logo emo ' + size + '">' + esc(l.value) + '</span>';
    const mono = (l.type === 'mono' && l.value) ? l.value : name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0); }).join('');
    return '<span class="logo mono ' + size + '">' + esc(String(mono).slice(0, 3)) + '</span>';
  }
  function sh(m, kicker) {
    const k = tx(m.s, 'kicker') || kicker || '';
    return '<div class="sh">' + (k ? '<p class="sh-k">' + esc(k) + '</p>' : '') + '<h2 class="sh-t">' + esc(modTitle(m)) + '</h2><span class="orn" aria-hidden="true"></span></div>';
  }
  function emptyNote(text) { return PREVIEW ? '<div class="wrap"><p class="pv-empty">' + esc(text) + '</p></div>' : ''; }
  function mediaHTML(it, i) {
    const img = safeImg(it.img);
    const n = 'm' + (i % 3);
    if (img) return '<div class="media ' + n + '"><img src="' + attr(img) + '" alt="" loading="lazy"></div>';
    if (it.emoji) return '<div class="media ' + n + '"><span>' + esc(it.emoji) + '</span></div>';
    return '<div class="media none ' + n + '"><span>' + esc(String(tx(it, 'name')).charAt(0)) + '</span></div>';
  }
  function tagsHTML(it) {
    return (it.tags || []).filter(function (t) { return TAG_ORDER.indexOf(t) >= 0; })
      .map(function (t) { return '<span class="tag t-' + t + '">' + esc(tagLabel(t)) + '</span>'; }).join('');
  }
  function qtyOf(id) { return state.cart.filter(function (l) { return l.id === id; }).reduce(function (a, l) { return a + l.qty; }, 0); }
  function qBadge(id) { const n = qtyOf(id); return n ? '<b class="q">' + n + '</b>' : ''; }
  function addBtn(it) {
    if (!ordering() || it.on === false) return '';
    return '<button class="add" data-act="add" data-id="' + attr(it.id) + '" aria-label="' + attr(ui('add') + ' ' + tx(it, 'name')) + '"><span aria-hidden="true">+</span>' + qBadge(it.id) + '</button>';
  }
  function facadeSVG() {
    let rail = '';
    for (let x = 46; x <= 314; x += 12) rail += 'M' + x + ' 76V96';
    let s = '<svg class="facade" viewBox="0 0 360 228" role="img" aria-label="' + attr(ui('facade')) + '">';
    s += '<defs><pattern id="bk-zp" width="20" height="20" patternUnits="userSpaceOnUse"><rect class="f-z1" width="20" height="20"/><path class="f-z2" d="M10 2 18 10 10 18 2 10Z"/><circle class="f-z3" cx="10" cy="10" r="2.6"/></pattern></defs>';
    s += '<rect class="f-ground" x="0" y="214" width="360" height="10" rx="2"/>';
    s += '<rect class="f-wall" x="26" y="38" width="308" height="176"/>';
    s += '<rect x="26" y="186" width="308" height="28" fill="url(#bk-zp)"/>';
    s += '<path class="f-roof" d="M6 40H354L338 16H22Z"/><rect class="f-eave" x="6" y="40" width="348" height="5"/>';
    [60, 158, 256].forEach(function (x) {
      s += '<rect class="f-shut" x="' + (x - 12) + '" y="52" width="12" height="44"/><rect class="f-shut" x="' + (x + 44) + '" y="52" width="12" height="44"/>';
      s += '<rect class="f-frame" x="' + x + '" y="52" width="44" height="44" rx="2"/><rect class="f-glass" x="' + (x + 5) + '" y="57" width="34" height="39"/>';
    });
    s += '<rect class="f-bal" x="38" y="96" width="284" height="7" rx="1"/><rect class="f-bal" x="38" y="72" width="284" height="4" rx="1"/><path class="f-rail" d="' + rail + '"/>';
    [80, 178, 276].forEach(function (x) { s += '<circle class="f-flower" cx="' + x + '" cy="67" r="5"/><circle class="f-flower2" cx="' + (x + 9) + '" cy="68" r="4"/>'; });
    [52, 246].forEach(function (x) {
      s += '<rect class="f-frame" x="' + x + '" y="122" width="62" height="56" rx="2"/><rect class="f-glass" x="' + (x + 6) + '" y="128" width="50" height="50"/>';
      s += '<path class="f-grille" d="M' + (x + 18) + ' 128V178M' + (x + 31) + ' 128V178M' + (x + 44) + ' 128V178M' + (x + 6) + ' 152H' + (x + 56) + '"/>';
    });
    s += '<path class="f-doorframe" d="M150 214V146a30 30 0 0 1 60 0V214Z"/><path class="f-door" d="M156 214V148a24 24 0 0 1 48 0V214Z"/><path class="f-grille" d="M180 124V214"/>';
    s += '<circle class="f-z3" cx="172" cy="184" r="2.4"/><circle class="f-z3" cx="188" cy="184" r="2.4"/></svg>';
    return s;
  }
  /* Lomas del Eje Cafetero con surcos de café (estética natural). */
  function hillsSVG() {
    return '<svg class="hills" viewBox="0 0 400 90" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
      '<path class="hl1" d="M0 50C48 28 96 22 150 34S250 62 310 42S376 20 400 28V90H0Z"/>' +
      '<path class="hl2" d="M0 64C60 44 120 42 186 56S300 76 356 60S392 52 400 54V90H0Z"/>' +
      '<path class="hrw" d="M12 68C70 52 124 50 184 62M28 77C84 63 140 61 198 71M204 64C254 76 302 80 350 68M224 74C270 84 318 86 372 76"/>' +
      '<path class="hl3" d="M0 80C80 70 160 72 240 80S360 86 400 80V90H0Z"/>' +
      '</svg>';
  }
  function stickersHTML() {
    const ems = [];
    const items = allItems().slice().sort(function (a, b) { return ((b.tags || []).indexOf('popular') >= 0) - ((a.tags || []).indexOf('popular') >= 0); });
    items.forEach(function (it) { if (it.emoji && ems.indexOf(it.emoji) < 0 && ems.length < 4) ems.push(it.emoji); });
    return ems.map(function (e, i) { return '<span class="stk s' + (i + 1) + '" aria-hidden="true">' + esc(e) + '</span>'; }).join('');
  }
  function ribbonHTML(list) {
    const one = list.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('');
    const marquee = skin === 'animado' || skin === 'nocturna';
    return '<div class="ribbon" aria-hidden="true"><div class="ribbon-track">' + one + (marquee ? one : '') + '</div></div>';
  }

  /* ---------- Módulos ---------- */
  const CTA_MOD = { carta: 'carta', reservas: 'reservas', sellos: 'sellos', ubicacion: 'ubicacion', eventos: 'eventos' };
  function ctaOk(c) { if (c === 'whatsapp') return true; if (c === 'pedido') return ordering(); return !!(CTA_MOD[c] && firstMod(CTA_MOD[c])); }

  const RENDER = {
    hero: function (m) {
      const s = m.s, b = cfg.brand;
      const title = tx(s, 'title') || b.name || '';
      const kicker = tx(s, 'kicker'), sub = tx(s, 'subtitle') || tx(b, 'tagline');
      const btns = [s.cta1, s.cta2].filter(function (c, i, a) { return c && c !== 'none' && ctaOk(c) && a.indexOf(c) === i; })
        .map(function (c, i) { return '<button class="btn ' + (i === 0 ? 'pri' : 'ghost') + '" data-act="cta" data-to="' + attr(c) + '">' + esc(ui('cta_' + c)) + '</button>'; }).join('');
      const st = s.showStatus !== false ? statusInfo() : null;
      /* Foto de portada: enlace https o imagen subida; el velo es el color de fondo para que el texto se lea. */
      const img = safeImg(s.img);
      const veil = { '40': 40, '60': 60, '80': 80 }[String(s.veil)] || 60;
      const align = s.align === 'izq' || s.align === 'centro' ? s.align : '';
      const size = s.size === 's' || s.size === 'l' ? s.size : '';
      let deco = '';
      if (skin === 'elegante') deco = '<div class="hero-mono">' + logoHTML('lg') + '</div>';
      else if (skin === 'animado') deco = stickersHTML();
      else if (skin === 'cultural' && !img) deco = facadeSVG();
      else if (skin === 'nocturna' && st) deco = '<p class="neon ' + (st.open ? 'on' : 'off') + '" aria-hidden="true">' + esc(st.open ? ui('open') : ui('closed')) + '</p>';
      /* En la minimalista el título cierra con un punto del color de acento, salvo que ya termine en un signo. */
      const dot = skin === 'minimalista' && /[\p{L}\p{N}]$/u.test(title) ? '<span class="dot" aria-hidden="true">.</span>' : '';
      const ribbon = splitList(tx(s, 'ribbon'));
      const photo = img ? '<div class="hero-ph" aria-hidden="true"><img src="' + attr(img) + '" alt="" fetchpriority="high"><i style="--veil:' + veil + '%"></i></div>' +
        (PREVIEW && !/^data:/.test(img) ? '<p class="pv-empty ph-note">No se pudo cargar la foto. En la vista previa de claude.ai solo se ven las fotos subidas desde el estudio; los enlaces https sí se ven en la app publicada.</p>' : '') : '';
      /* Largo de la palabra más larga: el CSS limita el tamaño del título para que no se parta a la mitad. */
      const wl = Math.max(5, Math.max.apply(null, String(title).split(/\s+/).map(function (w) { return w.length; }))) + (dot ? 1 : 0);
      return '<div class="hero-box' + (img ? ' has-img' : '') + (align ? ' al-' + align : '') + (size ? ' hs-' + size : '') + '" style="--wl:' + wl + '">' + photo +
        '<div class="hero-in wrap">' + deco +
        (kicker ? '<p class="hero-k">' + esc(kicker) + '</p>' : '') +
        '<h1 class="hero-t">' + esc(title) + dot + '</h1>' +
        (sub ? '<p class="hero-s">' + esc(sub) + '</p>' : '') +
        '<span class="orn" aria-hidden="true"></span>' +
        (st ? '<p class="hero-st ' + (st.open ? 'on' : 'off') + '"><i></i>' + esc(st.text) + '</p>' : '') +
        (btns ? '<div class="btns">' + btns + '</div>' : '') +
        '</div>' + (ribbon.length ? ribbonHTML(ribbon) : '') +
        (skin === 'cultural' ? '<div class="zocalo" aria-hidden="true"></div>' : '') +
        (skin === 'natural' ? hillsSVG() : '') + '</div>';
    },

    carta: function (m) {
      const s = m.s;
      const cats = cfg.menu.categories.filter(function (c) { return c.items.length; });
      if (!cats.length) return emptyNote('La carta está vacía. Agrega categorías y platos en la pestaña Carta.');
      const used = TAG_ORDER.filter(function (t) { return allItems().some(function (i) { return (i.tags || []).indexOf(t) >= 0; }); });
      if (state.filter !== 'all' && used.indexOf(state.filter) < 0) state.filter = 'all';
      const filters = (s.showFilters !== false && used.length) ? '<div class="chips filters" role="group" aria-label="' + attr(ui('all')) + '">' + ['all'].concat(used).map(function (t) {
        return '<button class="chip ' + (state.filter === t ? 'on' : '') + '" data-act="filter" data-tag="' + t + '">' + esc(t === 'all' ? ui('all') : tagLabel(t)) + '</button>';
      }).join('') + '</div>' : '';
      const search = s.showSearch ? '<label class="search"><span class="vh">' + esc(ui('search')) + '</span><input type="search" data-in="q" placeholder="' + attr(ui('search')) + '" value="' + attr(state.q) + '" autocomplete="off" enterkeyhint="search"></label>' : '';
      const tabs = cats.length > 1 ? '<nav class="cat-tabs" aria-label="' + attr(modTitle(m)) + '"><div class="chips">' + cats.map(function (c) {
        return '<button class="chip" data-act="cat" data-c="' + attr(c.id) + '">' + (c.icon && skin !== 'elegante' ? '<span class="ci" aria-hidden="true">' + esc(c.icon) + '</span>' : '') + esc(tx(c, 'name')) + '</button>';
      }).join('') + '</div></nav>' : '';
      return '<div class="wrap">' + sh(m) + (tx(s, 'intro') ? '<p class="lead-p">' + esc(tx(s, 'intro')) + '</p>' : '') + search + filters + '</div>' + tabs +
        '<div class="wrap carta-body lay-' + attr(s.layout || 'lista') + '" data-carta-body="' + attr(m.id) + '">' + cartaBody(m) + '</div>' +
        (tx(s, 'footnote') ? '<p class="wrap foot-note">' + esc(tx(s, 'footnote')) + '</p>' : '');
    },

    destacados: function (m) {
      const s = m.s, tag = s.tag || 'chef', max = clamp(+s.max || 4, 1, 10);
      const items = allItems().filter(function (it) { return (it.tags || []).indexOf(tag) >= 0 && it.on !== false; }).slice(0, max);
      if (!items.length) return emptyNote('Marca platos con la etiqueta «' + tagLabel(tag) + '» para que aparezcan aquí.');
      return '<div class="wrap">' + sh(m) + '</div><div class="rail">' + items.map(function (it, i) {
        return '<article class="feat" data-act="item" data-id="' + attr(it.id) + '">' + mediaHTML(it, i) + '<div class="feat-b"><h4>' + esc(tx(it, 'name')) + '</h4>' +
          (tx(it, 'desc') ? '<p>' + esc(tx(it, 'desc')) + '</p>' : '') + '<span class="price">' + esc(money(it.price, priceStyle())) + '</span></div></article>';
      }).join('') + '</div>';
    },

    promos: function (m) {
      const s = m.s, list = (s.items || []).filter(function (p) { return p && tx(p, 'title'); });
      if (!list.length) return emptyNote('Agrega al menos una promoción.');
      const today = nowLocal().d;
      const isToday = function (p) { return s.highlightToday !== false && (p.days || []).map(Number).indexOf(today) >= 0; };
      const sorted = list.slice().sort(function (a, b) { return isToday(b) - isToday(a); });
      return '<div class="wrap">' + sh(m) + '<div class="promos">' + sorted.map(function (p) {
        const t = isToday(p);
        return '<article class="promo ' + (t ? 'today' : '') + '">' + (t ? '<span class="badge">' + esc(ui('todayBadge')) + '</span>' : '') +
          '<p class="promo-d">' + esc(fmtDays(p.days)) + '</p><h4>' + esc(tx(p, 'title')) + '</h4>' +
          (tx(p, 'desc') ? '<p>' + esc(tx(p, 'desc')) + '</p>' : '') + (+p.price ? '<span class="price">' + esc(money(p.price, 'full')) + '</span>' : '') + '</article>';
      }).join('') + '</div></div>';
    },

    menudia: function (m) {
      const s = m.s, parts = (s.parts || []).filter(function (p) { return p && (tx(p, 'label') || tx(p, 'value')); });
      const days = (s.days && s.days.length) ? s.days.map(Number) : [1, 2, 3, 4, 5];
      const when = fmtDays(days) + (s.from && s.to ? ' · ' + fmtTime(s.from) + ' – ' + fmtTime(s.to) : '');
      const today = days.indexOf(nowLocal().d) >= 0;
      return '<div class="wrap">' + sh(m) + '<div class="md card">' + (today ? '<span class="md-today">' + esc(ui('lunchToday')) + '</span>' : '') +
        '<div class="md-top"><p class="md-when">' + esc(when) + '</p>' + (+s.price ? '<p class="md-price price">' + esc(money(s.price, 'full')) + '</p>' : '') + '</div>' +
        '<dl class="md-list">' + parts.map(function (p) { return '<div class="md-row"><dt>' + esc(tx(p, 'label')) + '</dt><dd>' + esc(tx(p, 'value')) + '</dd></div>'; }).join('') + '</dl>' +
        (tx(s, 'note') ? '<p class="md-note">' + esc(tx(s, 'note')) + '</p>' : '') +
        (ordering() && +s.price ? '<button class="btn pri" data-act="menudia-add" data-mid="' + attr(m.id) + '">' + esc(ui('lunch')) + '</button>' : '') + '</div></div>';
    },

    pedido: function (m) {
      const s = m.s;
      if (s.showSection === false) return '';
      const extra = [];
      if (tx(s, 'deliveryNote')) extra.push(esc(tx(s, 'deliveryNote')));
      if (+s.deliveryFee && orderModes().indexOf('domicilio') >= 0) extra.push(esc(ui('delivery')) + ' ' + esc(money(s.deliveryFee, 'full')));
      if (+s.minOrder && orderModes().indexOf('domicilio') >= 0) extra.push(esc(ui('minShort', { v: money(s.minOrder, 'full') })));
      return '<div class="wrap">' + sh(m) + '<div class="card how"><ol class="steps"><li>' + esc(ui('how1')) + '</li><li>' + esc(ui('how2')) + '</li><li>' + esc(ui('how3')) + '</li></ol>' +
        '<div class="chips static wrapc">' + orderModes().map(function (x) { return '<span class="chip">' + esc(ui('mode_' + x)) + '</span>'; }).join('') + '</div>' +
        (extra.length ? '<p class="small">' + extra.join(' · ') + '</p>' : '') +
        (firstMod('carta') ? '<div class="btns"><button class="btn pri" data-act="cta" data-to="carta">' + esc(ui('cta_carta')) + '</button></div>' : '') + '</div></div>';
    },

    reservas: function (m) {
      const s = m.s, r = state.res;
      const slots = splitList(s.slots), occ = splitList(tx(s, 'occasions'));
      return '<div class="wrap">' + sh(m) + (tx(s, 'text') ? '<p class="lead-p">' + esc(tx(s, 'text')) + '</p>' : '') +
        '<form class="form card" data-form="res" data-mid="' + attr(m.id) + '" novalidate>' +
        '<div class="row2"><label class="field"><span class="lbl">' + esc(ui('date')) + '</span><input class="inp" type="date" data-bind="res.date" min="' + attr(nowLocal().iso) + '" value="' + attr(r.date) + '"></label>' +
        (slots.length ? '' : '<label class="field"><span class="lbl">' + esc(ui('time')) + '</span><input class="inp" type="time" data-bind="res.time" value="' + attr(r.time) + '"></label>') + '</div>' +
        (slots.length ? '<div class="field"><span class="lbl">' + esc(ui('time')) + '</span><div class="chips wrapc">' + slots.map(function (t) {
          return '<button type="button" class="chip ' + (r.time === t ? 'on' : '') + '" data-act="res-slot" data-v="' + attr(t) + '">' + esc(fmtTime(t)) + '</button>';
        }).join('') + '</div></div>' : '') +
        '<div class="field"><span class="lbl">' + esc(ui('people')) + '</span><div class="stepper"><button type="button" data-act="res-ppl" data-d="-1" aria-label="−">−</button><output>' + r.people + '</output><button type="button" data-act="res-ppl" data-d="1" aria-label="+">+</button></div></div>' +
        (occ.length ? '<div class="field"><span class="lbl">' + esc(ui('occasion')) + '</span><div class="chips wrapc">' + occ.map(function (o) {
          return '<button type="button" class="chip ' + (r.occ === o ? 'on' : '') + '" data-act="res-occ" data-v="' + attr(o) + '">' + esc(o) + '</button>';
        }).join('') + '</div></div>' : '') +
        '<label class="field"><span class="lbl">' + esc(ui('name')) + '</span><input class="inp" type="text" data-bind="res.name" value="' + attr(r.name) + '" autocomplete="name"></label>' +
        '<label class="field"><span class="lbl">' + esc(ui('notes')) + '</span><textarea class="inp" rows="2" data-bind="res.notes" placeholder="' + attr(ui('resNotesPh')) + '">' + esc(r.notes) + '</textarea></label>' +
        '<p class="form-err" data-err="res" hidden></p><button class="btn pri wide" type="submit">' + esc(ui('sendRes')) + '</button>' +
        (tx(s, 'note') ? '<p class="small">' + esc(tx(s, 'note')) + '</p>' : '') + '</form></div>';
    },

    sellos: function (m) {
      const s = m.s, goal = clamp(+s.goal || 8, 3, 20), st = stampsGet(m), n = Math.min(st.n, goal), won = n >= goal;
      let cells = '';
      for (let i = 0; i < goal; i++) {
        const on = i < n;
        cells += '<span class="stamp ' + (on ? 'on ' : '') + (state.justStamped === i ? 'just' : '') + '">' + (on ? esc(s.icon || '★') : '<em>' + (i + 1) + '</em>') + '</span>';
      }
      return '<div class="wrap">' + sh(m) + '<div class="card stampcard ' + (won ? 'won' : '') + '"><div class="sc-top"><p class="sc-reward">' + esc(tx(s, 'reward')) + '</p><p class="sc-count">' + esc(ui('stampsOf', { n: n, g: goal })) + '</p></div>' +
        '<div class="stamps" style="--cols:' + (goal <= 8 ? 4 : 5) + '">' + cells + '</div>' +
        (won ? '<p class="sc-won">' + esc(ui('prize')) + '</p>' : '') +
        '<div class="btns"><button class="btn ' + (won ? 'pri' : 'ghost') + '" data-act="stamp" data-mode="' + (won ? 'redeem' : 'add') + '" data-mid="' + attr(m.id) + '">' + esc(won ? ui('redeemBtn') : ui('stampBtn')) + '</button></div>' +
        (tx(s, 'note') ? '<p class="small" style="margin-top:14px">' + esc(tx(s, 'note')) + '</p>' : '') + '</div></div>';
    },

    resenas: function (m) {
      const s = m.s, url = safeUrl(cfg.brand.reviewUrl);
      const quotes = (s.quotes || []).filter(function (q) { return q && tx(q, 'text'); });
      return '<div class="wrap">' + sh(m) + (tx(s, 'text') ? '<p class="lead-p">' + esc(tx(s, 'text')) + '</p>' : '') +
        (s.rating ? '<p class="rating"><b>' + esc(s.rating) + '</b> ★ <span class="small">' + esc(ui('onGoogle')) + '</span></p>' : '') +
        (quotes.length ? '<div class="quotes">' + quotes.map(function (q) { return '<figure class="quote"><blockquote>' + esc(tx(q, 'text')) + '</blockquote>' + (q.author ? '<figcaption>' + esc(q.author) + '</figcaption>' : '') + '</figure>'; }).join('') + '</div>' : '') +
        '<div class="btns">' + (url ? '<a class="btn pri" href="' + attr(url) + '" target="_blank" rel="noopener">' + esc(ui('reviewG')) + '</a>' : '') +
        '<button class="btn ghost" data-act="review-wa">' + esc(ui('reviewWa')) + '</button></div>' +
        (!url && PREVIEW ? '<p class="pv-empty" style="margin-top:14px">Pega el enlace de reseñas de Google en Datos para mostrar el botón de Google.</p>' : '') + '</div>';
    },

    horario: function (m) {
      const s = m.s, H = cfg.brand.hours || [];
      if (!H.length) return emptyNote('Configura el horario en la pestaña Datos.');
      const now = nowLocal(), st = statusInfo();
      return '<div class="wrap">' + sh(m) + (st ? '<p class="hstat ' + (st.open ? 'on' : 'off') + '"><i></i>' + esc(st.text) + '</p>' : '') +
        '<dl class="hours">' + [1, 2, 3, 4, 5, 6, 0].map(function (d) {
          const h = H.filter(function (x) { return +x.d === d; })[0], closed = !h || h.closed || !h.open;
          return '<div class="hrow ' + (d === now.d ? 'today' : '') + '"><dt>' + esc(cap(dayName(d))) + (d === now.d ? '<span class="hoy">' + esc(ui('today')) + '</span>' : '') + '</dt><span class="lead" aria-hidden="true"></span><dd>' +
            esc(closed ? ui('closed') : fmtTime(h.open) + ' – ' + fmtTime(h.close)) + '</dd></div>';
        }).join('') + '</dl>' + (tx(s, 'note') ? '<p class="small" style="margin-top:12px">' + esc(tx(s, 'note')) + '</p>' : '') + '</div>';
    },

    ubicacion: function (m) {
      const s = m.s, b = cfg.brand;
      const q = b.mapsQuery || [b.address, b.city].filter(Boolean).join(', ');
      const gm = safeUrl(b.maps) || (q ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q) : '');
      const wz = q ? 'https://waze.com/ul?q=' + encodeURIComponent(q) + '&navigate=yes' : '';
      const note = tx(s, 'text') || tx(b, 'addressNote');
      return '<div class="wrap">' + sh(m) + '<div class="mapcard card"><div class="map-art" aria-hidden="true"><span class="pin"></span></div><div class="map-b">' +
        (b.address ? '<p class="addr">' + esc(b.address) + '</p>' : '') + (b.city ? '<p class="city">' + esc(b.city) + '</p>' : '') +
        (note ? '<p class="small">' + esc(note) + '</p>' : '') +
        '<div class="btns">' + (gm ? '<a class="btn pri" href="' + attr(gm) + '" target="_blank" rel="noopener">' + esc(ui('mapsBtn')) + '</a>' : '') +
        (wz ? '<a class="btn ghost" href="' + attr(wz) + '" target="_blank" rel="noopener">' + esc(ui('wazeBtn')) + '</a>' : '') + '</div></div></div></div>';
    },

    historia: function (m) {
      const s = m.s;
      if (!tx(s, 'text')) return emptyNote('Escribe la historia del local.');
      return '<div class="wrap">' + sh(m, s.year ? ui('since', { y: s.year }) : '') + '<div class="story">' + paras(tx(s, 'text')) +
        (tx(s, 'signature') ? '<p class="sig">' + esc(tx(s, 'signature')) + '</p>' : '') + '</div></div>';
    },

    glosario: function (m) {
      const s = m.s, items = (s.items || []).filter(function (x) { return x && tx(x, 'term'); });
      if (!items.length) return emptyNote('Agrega palabras al glosario.');
      return '<div class="wrap">' + sh(m) + (tx(s, 'intro') ? '<p class="lead-p">' + esc(tx(s, 'intro')) + '</p>' : '') +
        '<dl class="gloss">' + items.map(function (x) { return '<div class="g"><dt>' + esc(tx(x, 'term')) + '</dt><dd>' + esc(tx(x, 'def')) + '</dd></div>'; }).join('') + '</dl></div>';
    },

    eventos: function (m) {
      const s = m.s, list = s.items || [];
      const cards = list.map(function (e, i) {
        if (!e || !tx(e, 'title')) return '';
        return '<article class="ev card">' + (tx(e, 'when') ? '<p class="ev-w">' + esc(tx(e, 'when')) + '</p>' : '') + '<h4>' + esc(tx(e, 'title')) + '</h4>' +
          (tx(e, 'desc') ? '<p>' + esc(tx(e, 'desc')) + '</p>' : '') +
          (e.rsvp ? '<button class="btn sm ghost" data-act="rsvp" data-mid="' + attr(m.id) + '" data-i="' + i + '">' + esc(ui('rsvp')) + '</button>' : '') + '</article>';
      }).join('');
      if (!cards) return emptyNote('Agrega al menos un evento.');
      return '<div class="wrap">' + sh(m) + '<div class="events">' + cards + '</div></div>';
    },

    wifi: function (m) {
      const s = m.s;
      if (!s.network && !s.password) return emptyNote('Escribe el nombre de la red y la clave.');
      return '<div class="wrap">' + sh(m) + '<div class="wifi card"><div class="wf-row"><span class="lbl">' + esc(ui('network')) + '</span><code>' + esc(s.network || '') + '</code></div>' +
        '<div class="wf-row"><span class="lbl">' + esc(ui('password')) + '</span><code class="sel">' + esc(s.password || '') + '</code></div>' +
        (s.password ? '<button class="btn pri" data-act="copy" data-copy="' + attr(s.password) + '">' + esc(ui('copyPass')) + '</button>' : '') + '</div></div>';
    },

    ruleta: function (m) {
      const s = m.s, optsW = wheelOpts(m);
      if (optsW.length < 2) return emptyNote(s.mode === 'premios' ? 'Agrega al menos dos premios a la ruleta.' : 'La ruleta necesita al menos dos platos en la carta.');
      const w = wheelState(m.id), n = optsW.length, seg = 360 / n;
      const fills = ['var(--accent)', 'var(--accent2)', 'var(--accent3)', 'var(--surface)'];
      const inks = ['var(--on-accent)', 'var(--on-accent2)', 'var(--on-accent3)', 'var(--ink)'];
      const ci = function (i) { return (i === n - 1 && i % 4 === 0) ? 2 : i % 4; };
      const grad = optsW.map(function (o, i) { return fills[ci(i)] + ' ' + (i * seg).toFixed(2) + 'deg ' + ((i + 1) * seg).toFixed(2) + 'deg'; }).join(',');
      const labels = optsW.map(function (o, i) {
        return '<span class="wl" style="transform:rotate(' + ((i + 0.5) * seg - 90).toFixed(2) + 'deg)"><span style="color:' + inks[ci(i)] + '">' + esc(o.short) + '</span></span>';
      }).join('');
      const blocked = s.mode === 'premios' && s.oncePerDay && wheelSpunToday(m.id);
      const done = w.result != null ? optsW[w.result] : null;
      return '<div class="wrap">' + sh(m) + (tx(s, 'text') ? '<p class="lead-p">' + esc(tx(s, 'text')) + '</p>' : '') +
        '<div class="wheel-box"><span class="pointer" aria-hidden="true"></span><div class="wheel" data-wheel="' + attr(m.id) + '" style="background:conic-gradient(' + grad + ');transform:rotate(' + w.rot + 'deg)">' + labels + '<span class="hub">' + logoHTML('sm') + '</span></div></div>' +
        '<div class="wheel-res" aria-live="polite">' + (done ? wheelResult(m, done) : '') + '</div>' +
        '<div class="btns center"><button class="btn pri" data-act="spin" data-mid="' + attr(m.id) + '"' + (blocked || w.spinning ? ' disabled' : '') + '>' +
        esc(blocked ? ui('spunToday') : (w.result != null ? ui('spinAgain') : ui('spin'))) + '</button></div></div>';
    },

    trivia: function (m) {
      const s = m.s, qs = (s.questions || []).filter(function (q) { return q && tx(q, 'q'); });
      if (!qs.length) return emptyNote('Agrega preguntas a la trivia.');
      const t = triviaState(m.id);
      let body;
      if (t.i >= qs.length) {
        const all = t.score === qs.length;
        body = '<div class="tq-end"><p class="tq-score">' + esc(ui('score', { s: t.score, t: qs.length })) + '</p>' + (all && tx(s, 'prize') ? '<p class="tq-prize">' + esc(tx(s, 'prize')) + '</p>' : '') +
          '<button class="btn pri" data-act="treset" data-mid="' + attr(m.id) + '">' + esc(ui('again')) + '</button></div>';
      } else {
        const q = qs[t.i], ans = t.picked, ok = +q.correct;
        const options = ['a1', 'a2', 'a3'].map(function (k, i) { return { a: tx(q, k), i: i + 1 }; }).filter(function (o) { return o.a; });
        body = '<p class="tq-n">' + esc(ui('qOf', { i: t.i + 1, t: qs.length })) + '</p><h4 class="tq-q">' + esc(tx(q, 'q')) + '</h4><div class="tq-opts">' +
          options.map(function (o) {
            let cls = '';
            if (ans != null) { if (o.i === ok) cls = 'ok'; else if (o.i === ans) cls = 'bad'; }
            return '<button class="tq-o ' + cls + '" data-act="tq" data-mid="' + attr(m.id) + '" data-a="' + o.i + '"' + (ans != null ? ' disabled' : '') + '>' + esc(o.a) + '</button>';
          }).join('') + '</div>' +
          (ans != null ? '<div class="tq-fb"><b>' + esc(ans === ok ? ui('correct') : ui('wrong')) + '</b>' + (tx(q, 'fact') ? ' ' + esc(tx(q, 'fact')) : '') + '</div>' +
            '<div><button class="btn pri" data-act="tnext" data-mid="' + attr(m.id) + '">' + esc(ui('next')) + '</button></div>' : '');
      }
      return '<div class="wrap">' + sh(m) + (tx(s, 'intro') && t.i === 0 && t.picked == null ? '<p class="lead-p">' + esc(tx(s, 'intro')) + '</p>' : '') + '<div class="card trivia">' + body + '</div></div>';
    },

    contacto: function (m) {
      const b = cfg.brand, links = [], wa = digits(b.whatsapp);
      links.push('<button class="cl" data-act="wa"><span class="cl-k">WhatsApp</span><span class="cl-v">' + esc(wa ? fmtPhone(b.whatsapp) : ui('writeUs')) + '</span></button>');
      if (b.phone) links.push('<a class="cl" href="tel:' + attr(String(b.phone).replace(/[^\d+]/g, '')) + '"><span class="cl-k">' + esc(ui('call')) + '</span><span class="cl-v">' + esc(b.phone) + '</span></a>');
      if (handle(b.instagram)) links.push('<a class="cl" href="https://instagram.com/' + attr(handle(b.instagram)) + '" target="_blank" rel="noopener"><span class="cl-k">Instagram</span><span class="cl-v">@' + esc(handle(b.instagram)) + '</span></a>');
      if (handle(b.facebook)) links.push('<a class="cl" href="https://facebook.com/' + attr(handle(b.facebook)) + '" target="_blank" rel="noopener"><span class="cl-k">Facebook</span><span class="cl-v">' + esc(handle(b.facebook)) + '</span></a>');
      if (handle(b.tiktok)) links.push('<a class="cl" href="https://www.tiktok.com/@' + attr(handle(b.tiktok)) + '" target="_blank" rel="noopener"><span class="cl-k">TikTok</span><span class="cl-v">@' + esc(handle(b.tiktok)) + '</span></a>');
      links.push('<button class="cl" data-act="share"><span class="cl-k">' + esc(ui('share')) + '</span><span class="cl-v">' + esc(ui('shareSub')) + '</span></button>');
      return '<div class="wrap">' + sh(m) + '<div class="contact">' + links.join('') + '</div></div>';
    },

    libre: function (m) {
      const s = m.s;
      if (!tx(s, 'title') && !tx(s, 'text')) return emptyNote('Escribe un título o un texto para este bloque.');
      let btn = '';
      const label = tx(s, 'btnLabel');
      if (label && s.btnTarget && s.btnTarget !== 'none') {
        if (s.btnTarget === 'url') { const u = safeUrl(s.url); if (u) btn = '<a class="btn pri" href="' + attr(u) + '" target="_blank" rel="noopener">' + esc(label) + '</a>'; }
        else if (s.btnTarget === 'whatsapp') btn = '<button class="btn pri" data-act="wa-msg" data-mid="' + attr(m.id) + '">' + esc(label) + '</button>';
        else if (ctaOk(s.btnTarget)) btn = '<button class="btn pri" data-act="cta" data-to="' + attr(s.btnTarget) + '">' + esc(label) + '</button>';
      }
      return '<div class="wrap"><div class="free ' + (s.style === 'destacado' ? 'hl' : '') + '">' + (tx(s, 'kicker') ? '<p class="sh-k">' + esc(tx(s, 'kicker')) + '</p>' : '') +
        (tx(s, 'title') ? '<h2 class="sh-t">' + esc(tx(s, 'title')) + '</h2>' : '') + paras(tx(s, 'text')) + (btn ? '<div class="btns">' + btn + '</div>' : '') + '</div></div>';
    }
  };

  function cartaBody(m) {
    const s = m.s, lay = s.layout || 'lista', ps = s.priceStyle || 'full', q = norm(state.q).trim();
    let html = '', count = 0;
    cfg.menu.categories.forEach(function (c) {
      const items = c.items.filter(function (it) {
        return it && (state.filter === 'all' || (it.tags || []).indexOf(state.filter) >= 0) && (!q || norm(tx(it, 'name') + ' ' + tx(it, 'desc')).indexOf(q) >= 0);
      });
      if (!items.length) return;
      count += items.length;
      html += '<div class="cat" id="c-' + attr(c.id) + '" data-cat="' + attr(c.id) + '"><div class="cat-h"><h3>' + (c.icon && lay !== 'lista' ? '<span class="ci" aria-hidden="true">' + esc(c.icon) + '</span>' : '') + esc(tx(c, 'name')) + '</h3>' +
        (tx(c, 'note') ? '<p>' + esc(tx(c, 'note')) + '</p>' : '') + '</div><div class="items">' + items.map(function (it, i) { return itemHTML(it, lay, ps, i); }).join('') + '</div></div>';
    });
    return count ? html : '<p class="empty">' + esc(ui('noResults')) + '</p>';
  }

  function itemHTML(it, lay, ps, i) {
    const off = it.on === false, name = tx(it, 'name'), desc = tx(it, 'desc');
    const tags = tagsHTML(it) + (off ? '<span class="tag sold">' + esc(ui('soldOut')) + '</span>' : '');
    const price = '<span class="price">' + esc(money(it.price, ps)) + '</span>';
    if (lay === 'lista') {
      return '<article class="it ' + (off ? 'off' : '') + '" data-act="item" data-id="' + attr(it.id) + '"><div class="it-l"><h4>' + esc(name) + '</h4><span class="lead" aria-hidden="true"></span>' + price + '</div>' +
        (desc ? '<p class="it-d">' + esc(desc) + '</p>' : '') + '<div class="it-f">' + tags + addBtn(it) + '</div></article>';
    }
    /* Compacta: solo nombre y precio en una línea; la descripción se ve al tocar el plato. */
    if (lay === 'compacta') {
      return '<article class="it ' + (off ? 'off' : '') + '" data-act="item" data-id="' + attr(it.id) + '"><div class="it-l"><h4>' + esc(name) + '</h4>' +
        (off ? '<span class="tag sold">' + esc(ui('soldOut')) + '</span>' : '') + '<span class="lead" aria-hidden="true"></span>' + price + addBtn(it) + '</div></article>';
    }
    if (lay === 'fotos') {
      return '<article class="it ' + (off ? 'off' : '') + '" data-act="item" data-id="' + attr(it.id) + '">' + mediaHTML(it, i) + '<div class="it-b"><div class="it-l"><h4>' + esc(name) + '</h4><span class="lead" aria-hidden="true"></span>' + price + '</div>' +
        (desc ? '<p class="it-d">' + esc(desc) + '</p>' : '') + (tags ? '<div class="it-tags">' + tags + '</div>' : '') + '</div>' + addBtn(it) + '</article>';
    }
    return '<article class="it ' + (off ? 'off' : '') + '" data-act="item" data-id="' + attr(it.id) + '">' + mediaHTML(it, i) + '<div class="it-b"><h4>' + esc(name) + '</h4>' +
      (desc && lay === 'tarjetas' ? '<p class="it-d">' + esc(desc) + '</p>' : '') + (tags ? '<div class="it-tags">' + tags + '</div>' : '') +
      '<div class="it-p">' + price + '</div></div>' + addBtn(it) + '</article>';
  }

  /* ---------- Ruleta, trivia, sellos ---------- */
  function wheelState(id) { if (!state.wheel[id]) state.wheel[id] = { rot: 0, spinning: false, result: null }; return state.wheel[id]; }
  function wheelOpts(m) {
    const s = m.s;
    const short = function (t) { t = String(t || ''); return t.length > 15 ? t.slice(0, 14).trim() + '…' : t; };
    if (s.mode === 'premios') {
      return (s.options || []).filter(function (o) { return o && tx(o, 'label'); }).slice(0, 10).map(function (o) { return { label: tx(o, 'label'), short: short(tx(o, 'label')) }; });
    }
    const day = nowLocal().iso;
    let items = allItems().filter(function (it) { return it.on !== false && (!s.category || (catOf(it.id) || {}).id === s.category); });
    items = items.slice().sort(function (a, b) { return hash(a.id + day) - hash(b.id + day); }).slice(0, 8);
    return items.map(function (it) { return { id: it.id, label: tx(it, 'name'), short: (it.emoji ? it.emoji + ' ' : '') + short(tx(it, 'name')) }; });
  }
  function wheelSpunToday(id) { return sget(key('wheel:' + id), '') === nowLocal().iso; }
  function wheelResult(m, o) {
    if (o.id) {
      const it = findItem(o.id);
      return '<div class="wres"><span class="small">' + esc(ui('got')) + '</span><b>' + esc(o.label) + '</b>' + (it ? '<span class="price">' + esc(money(it.price, priceStyle())) + '</span>' : '') +
        '<div class="btns center" style="margin-top:8px">' + (ordering() && it && it.on !== false ? '<button class="btn pri sm" data-act="add" data-id="' + attr(o.id) + '">' + esc(ui('add')) + '</button>' : '') +
        '<button class="btn ghost sm" data-act="item" data-id="' + attr(o.id) + '">' + esc(ui('seeDish')) + '</button></div></div>';
    }
    return '<div class="wres"><span class="small">' + esc(ui('got')) + '</span><b>' + esc(o.label) + '</b><span class="small">' + esc(ui('showStaff')) + '</span></div>';
  }
  function spin(mid) {
    const m = modById(mid); if (!m) return;
    const s = m.s, list = wheelOpts(m), w = wheelState(mid);
    if (w.spinning || list.length < 2) return;
    if (s.mode === 'premios' && s.oncePerDay && wheelSpunToday(mid)) return;
    const n = list.length, seg = 360 / n, pick = Math.floor(Math.random() * n);
    const target = 360 - (pick + 0.5) * seg;
    const cur = ((w.rot % 360) + 360) % 360;
    let delta = target - cur; if (delta < 0) delta += 360;
    w.rot = w.rot + 360 * 5 + delta + (Math.random() * 0.5 - 0.25) * seg;
    w.spinning = true; w.result = null;
    const reduce = motion() === 'off';
    const el = root.querySelector('[data-wheel="' + mid + '"]');
    const sec = root.querySelector('section[data-mid="' + mid + '"]');
    if (sec) { const b = sec.querySelector('[data-act="spin"]'); if (b) b.disabled = true; const r = sec.querySelector('.wheel-res'); if (r) r.innerHTML = ''; }
    if (el) { el.style.transition = reduce ? 'none' : 'transform 3.6s cubic-bezier(.17,.67,.12,1)'; el.style.transform = 'rotate(' + w.rot + 'deg)'; }
    later(function () {
      w.spinning = false; w.result = pick;
      if (s.mode === 'premios' && s.oncePerDay) sset(key('wheel:' + mid), nowLocal().iso);
      rerenderModule(mid); celebrate();
    }, reduce ? 60 : 3700);
  }
  function triviaState(id) { if (!state.trivia[id]) state.trivia[id] = { i: 0, score: 0, picked: null }; return state.trivia[id]; }
  function stampsGet(m) { const v = sget(key('stamps:' + m.id), null); return (v && typeof v.n === 'number') ? v : { n: 0, won: 0 }; }

  function openPin(mid, mode) {
    state.pin = ''; state.pinFor = { mid: mid, mode: mode };
    openSheet('<div class="sheet-h"><h3>' + esc(ui('pinTitle')) + '</h3><button class="x" data-act="close" aria-label="' + attr(ui('close')) + '">×</button></div>' +
      '<p class="small">' + esc(ui('pinHint')) + '</p><div class="pin-dots" data-pin>' + pinDots() + '</div><p class="form-err" data-err="pin" hidden></p><div class="keypad">' +
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map(function (k) {
        if (!k) return '<span></span>';
        return '<button type="button" data-act="' + (k === '⌫' ? 'pin-del' : 'pin') + '" data-k="' + k + '" aria-label="' + (k === '⌫' ? 'Borrar' : k) + '">' + k + '</button>';
      }).join('') + '</div>');
  }
  function pinLen() { const m = state.pinFor && modById(state.pinFor.mid); return Math.max(4, String((m && m.s.pin) || '0000').length); }
  function pinDots() { let s = ''; for (let i = 0; i < pinLen(); i++) s += '<i class="' + (i < state.pin.length ? 'f' : '') + '"></i>'; return s; }
  function pinKey(k) {
    if (!state.pinFor) return;
    if (k === 'del') state.pin = state.pin.slice(0, -1);
    else if (state.pin.length < pinLen()) state.pin += k;
    const dots = sheetC.querySelector('[data-pin]');
    if (dots) dots.innerHTML = pinDots();
    if (state.pin.length < pinLen()) return;
    const m = modById(state.pinFor.mid);
    const good = m && String(m.s.pin || '0000') === state.pin;
    if (!good) {
      const err = sheetC.querySelector('[data-err="pin"]');
      if (err) { err.textContent = ui('wrongPin'); err.hidden = false; }
      if (dots) { dots.classList.remove('shake'); void dots.offsetWidth; dots.classList.add('shake'); }
      state.pin = '';
      later(function () { const d = sheetC.querySelector('[data-pin]'); if (d) d.innerHTML = pinDots(); }, 380);
      return;
    }
    const st = stampsGet(m), goal = clamp(+m.s.goal || 8, 3, 20);
    if (state.pinFor.mode === 'redeem') { sset(key('stamps:' + m.id), { n: 0, won: (st.won || 0) + 1 }); state.justStamped = -1; toast(ui('redeemed')); }
    else { const n = Math.min(goal, st.n + 1); sset(key('stamps:' + m.id), { n: n, won: st.won || 0 }); state.justStamped = n - 1; toast(n >= goal ? ui('prize') : ui('stampOk')); if (n >= goal) celebrate(); }
    state.pinFor = null; state.pin = '';
    closeSheet(); rerenderModule(m.id);
    later(function () { state.justStamped = -1; }, 700);
  }

  /* ---------- Pedido ---------- */
  function orderModes() {
    const md = pedidoS().modes || {};
    const list = ['mesa', 'llevar', 'domicilio'].filter(function (x) { return md[x] !== false; });
    return list.length ? list : ['llevar'];
  }
  function cartLines() {
    return state.cart.map(function (l) {
      if (l.custom) return { k: l.k, name: l.name, nameEs: l.nameEs || l.name, price: +l.price || 0, qty: l.qty, note: '' };
      const it = findItem(l.id);
      if (!it) return null;
      return { k: l.k, id: l.id, name: tx(it, 'name'), nameEs: it.name, price: +it.price || 0, qty: l.qty, note: l.note || '' };
    }).filter(Boolean);
  }
  function cartCount() { return cartLines().reduce(function (a, l) { return a + l.qty; }, 0); }
  function cartSubtotal() { return cartLines().reduce(function (a, l) { return a + l.price * l.qty; }, 0); }
  function saveCart() { sset(key('cart'), state.cart); }
  function addToCart(id, qty, note) {
    const it = findItem(id); if (!it || it.on === false) return;
    const k = id + (note ? '|' + note : '');
    const line = state.cart.filter(function (l) { return l.k === k; })[0];
    if (line) line.qty = clamp(line.qty + qty, 1, 99);
    else state.cart.push({ k: k, id: id, qty: clamp(qty, 1, 99), note: note || '' });
    saveCart(); updateCartUI(true); toast(ui('added'));
  }
  function addCustom(k, name, nameEs, price) {
    const line = state.cart.filter(function (l) { return l.k === k; })[0];
    if (line) line.qty = clamp(line.qty + 1, 1, 99);
    else state.cart.push({ k: k, custom: true, name: name, nameEs: nameEs, price: price, qty: 1 });
    saveCart(); updateCartUI(true); toast(ui('added'));
  }
  function changeLine(k, d) {
    const line = state.cart.filter(function (l) { return l.k === k; })[0]; if (!line) return;
    line.qty += d;
    if (line.qty <= 0) state.cart = state.cart.filter(function (l) { return l !== line; });
    saveCart(); updateCartUI(false);
  }
  function fabHTML() {
    if (!ordering()) return '';
    const c = cartCount();
    return '<button class="fab" data-act="cart"' + (c ? '' : ' hidden') + '><span class="fab-n">' + c + '</span><span>' + esc(ui('viewOrder')) + '</span><span class="fab-t">' + esc(money(cartSubtotal(), 'full')) + '</span></button>';
  }
  function updateCartUI(bumpIt) {
    const old = root.querySelector('.fab');
    const holder = doc.createElement('div'); holder.innerHTML = fabHTML();
    const fresh = holder.firstChild;
    if (old && fresh) { old.parentNode.replaceChild(fresh, old); }
    else if (old && !fresh) old.parentNode.removeChild(old);
    else if (!old && fresh) root.appendChild(fresh);
    if (fresh && bumpIt) { fresh.classList.add('bump'); }
    Array.prototype.forEach.call(root.querySelectorAll('.add[data-id]'), function (b) {
      const q = b.querySelector('.q'), n = qtyOf(b.getAttribute('data-id'));
      if (q) { if (n) q.textContent = n; else q.parentNode.removeChild(q); }
      else if (n) b.insertAdjacentHTML('beforeend', '<b class="q">' + n + '</b>');
    });
  }
  function renderCart() {
    const s = pedidoS(), lines = cartLines(), o = state.order, modes = orderModes();
    if (modes.indexOf(o.mode) < 0) o.mode = modes[0];
    if (!lines.length) {
      openSheet('<div class="sheet-h"><h3>' + esc(ui('yourOrder')) + '</h3><button class="x" data-act="close" aria-label="' + attr(ui('close')) + '">×</button></div><p class="small">' + esc(ui('emptyCart')) + '</p>' +
        (firstMod('carta') ? '<button class="btn pri wide" data-act="cta" data-to="carta">' + esc(ui('cta_carta')) + '</button>' : ''));
      return;
    }
    const sub = cartSubtotal(), fee = o.mode === 'domicilio' ? (+s.deliveryFee || 0) : 0, pays = splitList(tx(s, 'payments'));
    openSheet('<div class="sheet-h"><h3>' + esc(ui('yourOrder')) + '</h3><button class="x" data-act="close" aria-label="' + attr(ui('close')) + '">×</button></div>' +
      '<ul class="lines">' + lines.map(function (l) {
        return '<li><div class="ln"><b>' + esc(l.name) + '</b>' + (l.note ? '<span class="small">' + esc(l.note) + '</span>' : '') + '</div>' +
          '<div class="stepper sm"><button type="button" data-act="ln" data-k="' + attr(l.k) + '" data-d="-1" aria-label="−">−</button><output>' + l.qty + '</output><button type="button" data-act="ln" data-k="' + attr(l.k) + '" data-d="1" aria-label="+">+</button></div>' +
          '<span class="price">' + esc(money(l.price * l.qty, 'full')) + '</span></li>';
      }).join('') + '</ul>' +
      '<div class="totals"><div><span>' + esc(ui('subtotal')) + '</span><span>' + esc(money(sub, 'full')) + '</span></div>' +
      (o.mode === 'domicilio' ? '<div><span>' + esc(ui('delivery')) + '</span><span>' + esc(fee ? money(fee, 'full') : ui('toAgree')) + '</span></div>' : '') +
      '<div class="tt"><span>' + esc(ui('total')) + '</span><span>' + esc(money(sub + fee, 'full')) + '</span></div></div>' +
      '<form class="form" data-form="order" novalidate>' +
      (modes.length > 1 ? '<div class="field"><span class="lbl">' + esc(ui('howWant')) + '</span><div class="seg">' + modes.map(function (x) {
        return '<button type="button" class="' + (o.mode === x ? 'on' : '') + '" data-act="mode" data-m="' + x + '">' + esc(ui('mode_' + x)) + '</button>';
      }).join('') + '</div></div>' : '') +
      (o.mode === 'mesa' ? '<label class="field"><span class="lbl">' + esc(ui('table')) + '</span><input class="inp" inputmode="numeric" data-bind="order.table" value="' + attr(o.table) + '"></label>' : '') +
      (o.mode === 'domicilio' ? '<label class="field"><span class="lbl">' + esc(ui('address')) + '</span><input class="inp" data-bind="order.address" value="' + attr(o.address) + '" autocomplete="street-address"></label>' +
        (tx(s, 'deliveryNote') ? '<p class="small">' + esc(tx(s, 'deliveryNote')) + '</p>' : '') : '') +
      '<label class="field"><span class="lbl">' + esc(ui('name')) + '</span><input class="inp" data-bind="order.name" value="' + attr(o.name) + '" autocomplete="name"></label>' +
      (pays.length ? '<div class="field"><span class="lbl">' + esc(ui('pay')) + '</span><div class="chips wrapc">' + pays.map(function (p) {
        return '<button type="button" class="chip ' + (o.pay === p ? 'on' : '') + '" data-act="pay" data-v="' + attr(p) + '">' + esc(p) + '</button>';
      }).join('') + '</div></div>' : '') +
      '<label class="field"><span class="lbl">' + esc(ui('notes')) + '</span><textarea class="inp" rows="2" data-bind="order.notes" placeholder="' + attr(ui('notesPh')) + '">' + esc(o.notes) + '</textarea></label>' +
      '<p class="form-err" data-err="order" hidden></p><button class="btn pri wide" type="submit">' + esc(ui('sendWa')) + '</button>' +
      '<button class="btn text wide" type="button" data-act="clear-cart">' + esc(ui('clear')) + '</button></form>');
  }
  function orderMsg() {
    const s = pedidoS(), b = cfg.brand, o = state.order, lines = cartLines(), sub = cartSubtotal();
    const fee = o.mode === 'domicilio' ? (+s.deliveryFee || 0) : 0;
    const E = function (k, v) { return uiL('es', k, v); };
    const L = [s.intro || E('orderIntro', { n: b.name || '' })];
    lines.forEach(function (l) { L.push('• ' + l.qty + ' × ' + l.nameEs + ' — ' + money(l.price * l.qty, 'full') + (l.note ? ' (' + l.note + ')' : '')); });
    L.push('');
    L.push(E('subtotal') + ': ' + money(sub, 'full'));
    if (o.mode === 'domicilio') L.push(E('delivery') + ': ' + (fee ? money(fee, 'full') : E('toAgree')));
    L.push(E('total') + ': ' + money(sub + fee, 'full'));
    L.push('');
    L.push(E('modeLbl') + ': ' + E('mode_' + o.mode) + (o.mode === 'mesa' && o.table ? ' ' + o.table : ''));
    if (o.name) L.push(E('name') + ': ' + o.name);
    if (o.mode === 'domicilio' && o.address) L.push(E('address') + ': ' + o.address);
    if (o.pay) L.push(E('pay') + ': ' + o.pay);
    if (o.notes) L.push(E('notes') + ': ' + o.notes);
    if (lang() === 'en') L.push(E('guestEn'));
    return L.join('\n');
  }
  function submitOrder(form) {
    const s = pedidoS(), o = state.order, err = form.querySelector('[data-err="order"]');
    let msg = '';
    if (o.mode === 'mesa' && !String(o.table).trim()) msg = ui('errTable');
    else if (o.mode !== 'mesa' && !String(o.name).trim()) msg = ui('errName');
    else if (o.mode === 'domicilio' && !String(o.address).trim()) msg = ui('errAddress');
    else if (o.mode === 'domicilio' && +s.minOrder && cartSubtotal() < +s.minOrder) msg = ui('errMin', { v: money(s.minOrder, 'full') });
    if (msg) { if (err) { err.textContent = msg; err.hidden = false; } return; }
    openWa(orderMsg());
  }
  function resMsg() {
    const r = state.res, b = cfg.brand, E = function (k, v) { return uiL('es', k, v); };
    const L = [E('resIntro', { n: b.name || '' })];
    L.push('• ' + E('date') + ': ' + fmtDate(r.date, 'es'));
    L.push('• ' + E('time') + ': ' + fmtTimeL('es', r.time));
    L.push('• ' + E('people') + ': ' + r.people);
    if (r.occ) L.push('• ' + E('occasion') + ': ' + r.occ);
    L.push('• ' + E('resFor') + ': ' + r.name);
    if (r.notes) L.push('• ' + E('notes') + ': ' + r.notes);
    if (lang() === 'en') L.push(E('guestEn'));
    return L.join('\n');
  }
  function submitRes(form) {
    const r = state.res, err = form.querySelector('[data-err="res"]');
    let msg = '';
    if (!r.date) msg = ui('errDate'); else if (!r.time) msg = ui('errTime'); else if (!String(r.name).trim()) msg = ui('errName');
    if (msg) { if (err) { err.textContent = msg; err.hidden = false; } return; }
    if (err) err.hidden = true;
    openWa(resMsg());
  }
  function openWa(text) {
    const num = digits(cfg.brand.whatsapp);
    const href = num.length >= 10 ? 'https://wa.me/' + num + '?text=' + encodeURIComponent(text) : '';
    openSheet('<div class="sheet-h"><h3>' + esc(ui('waTitle')) + '</h3><button class="x" data-act="close" aria-label="' + attr(ui('close')) + '">×</button></div>' +
      '<pre class="wa-msg">' + esc(text) + '</pre>' +
      (href ? '<a class="btn pri wide" href="' + attr(href) + '" target="_blank" rel="noopener">' + esc(ui('waOpen')) + '</a>' : '<p class="note">' + esc(PREVIEW ? ui('waMissingPreview') : ui('waMissing')) + '</p>') +
      '<button class="btn ghost wide" data-act="copy" data-copy="' + attr(text) + '">' + esc(ui('waCopy')) + '</button>');
  }

  /* ---------- Hojas, avisos, efectos ---------- */
  function openSheet(html) {
    if (!sheetC) return;
    sheetC.innerHTML = html;
    root.classList.add('sheet-open');
    sheetEl.setAttribute('aria-hidden', 'false');
    sheetEl.scrollTop = 0;
  }
  function closeSheet() {
    if (!root) return;
    root.classList.remove('sheet-open');
    if (sheetEl) sheetEl.setAttribute('aria-hidden', 'true');
    state.pinFor = null; state.itemSheet = null;
  }
  let toastT = null;
  function toast(t) {
    if (!toastEl) return;
    toastEl.textContent = t; toastEl.classList.add('show');
    if (toastT) win.clearTimeout(toastT);
    toastT = later(function () { toastEl.classList.remove('show'); }, 2200);
  }
  function celebrate() {
    if (motion() !== 'vivo') return;
    const layer = doc.createElement('div'); layer.className = 'confetti'; layer.setAttribute('aria-hidden', 'true');
    const colors = ['var(--accent)', 'var(--accent2)', 'var(--accent3)', 'var(--ink)'];
    let h = '';
    for (let i = 0; i < 28; i++) h += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;background:' + colors[i % 4] + ';--dx:' + Math.round(Math.random() * 140 - 70) + 'px;--rot:' + Math.round(Math.random() * 720 - 360) + 'deg;animation-delay:' + (Math.random() * 0.25).toFixed(2) + 's"></i>';
    layer.innerHTML = h; root.appendChild(layer);
    later(function () { if (layer.parentNode) layer.parentNode.removeChild(layer); }, 1800);
  }
  function copyText(t) {
    const fallback = function () {
      const ta = doc.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      doc.body.appendChild(ta); ta.select(); let ok = false;
      try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
      doc.body.removeChild(ta); toast(ok ? ui('copied') : ui('copyManual'));
    };
    try {
      if (win.navigator.clipboard && win.navigator.clipboard.writeText) { win.navigator.clipboard.writeText(t).then(function () { toast(ui('copied')); }, fallback); return; }
    } catch (e) { /* usa el plan B */ }
    fallback();
  }
  function share() {
    if (PREVIEW) { toast(ui('sharePreview')); return; }
    const data = { title: cfg.brand.name || '', text: tx(cfg.brand, 'tagline') || '', url: win.location.href };
    if (win.navigator.share) { win.navigator.share(data).catch(function () { /* cancelado */ }); return; }
    copyText(win.location.href);
  }
  function scrollToEl(el, extra) {
    if (!el) return;
    const top = el.getBoundingClientRect().top + (win.pageYOffset || 0) - (extra || 0);
    try { win.scrollTo({ top: Math.max(0, top), behavior: motion() === 'off' ? 'auto' : 'smooth' }); } catch (e) { try { win.scrollTo(0, top); } catch (e2) { /* nada */ } }
  }
  function scrollToId(id, extra) { scrollToEl(doc.getElementById(id), extra == null ? 62 : extra); }
  function bump(el) { if (!el) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }

  function openNav() {
    const items = mods().filter(function (m) { return NAVABLE[m.type] && root.querySelector('section[data-mid="' + m.id + '"]'); });
    openSheet('<div class="sheet-h"><h3>' + esc(cfg.brand.name || ui('menu')) + '</h3><button class="x" data-act="close" aria-label="' + attr(ui('close')) + '">×</button></div><nav class="navlist">' +
      items.map(function (m) { return '<button class="navi" data-act="goto" data-to="' + attr(anchor(m)) + '">' + esc(modTitle(m)) + '</button>'; }).join('') + '</nav>');
  }
  function openItem(id) {
    if (!findItem(id)) return;
    state.itemSheet = { id: id, qty: 1, note: '' };
    renderItemSheet();
  }
  function renderItemSheet() {
    const st = state.itemSheet; if (!st) return;
    const it = findItem(st.id); if (!it) return;
    const can = ordering() && it.on !== false;
    openSheet('<div class="sheet-h"><span></span><button class="x" data-act="close" aria-label="' + attr(ui('close')) + '">×</button></div><div class="isheet">' + mediaHTML(it, 0) +
      '<h3>' + esc(tx(it, 'name')) + '</h3>' + (tx(it, 'desc') ? '<p>' + esc(tx(it, 'desc')) + '</p>' : '') +
      (tagsHTML(it) ? '<div class="it-tags">' + tagsHTML(it) + '</div>' : '') + '<p class="price big">' + esc(money(it.price, priceStyle())) + '</p></div>' +
      (can ? '<div class="field"><span class="lbl">' + esc(ui('qty')) + '</span><div class="stepper"><button type="button" data-act="iq" data-d="-1" aria-label="−">−</button><output>' + st.qty + '</output><button type="button" data-act="iq" data-d="1" aria-label="+">+</button></div></div>' +
        '<label class="field"><span class="lbl">' + esc(ui('notes')) + '</span><textarea class="inp" rows="2" data-bind="itemSheet.note" placeholder="' + attr(ui('notesPh')) + '">' + esc(st.note) + '</textarea></label>' +
        '<button class="btn pri wide" data-act="sheet-add">' + esc(ui('add')) + ' · ' + esc(money((+it.price || 0) * st.qty, 'full')) + '</button>' : ''));
  }

  /* ---------- Render ---------- */
  function fontsHref() {
    const f = cfg.theme.fonts, fams = [];
    [f.display, f.body].forEach(function (n) { n = String(n || '').replace(/[^\w ]/g, '').trim(); if (n && fams.indexOf(n) < 0) fams.push(n); });
    if (!fams.length) return '';
    return 'https://fonts.googleapis.com/css2?' + fams.map(function (n) { return 'family=' + n.replace(/ /g, '+') + ((FONTS[n] && FONTS[n][0]) || ''); }).join('&') + '&display=swap';
  }
  function fontStack(n) { n = String(n || '').replace(/[^\w ]/g, '').trim(); return n ? '"' + n + '", ' + ((FONTS[n] && FONTS[n][1]) || 'system-ui, sans-serif') : 'system-ui, sans-serif'; }
  function hexOk(v, d) { return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(v || '')) ? v : d; }
  function lum(hex) {
    let h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    if (h.length !== 6) return 0.5;
    const ch = [0, 2, 4].map(function (i) { const v = parseInt(h.slice(i, i + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }
  function onColor(hex) { const L = lum(hex); return (L + 0.05) / 0.05 > 1.05 / (L + 0.05) ? '#141414' : '#ffffff'; }
  function tokensCSS() {
    const c = cfg.theme.colors, f = cfg.theme.fonts, r = clamp(+cfg.theme.radius || 0, 0, 32);
    const acc = hexOk(c.accent, '#c8a46a'), a2 = hexOk(c.accent2, '#7fa088'), a3 = hexOk(c.accent3, '#8e6f4e');
    return ':root{--bg:' + hexOk(c.bg, '#111412') + ';--surface:' + hexOk(c.surface, '#191d1a') + ';--ink:' + hexOk(c.ink, '#ede7da') + ';--muted:' + hexOk(c.muted, '#a3a89d') +
      ';--accent:' + acc + ';--accent2:' + a2 + ';--accent3:' + a3 + ';--on-accent:' + onColor(acc) + ';--on-accent2:' + onColor(a2) + ';--on-accent3:' + onColor(a3) +
      ';--r:' + r + 'px;--fd:' + fontStack(f.display) + ';--fb:' + fontStack(f.body) + ';color-scheme:' + (lum(hexOk(c.bg, '#111412')) < 0.3 ? 'dark' : 'light') + '}';
  }
  /* Texturas que llevan el color de la paleta dentro del SVG del fondo. */
  function texCSS() {
    const t = cfg.theme.texture, c = cfg.theme.colors;
    const col = function (hex, d) { return '%23' + hexOk(hex, d).slice(1); };
    if (t === 'hojas') return 'html[data-tex="hojas"] body{background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'132\' height=\'132\' viewBox=\'0 0 120 120\'%3E%3Cg fill=\'' + col(c.accent2, '#7fa088') + '\' fill-opacity=\'.17\'%3E' + LEAF_PATHS + '%3C/g%3E%3C/svg%3E")}';
    if (t === 'ondas') return 'html[data-tex="ondas"] body{background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'90\' height=\'24\'%3E%3Cpath d=\'M0 12Q22.5 2 45 12T90 12\' fill=\'none\' stroke=\'' + col(c.accent, '#c8a46a') + '\' stroke-opacity=\'.16\' stroke-width=\'1.6\'/%3E%3C/svg%3E")}';
    return '';
  }
  function applyHead() {
    let st = doc.getElementById('bk-css');
    if (!st) { st = doc.createElement('style'); st.id = 'bk-css'; doc.head.appendChild(st); }
    let css = CSS_BASE + (CSS_SKIN[skin] || '') + CSS_OPT + tokensCSS() + texCSS();
    /* Letra grande: todos los tamaños de texto en px suben un 15 %, en cualquier estética. */
    if (cfg.theme.textSize === 'grande') css = css.replace(/font-size:(\d+(?:\.\d+)?)px/g, function (m0, n) { return 'font-size:' + Math.round(n * 11.5) / 10 + 'px'; });
    if (st.textContent !== css) st.textContent = css;
    const href = fontsHref();
    let ln = doc.getElementById('bk-fonts');
    if (href) {
      if (!ln) { ln = doc.createElement('link'); ln.id = 'bk-fonts'; ln.rel = 'stylesheet'; doc.head.appendChild(ln); }
      if (ln.getAttribute('href') !== href) ln.setAttribute('href', href);
    }
    let tc = doc.querySelector('meta[name="theme-color"]');
    if (!tc) { tc = doc.createElement('meta'); tc.setAttribute('name', 'theme-color'); doc.head.appendChild(tc); }
    tc.setAttribute('content', hexOk(cfg.theme.colors.bg, '#111412'));
    doc.documentElement.setAttribute('lang', lang());
    doc.documentElement.setAttribute('data-tex', cfg.theme.texture || 'none');
    if (!PREVIEW && cfg.brand.name) doc.title = cfg.brand.name + (tx(cfg.brand, 'tagline') ? ' · ' + tx(cfg.brand, 'tagline') : '');
  }
  function renderTop() {
    const st = statusInfo();
    return '<header class="top"><button class="brand-mini" data-act="top" aria-label="' + attr(cfg.brand.name || '') + '">' + logoHTML('sm') + '<b>' + esc(cfg.brand.name || '') + '</b></button><div class="top-r">' +
      (st ? '<span class="status ' + (st.open ? 'on' : 'off') + '"><i></i>' + esc(st.open ? ui('open') : ui('closed')) + '</span>' : '') +
      (bilingual() ? '<div class="lang" role="group" aria-label="Idioma / Language"><button data-act="lang" data-l="es" class="' + (lang() === 'es' ? 'on' : '') + '">ES</button><button data-act="lang" data-l="en" class="' + (lang() === 'en' ? 'on' : '') + '">EN</button></div>' : '') +
      '<button class="menu-btn" data-act="nav" aria-label="' + attr(ui('menu')) + '"><span></span><span></span><span></span></button></div></header>';
  }
  function renderFoot() {
    const b = cfg.brand;
    return '<footer class="foot wrap"><p class="foot-n">' + esc(b.name || '') + '</p>' + ((b.address || b.city) ? '<p>' + esc([b.address, b.city].filter(Boolean).join(' · ')) + '</p>' : '') +
      (cfg.meta.credit !== false ? '<p class="credit">' + esc(ui('credit')) + '</p>' : '') + '</footer>';
  }
  function sectionHTML(m) {
    let inner = '';
    try { inner = RENDER[m.type](m) || ''; } catch (e) { inner = PREVIEW ? '<div class="wrap"><p class="pv-empty">No se pudo mostrar el módulo «' + esc(m.type) + '»: ' + esc(e && e.message) + '</p></div>' : ''; }
    if (!inner) return '';
    return '<section class="m m-' + attr(m.type) + '" id="' + attr(anchor(m)) + '" data-mid="' + attr(m.id) + '">' + inner + '</section>';
  }
  function renderAll(keepScroll) {
    const y = win.pageYOffset || 0;
    skin = CSS_SKIN[cfg.theme.skin] ? cfg.theme.skin : 'elegante';
    applyHead();
    const wasOpen = root.classList.contains('sheet-open');
    root.setAttribute('data-skin', skin);
    root.setAttribute('data-motion', motion());
    const bt = cfg.theme.buttons;
    if (bt === 'redondo' || bt === 'cuadrado' || bt === 'contorno') root.setAttribute('data-btn', bt); else root.removeAttribute('data-btn');
    root.innerHTML = renderTop() + '<main>' + mods().map(sectionHTML).join('') + '</main>' + renderFoot() + fabHTML() +
      '<div class="sheet-bg" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true" aria-hidden="true"><div class="sheet-c"></div></div><div class="toast" role="status" aria-live="polite"></div>';
    sheetEl = root.querySelector('.sheet'); sheetC = root.querySelector('.sheet-c'); toastEl = root.querySelector('.toast');
    watchPhotos(root);
    if (wasOpen) root.classList.remove('sheet-open');
    if (firstRender) {
      firstRender = false;
      if (motion() !== 'off') { root.classList.add('intro'); later(function () { root.classList.remove('intro'); }, 1800); }
    }
    setupSpy();
    if (keepScroll) { try { win.scrollTo(0, y); } catch (e) { /* jsdom */ } }
  }
  function rerenderModule(mid) {
    const m = modById(mid), sec = root.querySelector('section[data-mid="' + mid + '"]');
    if (!m || !sec) return;
    const holder = doc.createElement('div'); holder.innerHTML = sectionHTML(m);
    const fresh = holder.firstChild;
    if (fresh) { sec.parentNode.replaceChild(fresh, sec); watchPhotos(fresh); } else sec.parentNode.removeChild(sec);
  }
  /* Si la foto de portada no carga, la portada vuelve a su forma sin foto. */
  function watchPhotos(scope) {
    Array.prototype.forEach.call(scope.querySelectorAll('.hero-ph img'), function (im) {
      im.addEventListener('error', function () { const box = im.closest('.hero-box'); if (box) box.classList.add('ph-fail'); });
    });
  }
  function refreshCarta() {
    const m = firstMod('carta'); if (!m) return;
    const body = root.querySelector('[data-carta-body]');
    if (body) body.innerHTML = cartaBody(m);
    Array.prototype.forEach.call(root.querySelectorAll('.filters .chip'), function (ch) { ch.classList.toggle('on', ch.getAttribute('data-tag') === state.filter); });
    setupSpy();
  }
  function refreshStatus() {
    const top = root.querySelector('.top');
    if (top) { const h = doc.createElement('div'); h.innerHTML = renderTop(); top.parentNode.replaceChild(h.firstChild, top); }
    mods().forEach(function (m) { if (m.type === 'horario' || m.type === 'hero' || m.type === 'promos' || m.type === 'menudia') rerenderModule(m.id); });
  }
  function setupSpy() {
    if (spy) { spy.disconnect(); spy = null; }
    if (!win.IntersectionObserver) return;
    const chips = root.querySelectorAll('.cat-tabs .chip');
    if (!chips.length) return;
    spy = new win.IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        const id = en.target.getAttribute('data-cat');
        Array.prototype.forEach.call(chips, function (c) {
          const on = c.getAttribute('data-c') === id;
          c.classList.toggle('on', on);
          if (on && c.parentNode && c.parentNode.scrollTo) { try { c.parentNode.scrollTo({ left: c.offsetLeft - 20, behavior: 'smooth' }); } catch (e) { /* nada */ } }
        });
      });
    }, { rootMargin: '-130px 0px -55% 0px' });
    Array.prototype.forEach.call(root.querySelectorAll('.cat'), function (c) { spy.observe(c); });
  }

  /* ---------- Eventos ---------- */
  function setBind(path, v) {
    const p = path.split('.');
    let o = state;
    for (let i = 0; i < p.length - 1; i++) { if (!o[p[i]]) return; o = o[p[i]]; }
    o[p[p.length - 1]] = v;
  }
  function sectionOf(el) { const s = el.closest('section[data-mid]'); return s ? s.getAttribute('data-mid') : null; }
  function onClick(e) {
    const el = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
    if (!el || !root.contains(el)) return;
    const act = el.getAttribute('data-act'), d = el.dataset;
    switch (act) {
      case 'top': try { win.scrollTo({ top: 0, behavior: motion() === 'off' ? 'auto' : 'smooth' }); } catch (x) { /* nada */ } break;
      case 'nav': openNav(); break;
      case 'goto': closeSheet(); scrollToId(d.to); break;
      case 'lang': state.lang = d.l === 'en' ? 'en' : 'es'; sset(key('lang'), state.lang); renderAll(true); break;
      case 'cat': scrollToId('c-' + d.c, 118); break;
      case 'filter': state.filter = d.tag || 'all'; refreshCarta(); break;
      case 'item': openItem(d.id); break;
      case 'add': addToCart(d.id, 1, ''); bump(el); break;
      case 'iq': if (state.itemSheet) { state.itemSheet.qty = clamp(state.itemSheet.qty + (+d.d), 1, 50); renderItemSheet(); } break;
      case 'sheet-add': if (state.itemSheet) { const st = state.itemSheet; closeSheet(); addToCart(st.id, st.qty, String(st.note || '').trim()); } break;
      case 'cart': renderCart(); break;
      case 'ln': changeLine(d.k, +d.d); renderCart(); break;
      case 'mode': state.order.mode = d.m; renderCart(); break;
      case 'pay': state.order.pay = state.order.pay === d.v ? '' : d.v; renderCart(); break;
      case 'clear-cart': state.cart = []; saveCart(); updateCartUI(false); closeSheet(); break;
      case 'cta': cta(d.to); break;
      case 'res-slot': state.res.time = d.v; { const mid = sectionOf(el); if (mid) rerenderModule(mid); } break;
      case 'res-occ': state.res.occ = state.res.occ === d.v ? '' : d.v; { const mid = sectionOf(el); if (mid) rerenderModule(mid); } break;
      case 'res-ppl': {
        const mid = sectionOf(el), m = mid && modById(mid), max = clamp(+((m && m.s.maxPeople) || 10), 1, 50);
        state.res.people = clamp(state.res.people + (+d.d), 1, max);
        const out = el.parentNode.querySelector('output'); if (out) out.textContent = state.res.people;
        break;
      }
      case 'stamp': openPin(d.mid, d.mode); break;
      case 'pin': pinKey(d.k); break;
      case 'pin-del': pinKey('del'); break;
      case 'spin': spin(d.mid); break;
      case 'tq': {
        const t = triviaState(d.mid), m = modById(d.mid); if (!m || t.picked != null) break;
        const qs = (m.s.questions || []).filter(function (q) { return q && tx(q, 'q'); });
        const q = qs[t.i]; if (!q) break;
        t.picked = +d.a; if (t.picked === +q.correct) t.score += 1;
        rerenderModule(d.mid);
        if (t.picked === +q.correct) celebrate();
        break;
      }
      case 'tnext': { const t = triviaState(d.mid); t.i += 1; t.picked = null; rerenderModule(d.mid); break; }
      case 'treset': state.trivia[d.mid] = { i: 0, score: 0, picked: null }; rerenderModule(d.mid); break;
      case 'copy': copyText(d.copy || ''); break;
      case 'rsvp': {
        const m = modById(d.mid), ev = m && (m.s.items || [])[+d.i]; if (!ev) break;
        openWa(uiL('es', 'rsvpMsg', { n: cfg.brand.name || '', e: ev.title || '', w: ev.when || '' }) + (lang() === 'en' ? '\n' + uiL('es', 'guestEn') : ''));
        break;
      }
      case 'menudia-add': {
        const m = modById(d.mid); if (!m) break;
        addCustom('menudia:' + m.id, tx(m.s, 'title') || ui('t_menudia'), m.s.title || uiL('es', 't_menudia'), +m.s.price || 0);
        break;
      }
      case 'wa': openWa(uiL('es', 'greet', { n: cfg.brand.name || '' }) + ' '); break;
      case 'wa-msg': { const m = modById(d.mid); openWa((m && m.s.waText) || uiL('es', 'greet', { n: cfg.brand.name || '' })); break; }
      case 'review-wa': openWa(uiL('es', 'reviewMsg', { n: cfg.brand.name || '' }) + '\n'); break;
      case 'share': share(); break;
      case 'close': closeSheet(); break;
      default: break;
    }
  }
  function cta(to) {
    if (to === 'whatsapp') { openWa(uiL('es', 'greet', { n: cfg.brand.name || '' }) + ' '); return; }
    if (to === 'pedido') { if (cartCount()) { renderCart(); return; } toast(ui('pickFirst')); to = 'carta'; }
    const m = firstMod(CTA_MOD[to] || to);
    if (m) { closeSheet(); scrollToId(anchor(m)); }
  }
  function onInput(e) {
    const t = e.target; if (!t || !t.getAttribute) return;
    const b = t.getAttribute('data-bind');
    if (b) setBind(b, t.value);
    if (t.getAttribute('data-in') === 'q') { state.q = t.value; refreshCarta(); }
  }
  function onSubmit(e) {
    const f = e.target, kind = f && f.getAttribute && f.getAttribute('data-form');
    if (!kind) return;
    e.preventDefault();
    if (kind === 'res') submitRes(f);
    if (kind === 'order') submitOrder(f);
  }
  function onKey(e) { if (e.key === 'Escape' && root.classList.contains('sheet-open')) closeSheet(); }

  /* ---------- Arranque ---------- */
  function boot() {
    root = doc.createElement('div');
    root.className = 'app';
    doc.body.appendChild(root);
    const saved = sget(key('lang'), null);
    const nav = (win.navigator && (win.navigator.language || '')) || '';
    state.lang = saved || (!PREVIEW && /^en/i.test(nav) ? 'en' : 'es');
    const cart = sget(key('cart'), []);
    state.cart = Array.isArray(cart) ? cart.filter(function (l) { return l && l.k && l.qty > 0; }) : [];
    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    root.addEventListener('submit', onSubmit);
    doc.addEventListener('keydown', onKey);
    renderAll(false);
    timers.push(win.setInterval(refreshStatus, 60000));
  }
  boot();

  return {
    update: function (next) { cfg = normalize(next); renderAll(true); },
    reset: function (next) {
      cfg = normalize(next);
      const fresh = freshState();
      Object.keys(fresh).forEach(function (k) { state[k] = fresh[k]; });
      state.lang = sget(key('lang'), null) || 'es';
      const cart = sget(key('cart'), []);
      state.cart = Array.isArray(cart) ? cart : [];
      firstRender = true; closeSheet();
      try { win.scrollTo(0, 0); } catch (e) { /* jsdom */ }
      renderAll(false);
    },
    focus: function (mid) {
      const sec = root.querySelector('section[data-mid="' + mid + '"]');
      if (!sec) return false;
      scrollToEl(sec, 58);
      sec.classList.add('pv-focus');
      later(function () { sec.classList.remove('pv-focus'); }, 1200);
      return true;
    },
    setLang: function (l) { state.lang = l === 'en' ? 'en' : 'es'; renderAll(true); },
    destroy: function () {
      timers.forEach(function (t) { win.clearTimeout(t); win.clearInterval(t); });
      if (spy) spy.disconnect();
      root.removeEventListener('click', onClick); root.removeEventListener('input', onInput); root.removeEventListener('submit', onSubmit);
      doc.removeEventListener('keydown', onKey);
      if (root.parentNode) root.parentNode.removeChild(root);
    },
    _state: state,
    _msg: { order: orderMsg, res: resMsg },
    _status: statusInfo
  };
}
