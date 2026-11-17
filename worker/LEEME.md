# Servidor del panel del local (Cloudflare Worker)

Un solo servidor atiende a todos los locales:

- **Contenido:** guarda lo que cambia cada dueño desde su celular (carta, precios, promos, menú del día, avisos, horario, festivos, agenda, galería y reseñas) y sus fotos.
- **Páginas:** sirve el panel del dueño (`/panel/<local>`) y tu página de administración (`/admin`).
- **Apps:** las apps publicadas en Cloudflare Pages le piden su contenido al abrir. Sin señal usan la última copia que guardaron.

## Lo que necesitas

- **Cloudflare:** una cuenta gratis.
- **R2 (fotos):** se activa una vez en el panel de Cloudflare y pide registrar una tarjeta, aunque no cobra dentro de la capa gratis (10 GB).
- **Node 18 o más nuevo**, y este repositorio en tu computador.

## 1. Entrar a Cloudflare desde la terminal

Desde la carpeta del repositorio:

```bash
cd worker
```

```bash
npx wrangler login
```

## 2. Crear el almacenamiento

**KV**, donde va el contenido de cada local:

```bash
npx wrangler kv namespace create DATA
```

Copia el `id` que muestra y pégalo en `wrangler.toml`, en `id = "PEGAR_AQUI_EL_ID_DEL_KV"`. Si wrangler ofrece agregarlo solo, revisa que el nombre (binding) quede como `DATA`.

**R2**, donde van las fotos. Primero activa R2 en el panel de Cloudflare (R2 Object Storage); después:

```bash
npx wrangler r2 bucket create break-fotos
```

## 3. Publicar el servidor

```bash
npx wrangler deploy
```

Este comando compila el panel y la administración (`build.js` de la raíz) y los sube. Al terminar muestra la dirección del servidor, algo como `https://break-panel.tu-cuenta.workers.dev`. Hasta el paso 4 esa dirección responde «Falta configurar el servidor»: es normal.

## 4. Guardar los secretos

Genera una clave larga al azar para cada secreto (cada vez que lo corres muestra una distinta):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```bash
npx wrangler secret put SESSION_SECRET
```

```bash
npx wrangler secret put ADMIN_TOKEN
```

- **`SESSION_SECRET`:** firma las sesiones de los dueños y cifra sus PIN. Si la cambias, todos los PIN dejan de servir y hay que volver a ponerlos desde la administración.
- **`ADMIN_TOKEN`:** tu clave para entrar a `/admin`. Guárdala en un lugar seguro y no la compartas con los dueños.

Para comprobar que quedó bien, abre la dirección del servidor: debe decir «Break · servidor del panel del local». Luego abre `/admin`: debe pedir la clave.

## 5. Conectar un local

1. **Conectar la app:** en Break Studio, abre la app del local y ve a **Publicar › Panel del local**. Pega la dirección del servidor (sin nada después de `.workers.dev`) y un nombre corto, por ejemplo `los-alisos`.
2. **Publicar la app:** descarga el **.zip** y publícalo en Cloudflare Pages, como siempre. Esa app ya sabe dónde pedir su contenido.
3. **Descargar la configuración:** descarga el **.json**, en Publicar › Configuración .json.
4. **Crear el local:**
   1. Abre `https://break-panel.tu-cuenta.workers.dev/admin` y escribe tu `ADMIN_TOKEN`.
   2. Elige el .json y toca «Generar uno» para el PIN.
   3. Toca «Crear el local». Las fotos se suben solas.
5. **Entregar el acceso:** dale al dueño el enlace de su panel y su PIN. «Copiar enlace y PIN» los deja listos para mandarlos por WhatsApp.

## Día a día

- **Cambiar el diseño:**
  1. Edita la app en el estudio y vuelve a publicar el .zip.
  2. En `/admin`, sube el .json nuevo y toca «Actualizar el local».

  La carta y lo que cambió el dueño no se tocan. Solo se reemplazan si marcas «Reemplazar también el contenido».
- **Cambiar el PIN:** en `/admin`, «Locales» y luego «Cambiar PIN». Se cierran las sesiones abiertas de ese panel.
- **Respaldos:** en `/admin`, «Descargar respaldo» baja un .json con la app y el contenido actual del dueño. Se importa en el estudio (Publicar › Importar .json) para seguir diseñando con lo último, y también se puede volver a subir en `/admin`.
- **Deshacer:** el dueño tiene «Deshacer último guardado». El servidor guarda sus 10 versiones anteriores.
- **Fotos:**
  - Cada foto se guarda con un nombre sacado de su contenido, así que la misma foto nunca se guarda dos veces.
  - Las viejas no se borran, porque «Deshacer» puede necesitarlas.

## Dominio propio (opcional)

1. En Cloudflare, abre Workers & Pages › break-panel › Settings › Domains & Routes.
2. Agrega tu dominio, por ejemplo `panel.tudominio.com`.
3. Cambia la dirección en Publicar de cada app y vuelve a publicar su .zip.

No desactives la dirección `.workers.dev`: las fotos que ya se subieron la usan.

## Límites del plan gratis

Por día:

| Servicio | Límite gratis |
| --- | --- |
| Workers | 100.000 solicitudes |
| KV | 100.000 lecturas y 1.000 escrituras |

- Cada «Guardar» del dueño son unas 2 escrituras.
- Las apps leen con una copia de 30 segundos en el borde de Cloudflare.
- R2 da 10 GB para fotos.

Alcanza para decenas de locales.

## Probarlo en tu computador, sin Cloudflare

Desde la carpeta del repositorio:

```bash
node worker/local.mjs
```

Abre `http://localhost:8787/panel/antojo` (PIN `123456`) o la administración en `http://localhost:8787/admin` (clave `local`). Todo queda en memoria y se pierde al cerrarlo.

Para probar una app tuya, ponle `http://localhost:8787` como dirección del panel en el estudio. `--app <archivo.html>` la sirve en `/app`.

## Si algo falla

- **«Falta configurar el servidor (KV y secretos)»:** falta el `id` del KV en `wrangler.toml` o alguno de los dos secretos.
- **«Falta configurar el almacenamiento de fotos (R2)»:** crea el depósito `break-fotos` (paso 2).
- **La app no muestra los cambios del dueño:**
  - Revisa en Publicar que la dirección y el nombre corto sean los del local, y que publicaste el .zip nuevo.
  - Los cambios pueden tardar hasta 30 segundos.
- **El dueño olvidó el PIN:** cámbialo en `/admin`.
- **«Clave de administración incorrecta»:** revisa tu `ADMIN_TOKEN`. Para ponerle otra, corre `npx wrangler secret put ADMIN_TOKEN`.
- **«Demasiados intentos»:** el panel bloquea el PIN 15 minutos después de 5 intentos fallidos.
