# Servidor del panel del local: guía completa

Cómo conectar el servidor (Cloudflare Worker), la administración (`/admin`) y el panel del dueño (`/panel/<local>`), paso a paso.

## Cómo encajan las piezas

```
Break Studio (diseño) ──.zip──▶ App del local en Cloudflare Pages ◀── la ven los clientes
        │                              │ al abrir pide su contenido
        └──.json──▶ /admin ──▶ Servidor del panel (Cloudflare Worker) ◀── /panel/<local> ◀── el dueño, con su PIN
```

- **Servidor del panel:** un solo Worker para todos tus locales. Guarda el contenido de cada uno (carta, precios, promos, avisos, horario, agenda, galería, reseñas y fotos).
- **`/admin`:** solo para ti, con tu clave. Ahí creas cada local, eliges su PIN y descargas respaldos.
- **`/panel/<local>`:** para el dueño, con su PIN de 6 números, desde el celular.
- **La app del local:** se publica en Cloudflare Pages y lee su contenido del servidor cada vez que abre.

Los pasos 1 a 5 se hacen **una sola vez**. Los pasos 6 a 9 se repiten **por cada local**.

---

## Parte A · Preparar el servidor (una sola vez)

### Paso 1. Lo que necesitas

1. **Cuenta de Cloudflare:** gratis, en https://dash.cloudflare.com/sign-up.
2. **Node.js 18 o más nuevo:** en https://nodejs.org (versión LTS). Para comprobarlo:

   ```bash
   node --version
   ```

3. **Git:** en https://git-scm.com.
4. **Una tarjeta para activar R2:** el almacenamiento de fotos. No cobra dentro de la capa gratis de 10 GB.

### Paso 2. Bajar el código

El panel está en la rama `claude/serene-shannon-x2u18r`, que todavía no está en la principal:

```bash
git clone -b claude/serene-shannon-x2u18r https://github.com/intirr/break.git
```

```bash
cd break/worker
```

Todos los comandos que siguen se corren dentro de la carpeta `break/worker`.

### Paso 3. Entrar a Cloudflare desde la terminal

```bash
npx wrangler login
```

Se abre el navegador. Acepta los permisos y vuelve a la terminal.

### Paso 4. Crear el almacenamiento

**4a. KV, el contenido de los locales:**

```bash
npx wrangler kv namespace create DATA
```

Muestra algo como `id = "3f9a…"`. Abre `break/worker/wrangler.toml` con cualquier editor de texto y cambia `PEGAR_AQUI_EL_ID_DEL_KV` por ese id. Debe quedar así:

```toml
[[kv_namespaces]]
binding = "DATA"
id = "3f9a…"
```

Si wrangler pregunta si quieres que lo agregue solo, responde que sí y revisa que el `binding` quede como `DATA`, sin otra copia del bloque.

**4b. R2, las fotos:**

1. En el panel de Cloudflare entra a **R2 Object Storage** y actívalo con el plan gratis. Te pide la tarjeta.
2. Crea el depósito de fotos:

   ```bash
   npx wrangler r2 bucket create break-fotos
   ```

### Paso 5. Publicar el servidor y guardar sus claves

**5a. Publicar:**

```bash
npx wrangler deploy
```

- Si es tu primer Worker, wrangler te pide elegir un subdominio `workers.dev`, por ejemplo `intirr`.
- Al terminar muestra la dirección del servidor. Anótala: **`https://break-panel.TU-SUBDOMINIO.workers.dev`**.
- Si la abres ahora dirá «Falta configurar el servidor (KV y secretos)». Es normal: falta 5b.

**5b. Las dos claves secretas.** Genera una clave larga al azar; cada vez que lo corres sale una distinta:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Corre ese comando dos veces, una por cada secreto. Pega cada clave cuando wrangler la pida:

```bash
npx wrangler secret put SESSION_SECRET
```

```bash
npx wrangler secret put ADMIN_TOKEN
```

- **`SESSION_SECRET`:** firma las sesiones y cifra los PIN. No la vuelvas a cambiar: si la cambias, todos los PIN dejan de servir.
- **`ADMIN_TOKEN`:** tu clave de administración. Guárdala en un administrador de contraseñas. Es la que escribirás en `/admin` y nunca se la das a un dueño.

**5c. Comprobar:**

1. Abre `https://break-panel.TU-SUBDOMINIO.workers.dev`: debe decir «Break · servidor del panel del local».
2. Abre `https://break-panel.TU-SUBDOMINIO.workers.dev/admin`, escribe tu `ADMIN_TOKEN` y toca «Entrar». Debe mostrar «Locales: todavía no hay locales en este servidor».

El servidor está listo.

---

## Parte B · Conectar cada local (se repite por local)

### Paso 6. Conectar la app en el estudio

1. Abre Break Studio y la app del local.
2. Ve a **Publicar › Panel del local**.
3. **Dirección del servidor del panel:** `https://break-panel.TU-SUBDOMINIO.workers.dev`, sin `/admin` ni nada después.
4. **Nombre corto del local:** minúsculas, números y guiones, por ejemplo `los-alisos`. Será parte del enlace del dueño y no se cambia después.
5. Debajo aparecen los pasos con los enlaces, y la **Revisión** dice «Conectada al panel del local (los-alisos)». Si sale un aviso, corrige lo que indica.

### Paso 7. Publicar la app en Cloudflare Pages

1. En Publicar, toca **Descargar .zip**.
2. En Cloudflare: **Workers & Pages › Crear › Pages › Subir recursos** (Upload assets). Ponle un nombre, por ejemplo `los-alisos`, y arrastra el `.zip`.
3. Cloudflare te da `https://los-alisos.pages.dev`.
4. Pega esa dirección en Publicar › **QR para las mesas** para sacar el QR.

Si la app ya estaba publicada, sube este `.zip` como **nueva versión** del mismo proyecto. Sin este `.zip` nuevo, la app no sabe que tiene panel.

### Paso 8. Crear el local en la administración

1. En Publicar, toca **Descargar .json**, en «Configuración .json».
2. Abre `https://break-panel.TU-SUBDOMINIO.workers.dev/admin`; el enlace «administración del servidor» de la tarjeta del estudio lleva ahí. Entra con tu `ADMIN_TOKEN`.
3. En **Crear o actualizar un local**, toca **Elegir el archivo .json** y escoge el que acabas de bajar.
4. **Revisa el resumen:** nombre, platos y fotos por subir. El **nombre corto** debe ser el mismo del paso 6. Si sale un aviso amarillo, léelo: casi siempre es que el `.json` se bajó antes de conectar la app.
5. Corrige el **nombre del local** si hace falta.
6. Toca **Generar uno** para el PIN, o escribe 6 números que no sean fáciles de adivinar.
7. Toca **Crear el local**. Las fotos se suben solas («Subiendo fotos 3 de 12…»).
8. Al terminar sale **Local creado**, con el enlace del panel y el PIN. Toca **Copiar enlace y PIN**: el PIN no se vuelve a mostrar.

### Paso 9. Entregar el panel al dueño y probarlo juntos

1. **Entregar el acceso:** mándale al dueño por WhatsApp el enlace (`https://break-panel.TU-SUBDOMINIO.workers.dev/panel/los-alisos`) y el PIN.
2. **Entrar:** que lo abra en su celular. Recomiéndale agregarlo a la pantalla de inicio. Que escriba el PIN.
3. **Probar un cambio:** que cambie un precio o marque un plato como «Agotado hoy» y toque **Guardar cambios**. Debe decir «Guardado».
4. **Ver el cambio:** abre la app (`https://los-alisos.pages.dev`) y recárgala. El cambio aparece en menos de 30 segundos.

Listo: desde ahora el dueño cambia su carta, promos, menú del día, avisos, horario, festivos, agenda, galería, reseñas y fotos, sin que tengas que volver a publicar.

---

## Parte C · El día a día

| Quieres… | Dónde | Cómo |
| --- | --- | --- |
| Cambiar el diseño (colores, módulos, portada) | Estudio + Pages + `/admin` | Edita la app, sube el `.zip` nuevo a Pages, baja el `.json` y súbelo en `/admin` con **Actualizar el local**. Lo que cambió el dueño no se toca. |
| Volver a la carta del estudio, borrando lo del dueño | `/admin` | Igual que arriba, pero marca **Reemplazar también el contenido**. |
| Seguir diseñando con lo último del dueño | `/admin` + estudio | **Descargar respaldo** del local y luego, en el estudio, Publicar › **Importar .json**. |
| El dueño olvidó el PIN | `/admin` | **Locales › Cambiar PIN**. Se cierran sus sesiones abiertas. |
| Deshacer un error del dueño | Panel | **Deshacer último guardado**. El servidor guarda 10 versiones. |
| Agregar otro local | Estudio + `/admin` | Repite los pasos 6 a 9 con otro nombre corto. Es el mismo servidor. |
| Actualizar el servidor cuando haya mejoras | Terminal, en `break/worker` | `git pull` y luego `npx wrangler deploy`. Los datos y las claves se conservan. |

---

## Parte D · Si algo falla

| Lo que ves | Qué pasa | Qué hacer |
| --- | --- | --- |
| «Falta configurar el servidor (KV y secretos)» | Falta el id del KV o un secreto | Revisa los pasos 4a y 5b y vuelve a correr `npx wrangler deploy`. |
| «Falta configurar el almacenamiento de fotos (R2)» | No existe el depósito | Paso 4b. |
| «Clave de administración incorrecta» | `ADMIN_TOKEN` distinto | Pon una nueva con `npx wrangler secret put ADMIN_TOKEN`. |
| El dueño ve «Esta dirección no corresponde a ningún local» | Enlace mal copiado | Debe terminar en `/panel/<nombre-corto>`. |
| «No existe ese local» al poner el PIN | El local no se creó o tiene otro nombre corto | Paso 8, con el mismo nombre corto del paso 6. |
| «Demasiados intentos» | 5 PIN fallidos | Esperar 15 minutos, o cambiar el PIN en `/admin`. |
| La app no muestra los cambios | No se publicó el `.zip` conectado, o los nombres cortos no coinciden | Revisa Publicar › Panel del local, vuelve a subir el `.zip` (paso 7) y espera 30 segundos. |
| Aviso amarillo en `/admin`: «no está conectada al panel» | El `.json` se bajó antes del paso 6 | Haz el paso 6 y vuelve a descargar el `.json` y el `.zip`. |
| No se ve una foto vieja | Se desactivó la dirección `workers.dev` | No la desactives: las fotos subidas la usan. |

## Probarlo antes en tu computador (opcional, sin Cloudflare)

En la carpeta `break`:

```bash
node worker/local.mjs
```

- **Administración:** `http://localhost:8787/admin`, con la clave `local`.
- **Panel de ejemplo:** `http://localhost:8787/panel/antojo`, con el PIN `123456`.
- **Para probar tu app:** en Publicar pon `http://localhost:8787` como dirección. Todo se borra al cerrar.
