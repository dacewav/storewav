# ❌ ERRORES COMUNES Y SOLUCIONES

> Cuando algo falle, buscar aquí ANTES de preguntar a la IA.
> Si encuentras un error nuevo, agrégalo aquí.

---

## Firebase

### "Firebase: No such document/collection"
**Causa:** La colección no existe en Firebase o las reglas bloquean la lectura.
**Solución:** Verificar en Firebase Console que la colección existe. Verificar reglas de seguridad.

### "Permission denied"
**Causa:** Reglas de Firebase impiden la operación.
**Solución:** Verificar que las reglas permiten lectura pública para beats/settings, y escritura solo para auth.

### "Firebase config error"
**Causa:** `.env` no tiene las variables correctas o no se cargan.
**Solución:** Verificar que `.env` existe y tiene `PUBLIC_FIREBASE_*` (el prefijo `PUBLIC_` es obligatorio en SvelteKit para exponer al cliente).

### "onValue no actualiza la UI"
**Causa:** El store no está suscrito correctamente o el componente no reacciona.
**Solución:** En Svelte, usar `$store` syntax para reactividad automática. Verificar que el store es writable/readable de `svelte/store`.

---

## SvelteKit

### "500 Internal Server Error"
**Causa:** Error en el servidor (SSR). Puede ser import incorrecto de Firebase en server-side.
**Solución:** Firebase solo funciona en el cliente. Usar `browser` check o importar dinámicamente:
```ts
import { browser } from '$app/environment';
if (browser) { /* init firebase */ }
```

### "Cannot find module"
**Causa:** `npm install` no se ejecutó o falta una dependencia.
**Solución:** `npm install` y verificar `package.json`.

### "Hydration mismatch"
**Causa:** El HTML del servidor no coincide con el del cliente.
**Solución:** Asegurar que los datos que renderizan componentes están disponibles en ambos lados, o usar `{#if browser}` para contenido que depende del cliente.

### Layout no se aplica
**Causa:** `+layout.svelte` no está en la ruta correcta o hay un `+layout.svelte` que sobreescribe.
**Solución:** Verificar jerarquía de layouts. El de `src/routes/+layout.svelte` aplica a todas las páginas.

---

## Build & Deploy

### `npm run build` falla
**Causa:** Error de TypeScript, import roto, o componente con error.
**Solución:** Leer el error. Normalmente dice el archivo y la línea. Ir ahí y arreglar.

### Cloudflare Pages deploy falla
**Causa:** Output directory incorrecto o falta adapter.
**Solución:** Instalar `@sveltejs/adapter-cloudflare` y configurar en `svelte.config.js`:
```js
import adapter from '@sveltejs/adapter-cloudflare';
export default { kit: { adapter: adapter() } };
```

### "Function exceeded time limit"
**Causa:** Server-side function toma demasiado (>10s en Cloudflare).
**Solución:** Mover lógica al cliente o usar streaming.

---

## Audio / Player

### Audio no reproduce
**Causa:** CORS, URL incorrecta, o autoplay bloqueado por el navegador.
**Solución:** Verificar URL en nueva pestaña. Usar click del usuario para iniciar play (navegadores bloquean autoplay).

### Waveform no se muestra
**Causa:** Audio no se carga o canvas no está listo.
**Solución:** Verificar que el audio URL es accesible. Verificar que el canvas existe en el DOM antes de dibujar.

---

## Admin

### Login no funciona
**Causa:** Google Auth no configurado en Firebase Console.
**Solución:** Firebase Console → Authentication → Sign-in method → Google → Enable.

### Upload falla
**Causa:** Storage rules bloquean o archivo muy grande.
**Solución:** Verificar Storage rules en Firebase Console. Verificar límites de tamaño.

### Cambios no se reflejan en tienda
**Causa:** El listener `onValue` no está activo o apunta a la ruta incorrecta de Firebase.
**Solución:** Verificar que la tienda tiene `onValue(ref(db, 'settings/...'))` y que el admin escribe en la misma ruta.

---

## CSS / Diseño

### Variables CSS no se aplican
**Causa:** El selector `:root` no tiene las variables o se sobreescriben.
**Solución:** Verificar que `tokens.css` se importa ANTES que otros estilos. Verificar especificidad.

### Responsive roto
**Causa:** Media queries no coinciden o faltan.
**Solución:** Usar mobile-first (estilos base = móvil, media queries para pantallas más grandes).

### Animación no funciona
**Causa:** Keyframes no definidos o nombre incorrecto.
**Solución:** Verificar que `@keyframes nombre-exacto` existe.

---

## Git

### "Permission denied (publickey)"
**Causa:** SSH key no configurada.
**Solución:** Usar HTTPS en lugar de SSH, o configurar SSH key.

### Merge conflict
**Causa:** Dos chats trabajaron en el mismo archivo.
**Solución:** Resolver manualmente. Preferir la versión más reciente si no hay duda.

### Push rechazado
**Causa:** El remote tiene cambios que no tenemos.
**Solución:** `git pull --rebase origin main` antes de push.

---

*Última actualización: 2026-04-19*
