# Break Studio

Estudio para diseñar apps de menú por módulos para cafeterías y restaurantes. Trae catorce estéticas, cada una con al menos una app de ejemplo:

- **Elegante**: Araucaria, cocina de montaña (bilingüe).
- **Animado**: Antojo, arepas y malteadas.
- **Cultural**: Casa Zócalo, cocina típica.
- **Natural**: La Espiga (panadería) y Los Alisos (truchas camino a los termales, bilingüe).
- **Nocturna**: La Esquina, comida rápida hasta tarde.
- **Minimalista**: Neblina, café de especialidad.
- **Pizarra**: Café del Parque, café de barrio con menú del día.
- **Rústico**: Asadero El Tronco, chorizo santarrosano a la brasa.
- **Termal**: Agua Tibia, restaurante de hotel termal (bilingüe).
- **Retro**: Fuente de Soda Polar, helados y malteadas desde 1968.
- **Tropical**: Mango Biche, jugos y açaí.
- **Bistró**: Pastelería La Rosa, pastelería con almuerzo ejecutivo.
- **Industrial**: La Fábrica, cervecería artesanal.
- **Editorial**: Mesa Larga, cocina de autor y brunch.

```bash
npm install
npm test          # compila y corre las pruebas
npm run demos     # genera las apps de ejemplo en dist/
```

En la pestaña Estilo se personaliza todo el diseño: estética, colores (con color por elemento, fondo y modo oscuro automático), tipografías, formas, carta, estructura (navegación, encabezado, secciones y pie), imágenes e íconos, movimiento, estilos guardados y CSS propio. El modo sencillo muestra lo principal; «Opciones avanzadas» lo muestra todo, por secciones.

Abre `dist/break-studio.html` en el navegador para usar el estudio (sin claude.ai guarda en el navegador y no descarga archivos).

Detalles de arquitectura y convenciones en `CLAUDE.md`.
